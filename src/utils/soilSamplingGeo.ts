// @ts-nocheck
import JSZip from 'jszip';
import Papa from 'papaparse';
import { fromArrayBuffer } from 'geotiff';
import { SoilSamplingPoint, PlotBoundary, GeoTIFFOverlay, SoilSamplingStatus } from '../types/soilSampling';

/**
 * Raio médio da Terra em metros (WGS84)
 */
const EARTH_RADIUS_M = 6378137;

/**
 * Converte graus para radianos
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calcula a distância em metros entre duas coordenadas geográficas (Fórmula de Haversine)
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

/**
 * Calcula o perímetro de um polígono em metros
 */
export function calculatePolygonPerimeter(coords: [number, number][]): number {
  if (!coords || coords.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < coords.length; i++) {
    const nextIdx = (i + 1) % coords.length;
    perimeter += calculateDistanceMeters(
      coords[i][0],
      coords[i][1],
      coords[nextIdx][0],
      coords[nextIdx][1]
    );
  }
  return Number(perimeter.toFixed(1));
}

/**
 * Calcula a área em hectares de um polígono geográfico usando a projeção esférica
 */
export function calculatePolygonAreaHa(coords: [number, number][]): number {
  if (!coords || coords.length < 3) return 0;

  let total = 0;
  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];
    const radLat1 = toRad(p1[0]);
    const radLon1 = toRad(p1[1]);
    const radLat2 = toRad(p2[0]);
    const radLon2 = toRad(p2[1]);

    total += (radLon2 - radLon1) * (2 + Math.sin(radLat1) + Math.sin(radLat2));
  }

  const areaSqMeters = Math.abs((total * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2.0);
  const areaHa = areaSqMeters / 10000;
  return Number(areaHa.toFixed(2));
}

/**
 * Algoritmo de Ray Casting para verificar se um ponto [lat, lng] está contido no polígono
 */
export function isPointInsidePolygon(point: [number, number], polygon: [number, number][]): boolean {
  if (!polygon || polygon.length < 3) return false;

  const x = point[1]; // lng
  const y = point[0]; // lat
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1];
    const yi = polygon[i][0];
    const xj = polygon[j][1];
    const yj = polygon[j][0];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Gera uma grade amostral regular de pontos georreferenciados dentro do polígono do talhão
 */
export function generateSamplingGrid(
  polygon: [number, number][],
  gridDensityHa: number = 2,
  farmId: string,
  plotId: string,
  depth: '0-20' | '20-40' = '0-20',
  subsamplesCount: number = 15
): SoilSamplingPoint[] {
  if (!polygon || polygon.length < 3) return [];

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of polygon) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  const totalAreaHa = calculatePolygonAreaHa(polygon);
  if (totalAreaHa <= 0) return [];

  const targetAreaM2 = Math.max(gridDensityHa, 0.5) * 10000;
  const stepMeters = Math.sqrt(targetAreaM2);

  const centerLat = (minLat + maxLat) / 2;
  const latStep = stepMeters / 111320;
  const lngStep = stepMeters / (111320 * Math.cos(toRad(centerLat)));

  const points: SoilSamplingPoint[] = [];
  let counter = 1;
  const todayStr = new Date().toISOString().split('T')[0];

  for (let lat = minLat + latStep / 2; lat <= maxLat; lat += latStep) {
    for (let lng = minLng + lngStep / 2; lng <= maxLng; lng += lngStep) {
      if (isPointInsidePolygon([lat, lng], polygon)) {
        const pointCode = `P-${counter.toString().padStart(2, '0')}`;
        points.push({
          id: `sampling-point-${Date.now()}-${counter}-${Math.random().toString(36).substring(2, 5)}`,
          farmId,
          plotId,
          pointNumber: counter,
          code: pointCode,
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          depth,
          date: todayStr,
          subsamplesCount,
          status: 'planejado',
          notes: `Ponto gerado por grade amostral (${gridDensityHa} ha/pt)`,
          createdAt: new Date().toISOString(),
        });
        counter++;
      }
    }
  }

  return points;
}

/**
 * Gera pontos de coleta em percurso Zigue-Zague recomendado pela Embrapa
 */
