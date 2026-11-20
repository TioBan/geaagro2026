import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PropertyField, PlantabilitySamplingPoint, SeedingConfig } from '../../types/plantability';
import { calculatePlantabilityMetrics } from '../../utils/plantabilityCalculations';
import { Compass, CheckCircle2, Building2 } from 'lucide-react';
import {
  AgroOpenStreetMap,
  MapPolygonItem,
  MapMarkerItem
} from '../common/AgroOpenStreetMap';

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
  onSaveField
}) => {
  const safeFields = useMemo(() => (fields || []).filter(f => f && f.id), [fields]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>(safeFields[0]?.id || '');
  const [mapLayer, setMapLayer] = useState<'plantability' | 'speed' | 'depth'>('plantability');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (safeFields.length > 0 && !safeFields.some(f => f.id === selectedFieldId)) {
      setSelectedFieldId(safeFields[0].id);
    }
  }, [safeFields, selectedFieldId]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToastMessage(null), 4000);
  };

  const activeField = safeFields.find(f => f.id === selectedFieldId) || safeFields[0];
  const fieldSamplings = samplings.filter(s => s.fieldId === activeField?.id);
  const activeConfig = configs.find(c => c.fieldId === activeField?.id);
  const metrics = calculatePlantabilityMetrics(fieldSamplings, activeConfig);

  const activeCity = activeField?.municipio || 'Sorriso';
  const activeUf = activeField?.estado || 'MT';

  const osmPolygons: MapPolygonItem[] = useMemo(() => {
    const list: MapPolygonItem[] = [];
    if (safeFields.length === 0) return list;

    const baseLat = activeField?.latitude || -12.5448;
    const baseLng = activeField?.longitude || -55.7214;

    const farmName = activeField?.farmName || 'Fazenda Modelo';
    const delta = 0.015;
    const farmPoints: Array<[number, number]> = [
      [baseLat - delta * 0.8, baseLng - delta],
      [baseLat + delta * 0.9, baseLng - delta * 0.8],
      [baseLat + delta, baseLng + delta * 0.9],
      [baseLat - delta * 0.9, baseLng + delta]
    ];

    list.push({
      id: 'farm-boundary-poly',
      name: `Limite da Propriedade — ${farmName}`,
      subtitle: `${farmName} • ${activeCity}/${activeUf} • Gestão de Plantio`,
      areaHa: safeFields.reduce((acc, f) => acc + (Number(f.areaHa) || 0), 0) || 450,
      points: farmPoints,
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: 0.1,
      data: { type: 'propriedade', dashed: true }
    });

    safeFields.forEach((field, fIdx) => {
      const fOffset = (fIdx % 3) * 0.005;
      const fRow = Math.floor(fIdx / 3) * 0.005;
      const fSize = 0.004;

      const fPoints: Array<[number, number]> = [
        [baseLat - delta * 0.4 + fRow, baseLng - delta * 0.5 + fOffset],
        [baseLat - delta * 0.4 + fRow + fSize, baseLng - delta * 0.5 + fOffset],
        [baseLat - delta * 0.4 + fRow + fSize, baseLng - delta * 0.5 + fOffset + fSize],
        [baseLat - delta * 0.4 + fRow, baseLng - delta * 0.5 + fOffset + fSize]
      ];

      const fSamplings = samplings.filter(s => s.fieldId === field.id);
      const fConfig = configs.find(c => c.fieldId === field.id);
      const fMetrics = calculatePlantabilityMetrics(fSamplings, fConfig);

      let polyColor = '#10b981';
      let subtitle = '';

      if (mapLayer === 'plantability') {
        if (fMetrics.igpScore >= 90) polyColor = '#10b981';
        else if (fMetrics.igpScore >= 80) polyColor = '#3b82f6';
        else if (fMetrics.igpScore >= 70) polyColor = '#f59e0b';
        else polyColor = '#f43f5e';
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
        data: { type: 'talhao', fieldId: field.id }
      });
    });

    return list;
  }, [safeFields, samplings, configs, activeField, selectedFieldId, mapLayer, activeCity, activeUf]);

  const osmMarkers: MapMarkerItem[] = useMemo(() => {
    const list: MapMarkerItem[] = [];
    const baseLat = activeField?.latitude || -12.5448;
    const baseLng = activeField?.longitude || -55.7214;

    list.push({
      id: 'farm-headquarters',
      label: activeField?.farmName || 'Sede da Fazenda',
      lat: baseLat,
      lng: baseLng,
      type: 'sede',
      details: `${activeField?.farmName || 'Sede'} • ${activeCity}/${activeUf}`
    });

    fieldSamplings.forEach((s, idx) => {
      const pLat = s.latitude || baseLat + 0.001 * ((idx % 3) + 1);
      const pLng = s.longitude || baseLng + 0.001 * (Math.floor(idx / 3) + 1);
      const pMetrics = calculatePlantabilityMetrics([s], activeConfig);

      list.push({
        id: `sampling-mark-${s.id}`,
        label: s.pointCode,
        lat: pLat,
        lng: pLng,
        type: 'amostra',
        details: `IGP: ${pMetrics.igpScore} | CV: ${pMetrics.cvPercent}% | Espaçamentos: ${s.actualSpacingsCm?.length || 0} medidos`
      });
    });

    return list;
  }, [fieldSamplings, activeField, activeConfig, activeCity, activeUf]);

  const handleCitySelected = (city: { name: string; state: string; lat: number; lng: number }) => {
    if (activeField && onSaveField) {
      onSaveField({
        ...activeField,
        municipio: city.name,
        estado: city.state,
        latitude: city.lat,
        longitude: city.lng
      });
    }
    showToast(`Cidade atualizada para ${city.name} - ${city.state}.`);
  };

  const handleGpsLocated = (loc: { lat: number; lng: number; city: string; uf: string; accuracy: number }) => {
    if (activeField && onSaveField) {
      onSaveField({
        ...activeField,
        municipio: loc.city,
        estado: loc.uf,
        latitude: loc.lat,
        longitude: loc.lng
      });
    }
    showToast(`GPS detectado: ${loc.city} - ${loc.uf} (±${loc.accuracy} m). Cidade atualizada.`);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-zinc-900 text-white px-3.5 py-2.5 rounded-lg border border-emerald-500/40 text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Mapa Interativo de Plantabilidade & Zonas de Qualidade</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Visualização geoespacial com limites da propriedade, contorno de talhões e pontos de amostragem.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs">
            {(
              [
                { id: 'plantability', label: 'Plantabilidade' },
                { id: 'speed', label: 'Velocidade' },
                { id: 'depth', label: 'Profundidade' }
              ] as const
            ).map(layer => (
              <button
                key={layer.id}
                type="button"
                onClick={() => setMapLayer(layer.id)}
                className={`h-7 px-2.5 rounded-md font-medium transition-colors cursor-pointer ${
                  mapLayer === layer.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>

          <select
            value={selectedFieldId}
            onChange={e => setSelectedFieldId(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-emerald-500 cursor-pointer"
          >
            {safeFields.length === 0 ? (
              <option value="">Nenhum talhão</option>
            ) : (
              safeFields.map(f => (
                <option key={f.id} value={f.id}>
                  {f.fieldCode} - {f.crop} ({f.areaHa} ha)
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* City / Farm Context Bar */}
      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-200 flex-wrap">
          <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Fazenda: <strong className="text-slate-900 dark:text-white">{activeField?.farmName || 'Fazenda Principal'}</strong>
          </span>
          <span className="text-slate-300 dark:text-zinc-700">|</span>
          <span>
            Município:{' '}
            <strong className="text-emerald-800 dark:text-emerald-300 font-semibold">
              {activeCity} - {activeUf}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] tabular-nums text-slate-600 dark:text-zinc-300">
          <span>
            Talhão: <strong className="text-slate-900 dark:text-white">{activeField?.fieldCode || '—'}</strong>
          </span>
          <span className="text-slate-300 dark:text-zinc-700">|</span>
          <span>
            Pontos: <strong className="text-slate-900 dark:text-white">{fieldSamplings.length}</strong>
          </span>
          <span className="text-slate-300 dark:text-zinc-700">|</span>
          <span>
            IGP Médio: <strong className="text-emerald-700 dark:text-emerald-400">{metrics.igpScore}</strong>
          </span>
        </div>
      </div>

      {/* OpenStreetMap Interactive Viewer */}
      <AgroOpenStreetMap
        heightClassName="h-[500px]"
        title={`OpenStreetMap — ${activeField?.farmName || 'Fazenda'} • ${activeField?.fieldCode || 'Mapa Geral'}`}
        subtitle={`Visualização de camadas com satélite, busca e sincronização de cidades (${activeCity}/${activeUf})`}
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
              longitude: coords.lng
            });
            showToast(`Coordenadas do talhão atualizadas: Lat ${coords.lat}, Lng ${coords.lng}`);
          }
        }}
        allowClickToAddPoint={true}
        clickInstruction="Clique no mapa para calibrar ou definir as coordenadas exatas do talhão selecionado."
      />

      {/* Map Legend */}
      <div className="bg-white dark:bg-zinc-900 px-4 py-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 flex flex-wrap gap-5 text-xs text-slate-600 dark:text-zinc-300 justify-center items-center tabular-nums">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span>Excelente (IGP ≥ 90)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
          <span>Bom (IGP 80 – 89)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
          <span>Atenção (IGP 70 – 79)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
          <span>Crítico (IGP &lt; 70)</span>
        </div>
      </div>
    </div>
  );
};
