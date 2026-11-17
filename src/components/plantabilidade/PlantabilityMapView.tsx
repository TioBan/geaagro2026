import React, { useState, useMemo } from 'react';
import { PropertyField, PlantabilitySamplingPoint, SeedingConfig } from '../../types/plantability';
import { calculatePlantabilityMetrics } from '../../utils/plantabilityCalculations';
import {
  MapPin,
  Layers,
  Compass,
  Sparkles,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Navigation,
  Crosshair,
  Map,
} from 'lucide-react';
import {
  AgroOpenStreetMap,
  MapPolygonItem,
  MapMarkerItem,
} from '../common/AgroOpenStreetMap';
import { reverseGeocodeNominatim } from '../../data/brazilianAgroCities';

interface Props {
  fields: PropertyField[];
  samplings: PlantabilitySamplingPoint[];
  configs: SeedingConfig[];
  onSaveField?: (field: PropertyField) => void;
}

export const PlantabilityMapView: React.FC<Props> = ({
  fields = [],
  samplings = [],
  configs = [],
  onSaveField,
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string>(fields?.[0]?.id || '');
  const [mapLayer, setMapLayer] = useState<'plantability' | 'speed' | 'depth'>('plantability');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeField = (fields || []).find(f => f?.id === selectedFieldId) || fields?.[0];
  const fieldSamplings = samplings.filter(s => s.fieldId === activeField?.id);
  const activeConfig = configs.find(c => c.fieldId === activeField?.id);
  const metrics = calculatePlantabilityMetrics(fieldSamplings, activeConfig);

  // Active City and State for OpenStreetMap centering
  const activeCity = activeField?.municipio || 'Sorriso';
  const activeUf = activeField?.estado || 'MT';

  // 1. OPENSTREETMAP POLYGONS: Propriedade e Talhões
  const osmPolygons: MapPolygonItem[] = useMemo(() => {
    const list: MapPolygonItem[] = [];
    if (!fields || fields.length === 0) return list;

    // Base coordinates: from active field or default Sorriso-MT agro center
    const baseLat = activeField?.latitude || -12.5448;
    const baseLng = activeField?.longitude || -55.7214;

    // Farm Property Boundary (Integração da Propriedade)
    const farmName = activeField?.farmName || 'Fazenda Modelo';
    const delta = 0.015;
    const farmPoints: Array<[number, number]> = [
      [baseLat - delta * 0.8, baseLng - delta],
      [baseLat + delta * 0.9, baseLng - delta * 0.8],
      [baseLat + delta, baseLng + delta * 0.9],
      [baseLat - delta * 0.9, baseLng + delta],
    ];

    list.push({
      id: 'farm-boundary-poly',
      name: `Limite da Propriedade — ${farmName}`,
      subtitle: `${farmName} • ${activeCity}/${activeUf} • Gestão de Plantio`,
      areaHa: fields.reduce((acc, f) => acc + (Number(f.areaHa) || 0), 0) || 450,
      points: farmPoints,
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.1,
      data: { type: 'propriedade', dashed: true },
    });

    // Individual Talhões (Integração com Talhões)
    fields.forEach((field, fIdx) => {
      const fOffset = (fIdx % 3) * 0.005;
      const fRow = Math.floor(fIdx / 3) * 0.005;
      const fSize = 0.004;

      const fPoints: Array<[number, number]> = [
        [baseLat - delta * 0.4 + fRow, baseLng - delta * 0.5 + fOffset],
        [baseLat - delta * 0.4 + fRow + fSize, baseLng - delta * 0.5 + fOffset],
        [baseLat - delta * 0.4 + fRow + fSize, baseLng - delta * 0.5 + fOffset + fSize],
        [baseLat - delta * 0.4 + fRow, baseLng - delta * 0.5 + fOffset + fSize],
      ];

      // Calculate color based on mapLayer
      const fSamplings = samplings.filter(s => s.fieldId === field.id);
      const fConfig = configs.find(c => c.fieldId === field.id);
      const fMetrics = calculatePlantabilityMetrics(fSamplings, fConfig);

      let polyColor = '#10b981'; // Green (default)
      let subtitle = '';

      if (mapLayer === 'plantability') {
        if (fMetrics.igpScore >= 90) polyColor = '#10b981'; // Excelente
        else if (fMetrics.igpScore >= 80) polyColor = '#3b82f6'; // Bom
        else if (fMetrics.igpScore >= 70) polyColor = '#f59e0b'; // Regular
        else polyColor = '#f43f5e'; // Crítico
        subtitle = `IGP: ${fMetrics.igpScore} | CV: ${fMetrics.cvPercent}% • ${field.crop}`;
      } else if (mapLayer === 'speed') {
        const speed = fConfig ? fConfig.targetSpeedKmH : 6.5;
        polyColor = speed <= 6.0 ? '#10b981' : speed <= 7.5 ? '#f59e0b' : '#f43f5e';
        subtitle = `Velocidade Semeadora: ${speed} km/h • ${field.crop}`;
      } else {
        const depth = fConfig ? fConfig.targetDepthCm : 4.0;
        polyColor = depth >= 3.5 && depth <= 4.5 ? '#10b981' : '#3b82f6';
        subtitle = `Profundidade Alvo: ${depth} cm • ${field.crop}`;
      }

      const isSelected = selectedFieldId === field.id;

      list.push({
        id: `field-poly-${field.id}`,
        name: `${field.fieldCode} — ${field.crop} (${field.cultivar || 'Padrão'})`,
        subtitle,
        areaHa: field.areaHa,
        points: fPoints,
        color: isSelected ? '#ffffff' : polyColor,
        fillColor: polyColor,
        fillOpacity: isSelected ? 0.5 : 0.35,
        data: { type: 'talhao', fieldId: field.id },
      });
    });

    return list;
  }, [fields, samplings, configs, activeField, selectedFieldId, mapLayer, activeCity, activeUf]);

  // 2. OPENSTREETMAP MARKERS: Pontos de Amostragem no Talhão
  const osmMarkers: MapMarkerItem[] = useMemo(() => {
    const list: MapMarkerItem[] = [];

    const baseLat = activeField?.latitude || -12.5448;
    const baseLng = activeField?.longitude || -55.7214;

    // Farm Headquarters Marker
    list.push({
      id: 'farm-headquarters',
      label: activeField?.farmName || 'Sede da Fazenda',
      lat: baseLat,
      lng: baseLng,
      type: 'sede',
      details: `${activeField?.farmName} • ${activeCity}/${activeUf}`,
    });

    // Sampling Points
    fieldSamplings.forEach((s, idx) => {
      // Calculate micro-offset for sampling markers within active field
      const pLat = s.latitude || baseLat + 0.001 * ((idx % 3) + 1);
      const pLng = s.longitude || baseLng + 0.001 * (Math.floor(idx / 3) + 1);

      const pMetrics = calculatePlantabilityMetrics([s], activeConfig);

      list.push({
        id: `sampling-mark-${s.id}`,
        label: s.pointCode,
        lat: pLat,
        lng: pLng,
        type: 'amostra',
        details: `IGP: ${pMetrics.igpScore} | CV: ${pMetrics.cvPercent}% | Espaçamentos: ${s.actualSpacingsCm?.length || 0} medidos`,
      });
    });

    return list;
  }, [fieldSamplings, activeField, activeConfig, activeCity, activeUf]);

  // Handle City Selected via OpenStreetMap Search
  const handleCitySelected = (city: { name: string; state: string; lat: number; lng: number }) => {
    if (activeField && onSaveField) {
      onSaveField({
        ...activeField,
        municipio: city.name,
        estado: city.state,
        latitude: city.lat,
        longitude: city.lng,
      });
    }
    showToast(`Cidade atualizada para ${city.name} - ${city.state}!`);
  };

  // Handle Live GPS: "Pelo GPS já cai na cidade automaticamente"
  const handleGpsLocated = (loc: { lat: number; lng: number; city: string; uf: string; accuracy: number }) => {
    if (activeField && onSaveField) {
      onSaveField({
        ...activeField,
        municipio: loc.city,
        estado: loc.uf,
        latitude: loc.lat,
        longitude: loc.lng,
      });
    }
    showToast(`📍 GPS detectado: ${loc.city} - ${loc.uf} (±${loc.accuracy}m)! Cidade atualizada automaticamente!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-500/40 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600" />
            Mapa Interativo de Plantabilidade &amp; Zonas de Qualidade
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Visualização geoespacial com OpenStreetMap, limites da propriedade, contorno de talhões e pontos de amostragem.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs font-bold">
            <button
              onClick={() => setMapLayer('plantability')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mapLayer === 'plantability' ? 'bg-emerald-600 text-white shadow' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Plantabilidade
            </button>
            <button
              onClick={() => setMapLayer('speed')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mapLayer === 'speed' ? 'bg-emerald-600 text-white shadow' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Velocidade
            </button>
            <button
              onClick={() => setMapLayer('depth')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mapLayer === 'depth' ? 'bg-emerald-600 text-white shadow' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Profundidade
            </button>
          </div>

          <select
            value={selectedFieldId}
            onChange={e => setSelectedFieldId(e.target.value)}
            className="p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-bold text-xs cursor-pointer"
          >
            {fields.map(f => (
              <option key={f.id} value={f.id}>
                {f.fieldCode} - {f.crop} ({f.areaHa} ha)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* QUICK CITY / FARM CONTEXT BAR */}
      <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>
            Fazenda: <strong className="text-emerald-300">{activeField?.farmName || 'Fazenda Principal'}</strong> • Município Informado:{' '}
            <strong className="text-white bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700 font-mono">
              {activeCity} - {activeUf}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-emerald-300">
          <span>Talhão Selecionado: <strong>{activeField?.fieldCode}</strong></span>
          <span>•</span>
          <span>Pontos Coletados: <strong>{fieldSamplings.length}</strong></span>
          <span>•</span>
          <span>IGP Médio: <strong className="text-white">{metrics.igpScore}</strong></span>
        </div>
      </div>

      {/* OPENSTREETMAP INTERACTIVE VIEWER */}
      <AgroOpenStreetMap
        heightClassName="h-[500px]"
        title={`OpenStreetMap — ${activeField?.farmName || 'Fazenda'} • ${activeField?.fieldCode}`}
        subtitle={`Visualização de camadas com satélite de alta resolução, busca e sincronização de cidades (${activeCity}/${activeUf})`}
        currentCity={activeCity}
        currentUf={activeUf}
        polygons={osmPolygons}
        markers={osmMarkers}
        selectedPolygonId={selectedFieldId ? `field-poly-${selectedFieldId}` : null}
        onPolygonClick={poly => {
          if (poly.data?.type === 'talhao') {
            setSelectedFieldId(poly.data.fieldId);
            showToast(`Talhão selecionado: ${poly.name}`);
          } else {
            showToast(poly.name);
          }
        }}
        onMarkerClick={marker => {
          showToast(`Ponto de amostragem: ${marker.label}`);
        }}
        onCitySelected={handleCitySelected}
        onGpsLocated={handleGpsLocated}
        onMapClick={coords => {
          if (activeField && onSaveField) {
            onSaveField({
              ...activeField,
              latitude: coords.lat,
              longitude: coords.lng,
            });
            showToast(`Coordenadas do talhão atualizadas: Lat ${coords.lat}, Lng ${coords.lng}`);
          }
        }}
        allowClickToAddPoint={true}
        clickInstruction="Clique no OpenStreetMap para calibrar ou definir as coordenadas exatas do talhão selecionado."
      />

      {/* Map Legend */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 flex flex-wrap gap-6 text-xs font-mono justify-center items-center shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
          <span>Excelente / Aceitável (IGP ≥ 90)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-xs" />
          <span>Bom (IGP 80 - 89)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
          <span>Atenção (IGP 70 - 79 | CV 25-35%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
          <span>Crítico (Altas Falhas &amp; Duplos | IGP &lt; 70)</span>
        </div>
      </div>
    </div>
  );
};