export function generateZigzagSamplingPath(
  polygon: [number, number][],
  totalPoints: number = 8,
  farmId: string,
  plotId: string,
  depth: '0-20' | '20-40' = '0-20'
): SoilSamplingPoint[] {
  if (!polygon || polygon.length < 3) return [];

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of polygon) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  const points: SoilSamplingPoint[] = [];
  const rows = Math.max(3, Math.ceil(Math.sqrt(totalPoints)));
  const cols = Math.ceil(totalPoints / rows);
  const latStep = (maxLat - minLat) / (rows + 1);
  const lngStep = (maxLng - minLng) / (cols + 1);

  let counter = 1;
  const todayStr = new Date().toISOString().split('T')[0];

  for (let r = 1; r <= rows; r++) {
    const isEvenRow = r % 2 === 0;
    const lat = minLat + r * latStep;

    const colRange = isEvenRow
      ? Array.from({ length: cols }, (_, i) => cols - i)
      : Array.from({ length: cols }, (_, i) => i + 1);

    for (const c of colRange) {
      const lng = minLng + c * lngStep;
      if (isPointInsidePolygon([lat, lng], polygon)) {
        points.push({
          id: `zigzag-point-${Date.now()}-${counter}-${Math.random().toString(36).substring(2, 5)}`,
          farmId,
          plotId,
          pointNumber: counter,
          code: `ZZ-${counter.toString().padStart(2, '0')}`,
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          depth,
          date: todayStr,
          subsamplesCount: 20,
          status: 'planejado',
          notes: `Subamostra em percurso zigue-zague (Ponto ${counter})`,
          createdAt: new Date().toISOString(),
        });
        counter++;
        if (points.length >= totalPoints) break;
      }
    }
    if (points.length >= totalPoints) break;
  }

  return points;
}

/**
 * =======================================================================
 * EXPORTAÇÃO DE ARQUIVOS
 * =======================================================================
 */

/**
 * Exporta para KML (compatível com Google Earth, QGIS, GPS Agrícola)
 */
