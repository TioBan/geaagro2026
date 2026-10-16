import { TraceabilityPlot, TraceabilityLot, TraceabilityProperty } from '../types/traceability';

export interface CustomPOI {
  id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
}

/**
 * Generates an OGC-standard GeoJSON FeatureCollection for all farm plots
 */
export function generateGeoJSONAllPlots(
  plots: TraceabilityPlot[],
  lots: TraceabilityLot[],
  property?: TraceabilityProperty
): string {
  const features = plots
    .filter(p => !!p.croquiData)
    .map(plot => {
      try {
        const vertices: { lat: number; lng: number }[] = JSON.parse(plot.croquiData!);
        if (vertices.length < 3) return null;

        const closed = [...vertices, vertices[0]];
        const plotLots = lots.filter(l => l.plotId === plot.id || l.plotCode === plot.code);
        const hasQuarantine = plotLots.some(l => l.isUnderActiveQuarantine);

        return {
          type: 'Feature' as const,
          properties: {
            id: plot.id,
            code: plot.code,
            name: plot.name,
            area_ha: plot.areaHa || 0,
            crop: plot.currentCrop || 'Sem cultivo',
            cultivar: plot.currentCultivar || '',
            irrigation_system: plot.irrigationSystem || 'sequeiro',
            soil_type: plot.soilType || '',
            property_name: property?.farmName || '',
            active_lots: plotLots.map(l => l.lotCode),
            has_quarantine: hasQuarantine,
            structure_type: plot.structureType || 'campo_aberto',
            centroid_lat: plot.latitude || vertices[0].lat,
            centroid_lng: plot.longitude || vertices[0].lng,
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: [closed.map(c => [c.lng, c.lat])],
          },
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const geojson = {
    type: 'FeatureCollection',
    name: property ? `Talhoes_${property.farmName.replace(/\s+/g, '_')}` : 'Talhoes_GeaAgro',
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
      },
    },
    features,
  };

  return JSON.stringify(geojson, null, 2);
}

/**
 * Generates a GeoJSON Feature for a single plot or drawing
 */
export function generateGeoJSONSinglePlot(
  plot: TraceabilityPlot,
  verticesOverride?: { lat: number; lng: number }[]
): string {
  const vertices = verticesOverride || (plot.croquiData ? JSON.parse(plot.croquiData) : []);
  if (!vertices || vertices.length < 3) {
    throw new Error('Polígono insuficiente de vértices para exportação GeoJSON.');
  }

  const closed = [...vertices, vertices[0]];
  const feature = {
    type: 'Feature',
    properties: {
      id: plot.id,
      code: plot.code,
      name: plot.name,
      area_ha: plot.areaHa,
      crop: plot.currentCrop,
      cultivar: plot.currentCultivar,
      irrigation: plot.irrigationSystem,
      soil_type: plot.soilType,
      exported_at: new Date().toISOString(),
    },
    geometry: {
      type: 'Polygon',
      coordinates: [closed.map((c: any) => [c.lng, c.lat])],
    },
  };

  return JSON.stringify(feature, null, 2);
}

/**
 * Generates standard KML for Google Earth Pro and Agricultural Drones (DJI Agras, XAG, Trimble)
 */
export function generateKMLAllPlots(
  plots: TraceabilityPlot[],
  lots: TraceabilityLot[],
  pois: CustomPOI[] = [],
  property?: TraceabilityProperty
): string {
  let placemarksKml = '';

  plots.forEach(plot => {
    if (!plot.croquiData) return;
    try {
      const vertices: { lat: number; lng: number }[] = JSON.parse(plot.croquiData);
      if (vertices.length < 3) return;

      const coordStr = vertices.map(v => `${v.lng},${v.lat},0`).join(' ');
      const first = vertices[0];
      const finalCoordStr = `${coordStr} ${first.lng},${first.lat},0`;

      const plotLots = lots.filter(l => l.plotId === plot.id || l.plotCode === plot.code);
      const hasQuarantine = plotLots.some(l => l.isUnderActiveQuarantine);
      const lotCodes = plotLots.map(l => l.lotCode).join(', ') || 'Nenhum';

      // Color coding: Red if under quarantine, Emerald otherwise
      const lineColor = hasQuarantine ? 'ff2020ef' : 'ff10b981';
      const polyColor = hasQuarantine ? '602020ef' : '4010b981';

      placemarksKml += `
    <Placemark>
      <name>${plot.code} - ${plot.name}</name>
      <description><![CDATA[
        <div style="font-family: sans-serif; font-size: 13px; line-height: 1.5;">
          <h2 style="color: #059669; margin-bottom: 4px;">Talhão ${plot.code} (${plot.name})</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 8px 0;"/>
          <p><b>Área Geodésica:</b> ${plot.areaHa || 0} ha</p>
          <p><b>Cultura / Cultivar:</b> ${plot.currentCrop || 'Sem cultivo'} (${plot.currentCultivar || '--'})</p>
          <p><b>Sistema de Irrigação:</b> ${plot.irrigationSystem || 'Sequeiro'}</p>
          <p><b>Tipo de Solo:</b> ${plot.soilType || 'Não informado'}</p>
          <p><b>Lotes Ativos:</b> <span style="font-family: monospace; color: #059669;">${lotCodes}</span></p>
          <p><b>Status Fitossanitário:</b> ${hasQuarantine ? '<span style="color: #dc2626; font-weight: bold;">EM CARÊNCIA</span>' : '<span style="color: #16a34a; font-weight: bold;">LIBERADO</span>'}</p>
          <p style="font-size: 10px; color: #94a3b8; margin-top: 10px;">Exportado via GeaAgro SIG - Interoperabilidade OGC / Drones</p>
        </div>
      ]]></description>
      <Style>
        <LineStyle>
          <color>${lineColor}</color>
          <width>3.5</width>
        </LineStyle>
        <PolyStyle>
          <color>${polyColor}</color>
        </PolyStyle>
      </Style>
      <Polygon>
        <extrude>1</extrude>
        <altitudeMode>clampToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${finalCoordStr}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>`;
    } catch (e) {
      console.error('Erro ao formatar KML para o talhão:', plot.id, e);
    }
  });

  // Export custom POIs
  pois.forEach(poi => {
    placemarksKml += `
    <Placemark>
      <name>[POI] ${poi.name}</name>
      <description><![CDATA[
        <div style="font-family: sans-serif; font-size: 12px;">
          <h3>${poi.name}</h3>
          <p><b>Categoria:</b> ${poi.type}</p>
          <p><b>Coordenadas:</b> Lat ${poi.lat.toFixed(6)}, Lng ${poi.lng.toFixed(6)}</p>
        </div>
      ]]></description>
      <Point>
        <coordinates>${poi.lng},${poi.lat},0</coordinates>
      </Point>
    </Placemark>`;
  });

  const propertyName = property?.farmName || 'Fazenda';

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
  <Document>
    <name>Talhões e Georreferenciamento - ${propertyName}</name>
    <open>1</open>
    <description>Polígonos georreferenciados compatíveis com Google Earth Pro, drones agrícolas (DJI Agras T40/T50, XAG, Trimble) e softwares de agricultura de precisão.</description>
    ${placemarksKml}
  </Document>
</kml>`;
}

/**
 * Generates a single plot KML
 */
export function generateKMLSinglePlot(
  plot: TraceabilityPlot,
  verticesOverride?: { lat: number; lng: number }[]
): string {
  const vertices = verticesOverride || (plot.croquiData ? JSON.parse(plot.croquiData) : []);
  if (!vertices || vertices.length < 3) {
    throw new Error('Polígono insuficiente de vértices para exportação KML.');
  }

  const coordStr = vertices.map((v: any) => `${v.lng},${v.lat},0`).join(' ');
  const first = vertices[0];
  const finalCoordStr = `${coordStr} ${first.lng},${first.lat},0`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Talhão ${plot.code} - ${plot.name}</name>
    <Placemark>
      <name>${plot.code} - ${plot.name}</name>
      <description><![CDATA[
        <h3>Talhão ${plot.code}</h3>
        <p><b>Área:</b> ${plot.areaHa} ha</p>
        <p><b>Cultura:</b> ${plot.currentCrop || 'Sem cultivo'}</p>
      ]]></description>
      <Style>
        <LineStyle><color>ff10b981</color><width>3</width></LineStyle>
        <PolyStyle><color>4010b981</color></PolyStyle>
      </Style>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${finalCoordStr}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;
}

/**
 * Downloads a string content as a file to the client's browser
 */
export function triggerFileDownload(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