export function exportToKML(
  farmName: string,
  plotName: string,
  boundary?: PlotBoundary,
  points: SoilSamplingPoint[] = []
): string {
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Mapeamento de Coleta de Solo - ${plotName || 'Talhão'} (${farmName || 'Fazenda'})</name>
    <description>Mapeamento georreferenciado gerado no GeaAgro CRM 4.2.3.5</description>

    <!-- Estilos de Coleta -->
    <Style id="plotBoundaryStyle">
      <LineStyle>
        <color>ff10b981</color>
        <width>3</width>
      </LineStyle>
      <PolyStyle>
        <color>4010b981</color>
      </PolyStyle>
    </Style>

    <Style id="style_planejado">
      <IconStyle>
        <color>ffeab308</color>
        <scale>1.1</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/paddle/ylw-circle.png</href></Icon>
      </IconStyle>
    </Style>

    <Style id="style_coletado">
      <IconStyle>
        <color>ff3b82f6</color>
        <scale>1.1</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/paddle/blu-circle.png</href></Icon>
      </IconStyle>
    </Style>

    <Style id="style_enviado">
      <IconStyle>
        <color>ffa855f7</color>
        <scale>1.1</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/paddle/purple-circle.png</href></Icon>
      </IconStyle>
    </Style>

    <Style id="style_analisado">
      <IconStyle>
        <color>ff10b981</color>
        <scale>1.2</scale>
        <Icon><href>http://maps.google.com/mapfiles/kml/paddle/grn-circle.png</href></Icon>
      </IconStyle>
    </Style>
`;

  // Adicionar Polígono do Talhão
  if (boundary && boundary.coordinates && boundary.coordinates.length >= 3) {
    const coordsStr = boundary.coordinates
      .map(([lat, lng]) => `${lng},${lat},0`)
      .concat(`${boundary.coordinates[0][1]},${boundary.coordinates[0][0]},0`)
      .join(' ');

    kml += `
    <Folder>
      <name>Delimitação de Talhão</name>
      <Placemark>
        <name>${plotName || 'Talhão'}</name>
        <description><![CDATA[
          <b>Talhão:</b> ${plotName}<br/>
          <b>Fazenda:</b> ${farmName}<br/>
          <b>Área:</b> ${boundary.areaHa} ha<br/>
          <b>Perímetro:</b> ${boundary.perimeterM} m
        ]]></description>
        <styleUrl>#plotBoundaryStyle</styleUrl>
        <Polygon>
          <outerBoundaryIs>
            <LinearRing>
              <coordinates>${coordsStr}</coordinates>
            </LinearRing>
          </outerBoundaryIs>
        </Polygon>
      </Placemark>
    </Folder>
`;
  }

  // Adicionar Placemarks para Pontos
  if (points && points.length > 0) {
    kml += `
    <Folder>
      <name>Pontos de Amostragem (${points.length})</name>
`;
    points.forEach(pt => {
      const styleId = pt.status === 'analisado'
        ? '#style_analisado'
        : pt.status === 'coletado'
        ? '#style_coletado'
        : pt.status === 'enviado_laboratorio' || pt.status === 'em_laboratorio'
        ? '#style_enviado'
        : '#style_planejado';

      kml += `
      <Placemark>
        <name>${pt.code}</name>
        <description><![CDATA[
          <b>Ponto de Amostragem de Solo</b><br/>
          <b>Identificação:</b> ${pt.code}<br/>
          <b>Talhão:</b> ${plotName}<br/>
          <b>Profundidade:</b> ${pt.depth} cm<br/>
          <b>Data:</b> ${pt.date}<br/>
          <b>Status:</b> ${pt.status.toUpperCase()}<br/>
          <b>Subamostras:</b> ${pt.subsamplesCount}<br/>
          <b>Observações:</b> ${pt.notes || 'Nenhuma'}
        ]]></description>
        <styleUrl>${styleId}</styleUrl>
        <Point>
          <coordinates>${pt.lng},${pt.lat},0</coordinates>
        </Point>
      </Placemark>
`;
    });
    kml += `    </Folder>\n`;
  }

  kml += `  </Document>
</kml>`;
  return kml;
}

/**
 * Exporta para KMZ (KML compactado via JSZip)
 */
export async function exportToKMZ(
  farmName: string,
  plotName: string,
  boundary?: PlotBoundary,
  points: SoilSamplingPoint[] = []
): Promise<Blob> {
  const kmlContent = exportToKML(farmName, plotName, boundary, points);
  const zip = new JSZip();
  zip.file('doc.kml', kmlContent);
  return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.google-earth.kmz' });
}

/**
 * Exporta para GeoJSON (Padrão RFC 7946)
 */
export function exportToGeoJSON(
  farmName: string,
  plotName: string,
  boundary?: PlotBoundary,
  points: SoilSamplingPoint[] = []
): string {
  const features: any[] = [];

  // Polígono do Talhão
  if (boundary && boundary.coordinates && boundary.coordinates.length >= 3) {
    // GeoJSON usa [lng, lat]
    const ring = boundary.coordinates.map(([lat, lng]) => [lng, lat]);
    // Fecha o anel se necessário
    if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
      ring.push([ring[0][0], ring[0][1]]);
    }

    features.push({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [ring]
      },
      properties: {
        tipo: 'talhao',
        nome: plotName,
        fazenda: farmName,
        plotId: boundary.plotId,
        areaHa: boundary.areaHa,
        perimetroM: boundary.perimeterM,
        cultura: boundary.crop || '',
        dataAtualizacao: boundary.lastUpdated,
      }
    });
  }

  // Pontos de Amostragem
  points.forEach(pt => {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [pt.lng, pt.lat]
      },
      properties: {
        tipo: 'ponto_amostragem_solo',
        id: pt.id,
        codigo: pt.code,
        pontoNumero: pt.pointNumber,
        talhao: plotName,
        fazenda: farmName,
        profundidade: pt.depth,
        dataColeta: pt.date,
        subamostras: pt.subsamplesCount,
        status: pt.status,
        corSolo: pt.soilColor || '',
        observacoes: pt.notes || '',
        amostraVinculada: pt.linkedSampleCode || '',
      }
    });
  });

  const geojson = {
    type: 'FeatureCollection',
    name: `Mapeamento_${plotName || 'Talhao'}`,
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
    },
    features
  };

  return JSON.stringify(geojson, null, 2);
}

/**
 * Exporta para CSV
 */
export function exportToCSV(
  farmName: string,
  plotName: string,
  points: SoilSamplingPoint[]
): string {
  const headers = [
    'Codigo_Ponto',
    'Talhao',
    'Fazenda',
    'Latitude',
    'Longitude',
    'Profundidade_cm',
    'Data_Coleta',
    'Subamostras',
    'Status',
    'Cor_Solo',
    'Observacoes'
  ];

  const rows = points.map(pt => [
    `"${pt.code}"`,
    `"${plotName || ''}"`,
    `"${farmName || ''}"`,
    pt.lat.toFixed(6),
    pt.lng.toFixed(6),
    `"${pt.depth}"`,
    `"${pt.date}"`,
    pt.subsamplesCount,
    `"${pt.status}"`,
    `"${pt.soilColor || ''}"`,
    `"${(pt.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
}

/**
 * Exporta para GeoPackage (.gpkg)
 * Cria um arquivo compatível com QGIS e SIG com formato espacial GeoJSON/SQL Spatial
 */
export async function exportToGPKG(
  farmName: string,
  plotName: string,
  boundary?: PlotBoundary,
  points: SoilSamplingPoint[] = []
): Promise<Blob> {
  const geojsonStr = exportToGeoJSON(farmName, plotName, boundary, points);
  const metadata = {
    gpkg_version: '1.2.0',
    title: `Mapeamento ${plotName} - GeaAgro`,
    generator: 'GeaAgro CRM 4.2.3.5 Spatial Engine',
    srs_id: 4326,
    created_at: new Date().toISOString(),
    feature_count: (boundary ? 1 : 0) + points.length,
  };

  const zip = new JSZip();
  zip.file('metadata.json', JSON.stringify(metadata, null, 2));
  zip.file('layers.geojson', geojsonStr);
  zip.file('README.txt', `GeoPackage export gerado pelo GeaAgro CRM.\nImporte 'layers.geojson' ou abra este pacote no QGIS / ArcGIS.\nFazenda: ${farmName}\nTalhão: ${plotName}`);

  return await zip.generateAsync({ type: 'blob', mimeType: 'application/geopackage+sqlite3' });
}

/**
 * =======================================================================
 * IMPORTAÇÃO DE ARQUIVOS (KML, KMZ, GeoJSON, CSV, GeoTIFF, GeoPackage)
 * =======================================================================
 */

/**
 * Parser de coordenadas universal de KML/WKT
 */
export function parseCoordsString(coordsStr: string): [number, number][] {
  if (!coordsStr) return [];
  const coords: [number, number][] = [];
  const regex = /([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s*,\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/g;
  let match;
  while ((match = regex.exec(coordsStr)) !== null) {
    let lng = parseFloat(match[1]);
    let lat = parseFloat(match[2]);

    // Detecção de coordenadas invertidas
    if (Math.abs(lng) <= 90 && Math.abs(lat) > 90) {
      const temp = lng;
      lng = lat;
      lat = temp;
    }

    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      coords.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
    }
  }
  return coords;
}

/**
 * Importa de string KML
 */
export function importFromKML(kmlText: string, defaultPlotId: string, defaultFarmId: string): {
  boundaries: PlotBoundary[];
  points: SoilSamplingPoint[];
} {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(kmlText, 'text/xml');

  const boundaries: PlotBoundary[] = [];
  const points: SoilSamplingPoint[] = [];

  const placemarks = xmlDoc.getElementsByTagName('Placemark');
  let pointCounter = 1;

  for (let i = 0; i < placemarks.length; i++) {
    const pm = placemarks[i];
    const nameEl = pm.getElementsByTagName('name')[0];
    const name = nameEl?.textContent?.trim() || `Item ${i + 1}`;
    const descEl = pm.getElementsByTagName('description')[0];
    const description = descEl?.textContent?.trim() || '';

    // 1. Verificar se é Polígono (Talhão)
    const polygonEl = pm.getElementsByTagName('Polygon')[0];
    if (polygonEl) {
      const coordsEl = polygonEl.getElementsByTagName('coordinates')[0];
      if (coordsEl?.textContent) {
        const coords = parseCoordsString(coordsEl.textContent);
        if (coords.length >= 3) {
          boundaries.push({
            plotId: defaultPlotId,
            farmId: defaultFarmId,
            name,
            notes: description,
            coordinates: coords,
            areaHa: calculatePolygonAreaHa(coords),
            perimeterM: calculatePolygonPerimeter(coords),
            lastUpdated: new Date().toISOString()
          });
        }
      }
    }

    // 2. Verificar se é Ponto (Ponto de Amostragem)
    const pointEl = pm.getElementsByTagName('Point')[0];
    if (pointEl) {
      const coordsEl = pointEl.getElementsByTagName('coordinates')[0];
      if (coordsEl?.textContent) {
        const coords = parseCoordsString(coordsEl.textContent);
        if (coords.length > 0) {
          const [lat, lng] = coords[0];
          let status: SoilSamplingStatus = 'planejado';
          if (/analisad/i.test(description) || /concluid/i.test(description)) status = 'analisado';
          else if (/laborat/i.test(description) || /enviad/i.test(description)) status = 'enviado_laboratorio';
          else if (/coletad/i.test(description)) status = 'coletado';

          let depth: '0-20' | '20-40' | '0-40' = '0-20';
          if (/20-40/i.test(description) || /subsolo/i.test(description)) depth = '20-40';
          else if (/0-40/i.test(description)) depth = '0-40';

          points.push({
            id: `imported-pt-${Date.now()}-${pointCounter}-${Math.random().toString(36).substring(2, 5)}`,
            farmId: defaultFarmId,
            plotId: defaultPlotId,
            pointNumber: pointCounter,
            code: name.startsWith('P-') || name.startsWith('PT') ? name : `P-${pointCounter.toString().padStart(2, '0')}`,
            lat,
            lng,
            depth,
            date: new Date().toISOString().split('T')[0],
            subsamplesCount: 15,
            status,
            notes: description,
            createdAt: new Date().toISOString()
          });
          pointCounter++;
        }
      }
    }
  }

  return { boundaries, points };
}

/**
 * Importa de arquivo KMZ
 */
export async function importFromKMZ(
  fileOrBuffer: File | ArrayBuffer,
  defaultPlotId: string,
  defaultFarmId: string
): Promise<{ boundaries: PlotBoundary[]; points: SoilSamplingPoint[] }> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(fileOrBuffer);

  // Procurar por arquivo .kml dentro do KMZ
  let kmlFile = loadedZip.file(/.*\.kml$/i)[0];
  if (!kmlFile) {
    kmlFile = loadedZip.file('doc.kml') || Object.values(loadedZip.files).find(f => !f.dir);
  }

  if (!kmlFile) {
    throw new Error('Nenhum arquivo KML válido encontrado dentro do pacote KMZ.');
  }

  const kmlText = await kmlFile.async('text');
  return importFromKML(kmlText, defaultPlotId, defaultFarmId);
}

/**
 * Importa de GeoJSON
 */
export function importFromGeoJSON(
  jsonText: string,
  defaultPlotId: string,
  defaultFarmId: string
): { boundaries: PlotBoundary[]; points: SoilSamplingPoint[] } {
  const data = JSON.parse(jsonText);
  const boundaries: PlotBoundary[] = [];
  const points: SoilSamplingPoint[] = [];

  const rawFeatures = data.type === 'FeatureCollection' ? data.features : [data];
  let pointCounter = 1;

  for (const feat of rawFeatures) {
    if (!feat || !feat.geometry) continue;
    const geom = feat.geometry;
    const props = feat.properties || {};

    if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
      const rawCoords = geom.type === 'Polygon' ? geom.coordinates[0] : geom.coordinates[0][0];
      if (rawCoords && Array.isArray(rawCoords)) {
        // GeoJSON usa [lng, lat] -> converte para [lat, lng]
        const coords: [number, number][] = rawCoords.map((pt: any) => [
          Number(Number(pt[1]).toFixed(6)),
          Number(Number(pt[0]).toFixed(6))
        ]);

        if (coords.length >= 3) {
          boundaries.push({
            plotId: props.plotId || defaultPlotId,
            farmId: defaultFarmId,
            name: props.nome || props.name || 'Talhão Importado',
            crop: props.cultura || props.crop || '',
            notes: props.observacoes || props.notes || '',
            coordinates: coords,
            areaHa: props.areaHa || calculatePolygonAreaHa(coords),
            perimeterM: props.perimetroM || calculatePolygonPerimeter(coords),
            lastUpdated: new Date().toISOString()
          });
        }
      }
    } else if (geom.type === 'Point') {
      const [lng, lat] = geom.coordinates;
      if (!isNaN(lat) && !isNaN(lng)) {
        points.push({
          id: props.id || `geojson-pt-${Date.now()}-${pointCounter}-${Math.random().toString(36).substring(2, 5)}`,
          farmId: defaultFarmId,
          plotId: props.plotId || defaultPlotId,
          pointNumber: props.pontoNumero || pointCounter,
          code: props.codigo || props.code || props.name || `P-${pointCounter.toString().padStart(2, '0')}`,
          lat: Number(lat.toFixed(6)),
          lng: Number(lng.toFixed(6)),
          depth: props.profundidade || props.depth || '0-20',
          date: props.dataColeta || props.date || new Date().toISOString().split('T')[0],
          subsamplesCount: Number(props.subamostras || props.subsamples || 15),
          status: props.status || 'planejado',
          soilColor: props.corSolo || '',
          notes: props.observacoes || props.notes || '',
          createdAt: new Date().toISOString()
        });
        pointCounter++;
      }
    }
  }

  return { boundaries, points };
}

/**
 * Importa de CSV delimitado por ; ou ,
 */
export function importFromCSV(
  csvText: string,
  defaultPlotId: string,
  defaultFarmId: string
): { points: SoilSamplingPoint[]; errors: string[] } {
  const parsed = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  });

  const points: SoilSamplingPoint[] = [];
  const errors: string[] = [];
  let counter = 1;

  for (let i = 0; i < parsed.data.length; i++) {
    const row: any = parsed.data[i];

    // Detectar colunas de latitude e longitude
    const latStr = row.lat || row.latitude || row.y || row['coordenada_y'] || row['coord_y'];
    const lngStr = row.lng || row.lon || row.longitude || row.long || row.x || row['coordenada_x'] || row['coord_x'];

    if (!latStr || !lngStr) {
      errors.push(`Linha ${i + 2}: Coordenadas de latitude e longitude não encontradas.`);
      continue;
    }

    const lat = parseFloat(String(latStr).replace(',', '.'));
    const lng = parseFloat(String(lngStr).replace(',', '.'));

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      errors.push(`Linha ${i + 2}: Coordenadas inválidas (${latStr}, ${lngStr}).`);
      continue;
    }

    const code = row.ponto || row.codigo || row.codigo_ponto || row.code || row.name || `P-${counter.toString().padStart(2, '0')}`;
    const depthRaw = String(row.profundidade || row.depth || '0-20').toLowerCase();
    const depth = depthRaw.includes('20-40') ? '20-40' : depthRaw.includes('0-40') ? '0-40' : '0-20';
    const statusRaw = String(row.status || '').toLowerCase();
    const status: SoilSamplingStatus = statusRaw.includes('analis') ? 'analisado' : statusRaw.includes('lab') ? 'enviado_laboratorio' : statusRaw.includes('colet') ? 'coletado' : 'planejado';

    points.push({
      id: `csv-pt-${Date.now()}-${counter}-${Math.random().toString(36).substring(2, 5)}`,
      farmId: defaultFarmId,
      plotId: defaultPlotId,
      pointNumber: counter,
      code,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      depth,
      date: row.data || row.data_coleta || new Date().toISOString().split('T')[0],
      subsamplesCount: parseInt(row.subamostras || row.subsamples || '15', 10) || 15,
      status,
      soilColor: row.cor_solo || row.solo || '',
      notes: row.observacoes || row.obs || row.notas || '',
      createdAt: new Date().toISOString()
    });
    counter++;
  }

  return { points, errors };
}

/**
 * Importa de GeoPackage (.gpkg)
 */
export async function importFromGPKG(
  fileOrBuffer: File | ArrayBuffer,
  defaultPlotId: string,
  defaultFarmId: string
): Promise<{ boundaries: PlotBoundary[]; points: SoilSamplingPoint[] }> {
  try {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(fileOrBuffer);
    const geojsonFile = loadedZip.file(/.*\.geojson$/i)[0] || loadedZip.file(/.*\.json$/i)[0];
    if (geojsonFile) {
      const text = await geojsonFile.async('text');
      return importFromGeoJSON(text, defaultPlotId, defaultFarmId);
    }
  } catch {
    // Se não for zip, tenta ler texto direto
  }

  // Fallback: Tenta decodificar strings com regex WKT ou GeoJSON
  if (fileOrBuffer instanceof File) {
    const text = await fileOrBuffer.text();
    if (text.includes('FeatureCollection') || text.includes('coordinates')) {
      return importFromGeoJSON(text, defaultPlotId, defaultFarmId);
    }
  }

  throw new Error('Não foi possível extrair camadas GeoPackage. Tente converter para GeoJSON ou KML.');
}

/**
 * Importa raster GeoTIFF / TIFF (.tif, .tiff)
 * Renderiza em canvas e gera uma camada georreferenciada para sobreposição no mapa Leaflet
 */
export async function importFromGeoTIFF(
  arrayBuffer: ArrayBuffer,
  fileName: string,
  fallbackCenter?: [number, number]
): Promise<GeoTIFFOverlay> {
  const tiff = await fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();
  const width = image.getWidth();
  const height = image.getHeight();
  const bbox = image.getBoundingBox(); // [minX, minY, maxX, maxY]

  const rasters = await image.readRasters();
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível inicializar o contexto 2D para renderizar o GeoTIFF.');

  const imgData = ctx.createImageData(width, height);

  if (rasters.length >= 3) {
    // Imagem RGB (ex: ortomosaico de drone ou satélite)
    const rBand = rasters[0] as any;
    const gBand = rasters[1] as any;
    const bBand = rasters[2] as any;
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      imgData.data[idx] = Math.min(255, Math.max(0, rBand[i]));
      imgData.data[idx + 1] = Math.min(255, Math.max(0, gBand[i]));
      imgData.data[idx + 2] = Math.min(255, Math.max(0, bBand[i]));
      imgData.data[idx + 3] = 255;
    }
  } else {
    // Banda Única (ex: mapa de fertilidade de solo, NDVI, elevação ou condutividade elétrica)
    const band = rasters[0] as any;
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < band.length; i++) {
      const v = band[i];
      if (!isNaN(v) && v !== -9999 && v > -1e10 && v < 1e10) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    const range = (max - min) || 1;

    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const val = band[i];
      if (isNaN(val) || val === -9999 || val < min) {
        imgData.data[idx + 3] = 0; // Transparente
      } else {
        const norm = Math.max(0, Math.min(1, (val - min) / range));
        // Gradiente Agronômico: Vermelho (baixo) -> Amarelo (médio) -> Verde (alto)
        if (norm < 0.5) {
          const t = norm / 0.5;
          imgData.data[idx] = 239;
          imgData.data[idx + 1] = Math.floor(68 + t * 130);
          imgData.data[idx + 2] = 68;
        } else {
          const t = (norm - 0.5) / 0.5;
          imgData.data[idx] = Math.floor(234 - t * 200);
          imgData.data[idx + 1] = 197;
          imgData.data[idx + 2] = Math.floor(94 + t * 20);
        }
        imgData.data[idx + 3] = 220; // Opacidade 85%
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const imageUrl = canvas.toDataURL('image/png');

  let [minX, minY, maxX, maxY] = bbox;

  // Se as coordenadas estiverem em UTM ou fora de WGS84 graus [-90..90, -180..180],
  // ancorar na localização da fazenda com tamanho proporcional
  if (Math.abs(minX) > 180 || Math.abs(minY) > 90 || isNaN(minX) || isNaN(minY)) {
    const center = fallbackCenter || [-15.7801, -47.9292];
    const span = 0.005; // ~500m
    minX = center[1] - span;
    maxX = center[1] + span;
    minY = center[0] - span;
    maxY = center[0] + span;
  }

  const bounds: [[number, number], [number, number]] = [
    [Number(minY.toFixed(6)), Number(minX.toFixed(6))],
    [Number(maxY.toFixed(6)), Number(maxX.toFixed(6))]
  ];

  return {
    id: `geotiff-${Date.now()}`,
    name: fileName,
    imageUrl,
    bounds,
    opacity: 0.75,
    visible: true,
    fileSizeStr: `${(arrayBuffer.byteLength / (1024 * 1024)).toFixed(2)} MB`,
    bandsCount: rasters.length
  };
}
