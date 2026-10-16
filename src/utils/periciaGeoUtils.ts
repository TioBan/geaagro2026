import JSZip from 'jszip';
import { PericiaPontoGPS, PericiaCoordenadas } from '../types/pericia';

export interface KMLFeature {
  id: string;
  name: string;
  description?: string;
  type: 'Polygon' | 'LineString' | 'Point' | 'MultiGeometry';
  points: PericiaPontoGPS[];
  areaHa: number;
  areaM2: number;
  perimeterM: number;
}

const EARTH_RADIUS = 6378137; // WGS84 / SIRGAS 2000 Earth radius in meters

/**
 * Calculates geodetic distance between two lat/lng coordinates in meters (Haversine formula)
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

/**
 * Calculates total perimeter of an array of points in meters
 */
export function calculatePerimeter(points: { lat: number; lng: number }[]): number {
  if (points.length < 2) return 0;
  let perimeter = 0;
  for (let i = 0; i < points.length; i++) {
    const nextIdx = (i + 1) % points.length;
    // Don't close if only 2 points
    if (points.length === 2 && nextIdx === 0) continue;
    perimeter += calculateHaversineDistance(
      points[i].lat,
      points[i].lng,
      points[nextIdx].lat,
      points[nextIdx].lng
    );
  }
  return Math.round(perimeter * 10) / 10;
}

/**
 * Calculates spherical polygon area in hectares and square meters using spherical excess formula
 */
export function calculatePolygonArea(points: { lat: number; lng: number }[]): {
  areaM2: number;
  areaHa: number;
} {
  if (points.length < 3) return { areaM2: 0, areaHa: 0 };

  const numPoints = points.length;
  let total = 0;

  for (let i = 0; i < numPoints; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % numPoints];

    const lat1Rad = (p1.lat * Math.PI) / 180;
    const lat2Rad = (p2.lat * Math.PI) / 180;
    const lng1Rad = (p1.lng * Math.PI) / 180;
    const lng2Rad = (p2.lng * Math.PI) / 180;

    total += (lng2Rad - lng1Rad) * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }

  const areaM2 = Math.abs((total * EARTH_RADIUS * EARTH_RADIUS) / 2.0);
  const areaHa = areaM2 / 10000;

  return {
    areaM2: Math.round(areaM2 * 100) / 100,
    areaHa: Math.round(areaHa * 100) / 100,
  };
}

/**
 * Calculates geometric centroid
 */
export function calculateCentroid(points: { lat: number; lng: number }[]): PericiaCoordenadas {
  if (points.length === 0) {
    return { lat: -16.1482, lng: -47.5192 };
  }
  const sumLat = points.reduce((acc, p) => acc + p.lat, 0);
  const sumLng = points.reduce((acc, p) => acc + p.lng, 0);
  return {
    lat: Number((sumLat / points.length).toFixed(6)),
    lng: Number((sumLng / points.length).toFixed(6)),
  };
}

/**
 * Formats Decimal Degrees into Degrees Minutes Seconds (GMS)
 * e.g., -16.1482 -> 16°08'53.5" S
 */
export function decimalToGms(deg: number, isLat: boolean): string {
  const direction = isLat ? (deg >= 0 ? 'N' : 'S') : deg >= 0 ? 'E' : 'W';
  const absDeg = Math.abs(deg);
  const degrees = Math.floor(absDeg);
  const minutesDec = (absDeg - degrees) * 60;
  const minutes = Math.floor(minutesDec);
  const seconds = ((minutesDec - minutes) * 60).toFixed(2);

  return `${degrees}°${minutes.toString().padStart(2, '0')}'${seconds.padStart(5, '0')}" ${direction}`;
}

/**
 * Converts Degrees Minutes Seconds (GMS) string to Decimal Degrees
 * Supports formats:
 * - 16°08'53.5" S
 * - 16 08 53.5 S
 * - -16° 08' 53.5"
 */
export function gmsToDecimal(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Direct number check
  const directNum = Number(trimmed.replace(',', '.'));
  if (!isNaN(directNum) && directNum >= -180 && directNum <= 180) {
    return directNum;
  }

  // Regex pattern for D° M' S" Dir
  const regex = /([+-]?\d+)[°\s]+(\d+)['\s]+([\d.]+)(?:["\s]+)?([NSEWnsew])?/;
  const match = trimmed.match(regex);
  if (match) {
    const deg = Math.abs(parseFloat(match[1]));
    const min = parseFloat(match[2]);
    const sec = parseFloat(match[3]);
    const dir = match[4]?.toUpperCase();

    let dd = deg + min / 60 + sec / 3600;
    if (trimmed.startsWith('-') || dir === 'S' || dir === 'W') {
      dd = -dd;
    }
    return Number(dd.toFixed(6));
  }
  return null;
}

/**
 * Parses raw text coordinate blocks (e.g. pasted list from Excel, Word, GPS)
 */
export function parsePastedCoordinates(text: string): PericiaPontoGPS[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const results: PericiaPontoGPS[] = [];

  lines.forEach((line, index) => {
    // Replace commas used as decimal separators if line uses semicolon or tab or spaces as delimiter
    let cleanLine = line;
    if (cleanLine.includes(';') || cleanLine.includes('\t') || cleanLine.split(/\s+/).length >= 2) {
      // e.g. "-16,1482; -47,5192"
      cleanLine = cleanLine.replace(/;/g, ' ').replace(/\t/g, ' ');
    }

    // Try splitting by comma, tab or space
    const tokens = cleanLine.split(/[,\t\s]+/).filter(Boolean);
    if (tokens.length < 2) return;

    let pName = `V-${String(results.length + 1).padStart(2, '0')}`;
    let lat: number | null = null;
    let lng: number | null = null;
    let alt = 0;

    // Detect if first token is an identifier like P01 or V1
    const firstIsText = isNaN(Number(tokens[0].replace(',', '.')));

    if (firstIsText) {
      pName = tokens[0];
      lat = Number(tokens[1].replace(',', '.'));
      lng = Number(tokens[2].replace(',', '.'));
      if (tokens[3]) alt = Number(tokens[3].replace(',', '.')) || 0;
    } else {
      // Check if lat/lng or lng/lat (standard Brazil: Lat ~ -10 to -33, Lng ~ -35 to -73)
      const num1 = Number(tokens[0].replace(',', '.'));
      const num2 = Number(tokens[1].replace(',', '.'));
      if (tokens[2]) alt = Number(tokens[2].replace(',', '.')) || 0;

      // Swap if user provided longitude first (common in GIS: Lng, Lat)
      if (num1 < -30 && num1 > -75 && num2 > -35 && num2 < 6) {
        lng = num1;
        lat = num2;
      } else {
        lat = num1;
        lng = num2;
      }
    }

    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      results.push({
        id: `p-${Date.now()}-${results.length}-${Math.random().toString(36).substring(2, 5)}`,
        identificador: pName,
        tipo: 'vertice_perimetro',
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        altitude: alt > 0 ? Number(alt.toFixed(1)) : undefined,
        descricao: 'Ponto importado manualmente',
      });
    }
  });

  return results;
}

/**
export interface KMLFeature {
  id: string;
  name: string;
  description?: string;
  type: 'Polygon' | 'LineString' | 'Point' | 'MultiGeometry';
  points: PericiaPontoGPS[];
  areaHa: number;
  areaM2: number;
  perimeterM: number;
}

/**
 * Universal coordinate parser for KML / GML / WKT text
 * Supports `lng,lat[,alt]` with flexible whitespace, newlines, tabs, and inverted coordinates detection
 */
export function parseCoordinatesUniversal(coordStr: string): { lng: number; lat: number; alt?: number }[] {
  if (!coordStr || typeof coordStr !== 'string') return [];

  const coords: { lng: number; lat: number; alt?: number }[] = [];

  // Match `number,number(,number)?` with optional spaces around comma
  const tupleRegex = /([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s*,\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)(?:\s*,\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?))?/g;
  let match;

  while ((match = tupleRegex.exec(coordStr)) !== null) {
    let lng = parseFloat(match[1]);
    let lat = parseFloat(match[2]);
    const alt = match[3] !== undefined ? parseFloat(match[3]) : undefined;

    // Check if coordinates were inadvertently inverted (lat, lng where abs(lng) > 90)
    if (Math.abs(lng) <= 90 && Math.abs(lat) > 90) {
      const temp = lng;
      lng = lat;
      lat = temp;
    }

    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      coords.push({ lng, lat, alt });
    }
  }

  // Fallback: If tupleRegex didn't catch anything, try whitespace tokens split
  if (coords.length === 0) {
    const tokens = coordStr.trim().split(/\s+/);
    for (const token of tokens) {
      const parts = token.split(',').map(p => parseFloat(p.trim()));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        let lng = parts[0];
        let lat = parts[1];
        const alt = !isNaN(parts[2]) ? parts[2] : undefined;

        if (Math.abs(lng) <= 90 && Math.abs(lat) > 90) {
          const temp = lng;
          lng = lat;
          lat = temp;
        }

        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          coords.push({ lng, lat, alt });
        }
      }
    }
  }

  return coords;
}

/**
 * Parses KML file content and extracts all polygon vertices, features, and placemarks
 */
export function parseKML(kmlText: string): {
  points: PericiaPontoGPS[];
  name?: string;
  description?: string;
  features: KMLFeature[];
} {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(kmlText, 'text/xml');
  const points: PericiaPontoGPS[] = [];
  const features: KMLFeature[] = [];

  const docName = xmlDoc.getElementsByTagName('name')[0]?.textContent?.trim() || 'Perímetro KML';
  const docDesc = xmlDoc.getElementsByTagName('description')[0]?.textContent?.trim() || '';

  // 1. Process all Placemarks
  const placemarks = Array.from(xmlDoc.getElementsByTagName('Placemark'));

  if (placemarks.length > 0) {
    placemarks.forEach((pm, pmIdx) => {
      const name = pm.getElementsByTagName('name')[0]?.textContent?.trim() || `Talhão / Gleba ${pmIdx + 1}`;
      const desc = pm.getElementsByTagName('description')[0]?.textContent?.trim() || '';

      // Check for Polygons in Placemark
      const pmPolys = Array.from(pm.getElementsByTagName('Polygon'));
      if (pmPolys.length > 0) {
        pmPolys.forEach((poly, polyIdx) => {
          const outerBoundary = poly.getElementsByTagName('outerBoundaryIs')[0] || poly;
          const coordEl = outerBoundary.getElementsByTagName('coordinates')[0];
          if (coordEl && coordEl.textContent) {
            const rawCoords = parseCoordinatesUniversal(coordEl.textContent);
            if (rawCoords.length >= 3) {
              const closedCoords =
                rawCoords[0].lat === rawCoords[rawCoords.length - 1].lat &&
                rawCoords[0].lng === rawCoords[rawCoords.length - 1].lng
                  ? rawCoords.slice(0, rawCoords.length - 1)
                  : rawCoords;

              const featPoints: PericiaPontoGPS[] = closedCoords.map((c, vIdx) => ({
                id: `kml-f${pmIdx}-p${polyIdx}-v${vIdx + 1}-${Date.now()}`,
                identificador: `V-${String(vIdx + 1).padStart(2, '0')}`,
                tipo: 'vertice_perimetro',
                lat: Number(c.lat.toFixed(6)),
                lng: Number(c.lng.toFixed(6)),
                altitude: c.alt,
                descricao: `Vértice ${vIdx + 1} de "${name}"`,
              }));

              const { areaHa, areaM2 } = calculatePolygonArea(closedCoords);
              const perimeterM = calculatePerimeter(closedCoords);

              features.push({
                id: `feat-poly-${pmIdx}-${polyIdx}-${Date.now()}`,
                name: pmPolys.length > 1 ? `${name} (Parte ${polyIdx + 1})` : name,
                description: desc,
                type: 'Polygon',
                points: featPoints,
                areaHa,
                areaM2,
                perimeterM,
              });
            }
          }
        });
        return;
      }

      // Check for LineString in Placemark
      const pmLines = Array.from(pm.getElementsByTagName('LineString'));
      if (pmLines.length > 0) {
        pmLines.forEach((line, lineIdx) => {
          const coordEl = line.getElementsByTagName('coordinates')[0];
          if (coordEl && coordEl.textContent) {
            const rawCoords = parseCoordinatesUniversal(coordEl.textContent);
            if (rawCoords.length >= 2) {
              const featPoints: PericiaPontoGPS[] = rawCoords.map((c, vIdx) => ({
                id: `kml-f${pmIdx}-l${lineIdx}-v${vIdx + 1}-${Date.now()}`,
                identificador: `L-${String(vIdx + 1).padStart(2, '0')}`,
                tipo: 'vertice_perimetro',
                lat: Number(c.lat.toFixed(6)),
                lng: Number(c.lng.toFixed(6)),
                altitude: c.alt,
                descricao: `Ponto da Linha ${vIdx + 1} de "${name}"`,
              }));

              const perimeterM = calculatePerimeter(rawCoords);

              features.push({
                id: `feat-line-${pmIdx}-${lineIdx}-${Date.now()}`,
                name: pmLines.length > 1 ? `${name} (Trecho ${lineIdx + 1})` : name,
                description: desc,
                type: 'LineString',
                points: featPoints,
                areaHa: 0,
                areaM2: 0,
                perimeterM,
              });
            }
          }
        });
        return;
      }

      // Check for Point in Placemark
      const pointEl = pm.getElementsByTagName('Point')[0];
      if (pointEl) {
        const coordEl = pointEl.getElementsByTagName('coordinates')[0];
        if (coordEl && coordEl.textContent) {
          const rawCoords = parseCoordinatesUniversal(coordEl.textContent);
          if (rawCoords.length > 0) {
            const pt = rawCoords[0];
            const ptPoint: PericiaPontoGPS = {
              id: `kml-pt-${pmIdx}-${Date.now()}`,
              identificador: name || `P-${String(pmIdx + 1).padStart(2, '0')}`,
              tipo: 'ponto_amostra',
              lat: Number(pt.lat.toFixed(6)),
              lng: Number(pt.lng.toFixed(6)),
              altitude: pt.alt,
              descricao: desc || `Ponto de interesse KML: ${name}`,
            };

            features.push({
              id: `feat-pt-${pmIdx}-${Date.now()}`,
              name,
              description: desc,
              type: 'Point',
              points: [ptPoint],
              areaHa: 0,
              areaM2: 0,
              perimeterM: 0,
            });
          }
        }
      }
    });
  }

  // 2. Global fallback for any Polygons not wrapped in Placemark
  if (features.length === 0) {
    const rawPolygons = Array.from(xmlDoc.getElementsByTagName('Polygon'));
    rawPolygons.forEach((poly, polyIdx) => {
      const outerBoundary = poly.getElementsByTagName('outerBoundaryIs')[0] || poly;
      const coordEl = outerBoundary.getElementsByTagName('coordinates')[0];
      if (coordEl && coordEl.textContent) {
        const rawCoords = parseCoordinatesUniversal(coordEl.textContent);
        if (rawCoords.length >= 3) {
          const closedCoords =
            rawCoords[0].lat === rawCoords[rawCoords.length - 1].lat &&
            rawCoords[0].lng === rawCoords[rawCoords.length - 1].lng
              ? rawCoords.slice(0, rawCoords.length - 1)
              : rawCoords;

          const featPoints: PericiaPontoGPS[] = closedCoords.map((c, vIdx) => ({
            id: `kml-raw-poly-${polyIdx}-v${vIdx + 1}-${Date.now()}`,
            identificador: `V-${String(vIdx + 1).padStart(2, '0')}`,
            tipo: 'vertice_perimetro',
            lat: Number(c.lat.toFixed(6)),
            lng: Number(c.lng.toFixed(6)),
            altitude: c.alt,
            descricao: `Vértice do Polígono ${polyIdx + 1}`,
          }));

          const { areaHa, areaM2 } = calculatePolygonArea(closedCoords);
          const perimeterM = calculatePerimeter(closedCoords);

          features.push({
            id: `feat-raw-poly-${polyIdx}-${Date.now()}`,
            name: `Polígono de Perímetro ${polyIdx + 1}`,
            description: docDesc,
            type: 'Polygon',
            points: featPoints,
            areaHa,
            areaM2,
            perimeterM,
          });
        }
      }
    });
  }

  // 3. Populate default points list:
  // Prefer the largest polygon or first polygon with points, or all points combined
  const polygonFeatures = features.filter(f => f.type === 'Polygon' && f.points.length >= 3);
  if (polygonFeatures.length > 0) {
    // Sort by area descending so the primary perimeter is first
    const primaryPoly = [...polygonFeatures].sort((a, b) => b.areaHa - a.areaHa)[0];
    points.push(...primaryPoly.points);
  } else {
    // Combine all points from features
    features.forEach(f => points.push(...f.points));
  }

  return { points, name: docName, description: docDesc, features };
}

/**
 * Parses GeoJSON object or text
 */
export function parseGeoJSON(geoJsonText: string): PericiaPontoGPS[] {
  const points: PericiaPontoGPS[] = [];
  try {
    const data = typeof geoJsonText === 'string' ? JSON.parse(geoJsonText) : geoJsonText;

    const extractFromCoords = (coordsList: any[], typeName: string) => {
      coordsList.forEach((c: any, idx: number) => {
        if (Array.isArray(c) && c.length >= 2) {
          // GeoJSON is [lng, lat, alt]
          const lng = parseFloat(c[0]);
          const lat = parseFloat(c[1]);
          const alt = c[2] ? parseFloat(c[2]) : undefined;
          if (!isNaN(lat) && !isNaN(lng)) {
            points.push({
              id: `geojson-${idx + 1}-${Date.now()}`,
              identificador: `V-${String(idx + 1).padStart(2, '0')}`,
              tipo: 'vertice_perimetro',
              lat: Number(lat.toFixed(6)),
              lng: Number(lng.toFixed(6)),
              altitude: alt,
              descricao: `Vértice ${typeName} GeoJSON`,
            });
          }
        }
      });
    };

    const processFeature = (feature: any) => {
      const geom = feature.geometry || feature;
      if (!geom) return;

      if (geom.type === 'Polygon' && Array.isArray(geom.coordinates)) {
        // Outer ring is coordinates[0]
        const ring = geom.coordinates[0];
        // Remove closing point if duplicate
        const cleanRing =
          ring.length > 3 &&
          ring[0][0] === ring[ring.length - 1][0] &&
          ring[0][1] === ring[ring.length - 1][1]
            ? ring.slice(0, ring.length - 1)
            : ring;
        extractFromCoords(cleanRing, 'Polígono');
      } else if (geom.type === 'MultiPolygon' && Array.isArray(geom.coordinates)) {
        const ring = geom.coordinates[0]?.[0] || [];
        extractFromCoords(ring, 'MultiPolígono');
      } else if (geom.type === 'LineString' && Array.isArray(geom.coordinates)) {
        extractFromCoords(geom.coordinates, 'Linha');
      } else if (geom.type === 'Point' && Array.isArray(geom.coordinates)) {
        points.push({
          id: `geojson-pt-${Date.now()}`,
          identificador: feature.properties?.name || `P-${points.length + 1}`,
          tipo: 'ponto_amostra',
          lat: Number(parseFloat(geom.coordinates[1]).toFixed(6)),
          lng: Number(parseFloat(geom.coordinates[0]).toFixed(6)),
          altitude: geom.coordinates[2] ? parseFloat(geom.coordinates[2]) : undefined,
          descricao: feature.properties?.description || 'Ponto GeoJSON',
        });
      }
    };

    if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
      data.features.forEach((f: any) => processFeature(f));
    } else if (data.type === 'Feature') {
      processFeature(data);
    } else {
      processFeature(data);
    }
  } catch (err) {
    console.error('Erro ao processar GeoJSON:', err);
  }

  return points;
}

/**
 * Parses GPX text
 */
export function parseGPX(gpxText: string): PericiaPontoGPS[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(gpxText, 'text/xml');
  const points: PericiaPontoGPS[] = [];

  const trkpts = xmlDoc.getElementsByTagName('trkpt');
  if (trkpts.length > 0) {
    for (let i = 0; i < trkpts.length; i++) {
      const pt = trkpts[i];
      const lat = parseFloat(pt.getAttribute('lat') || '');
      const lon = parseFloat(pt.getAttribute('lon') || '');
      const ele = pt.getElementsByTagName('ele')[0]?.textContent;
      if (!isNaN(lat) && !isNaN(lon)) {
        points.push({
          id: `gpx-trk-${i + 1}-${Date.now()}`,
          identificador: `V-${String(i + 1).padStart(2, '0')}`,
          tipo: 'vertice_perimetro',
          lat: Number(lat.toFixed(6)),
          lng: Number(lon.toFixed(6)),
          altitude: ele ? parseFloat(ele) : undefined,
          descricao: `Trackpoint GPX (${i + 1})`,
        });
      }
    }
  }

  const wpts = xmlDoc.getElementsByTagName('wpt');
  if (wpts.length > 0 && points.length === 0) {
    for (let i = 0; i < wpts.length; i++) {
      const pt = wpts[i];
      const lat = parseFloat(pt.getAttribute('lat') || '');
      const lon = parseFloat(pt.getAttribute('lon') || '');
      const name = pt.getElementsByTagName('name')[0]?.textContent;
      const ele = pt.getElementsByTagName('ele')[0]?.textContent;
      if (!isNaN(lat) && !isNaN(lon)) {
        points.push({
          id: `gpx-wpt-${i + 1}-${Date.now()}`,
          identificador: name || `P-${String(i + 1).padStart(2, '0')}`,
          tipo: 'ponto_amostra',
          lat: Number(lat.toFixed(6)),
          lng: Number(lon.toFixed(6)),
          altitude: ele ? parseFloat(ele) : undefined,
          descricao: 'Waypoint GPX de receptor',
        });
      }
    }
  }

  return points;
}

/**
 * Generates KML string for download
 */
export function generateKMLString(
  points: PericiaPontoGPS[],
  propertyName: string,
  talhaoName?: string
): string {
  const polygonPoints = points.filter(p => p.tipo === 'vertice_perimetro');
  const otherPoints = points.filter(p => p.tipo !== 'vertice_perimetro');

  // Closed polygon coordinates in lng,lat,alt format
  let polygonCoordinates = '';
  if (polygonPoints.length >= 3) {
    const list = [...polygonPoints, polygonPoints[0]];
    polygonCoordinates = list.map(p => `${p.lng},${p.lat},${p.altitude || 0}`).join(' ');
  }

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${propertyName} - ${talhaoName || 'Talhão Periciado'}</name>
    <description>Levantamento Georreferenciado Pericial Rural - AgroNutri Laudos Periciais</description>
    <Style id="perimetroStyle">
      <LineStyle>
        <color>ff10b981</color>
        <width>3</width>
      </LineStyle>
      <PolyStyle>
        <color>4010b981</color>
      </PolyStyle>
    </Style>
    <Style id="pontoStyle">
      <IconStyle>
        <scale>1.1</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/grn-circle.png</href>
        </Icon>
      </IconStyle>
    </Style>
    ${
      polygonCoordinates
        ? `
    <Placemark>
      <name>Delimitação do Talhão (${propertyName})</name>
      <styleUrl>#perimetroStyle</styleUrl>
      <Polygon>
        <extrude>1</extrude>
        <altitudeMode>clampToGround</altitudeMode>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              ${polygonCoordinates}
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>`
        : ''
    }
    ${points
      .map(
        p => `
    <Placemark>
      <name>${p.identificador} (${p.tipo})</name>
      <description>${p.descricao || ''} - Lat: ${p.lat}, Lng: ${p.lng}, Alt: ${p.altitude || 0}m</description>
      <styleUrl>#pontoStyle</styleUrl>
      <Point>
        <coordinates>${p.lng},${p.lat},${p.altitude || 0}</coordinates>
      </Point>
    </Placemark>`
      )
      .join('\n')}
  </Document>
</kml>`;

  return kml;
}

/**
 * Generates standard GeoJSON string for download
 */
export function generateGeoJSONString(
  points: PericiaPontoGPS[],
  propertyName: string,
  talhaoName?: string
): string {
  const polygonPoints = points.filter(p => p.tipo === 'vertice_perimetro');

  const features: any[] = [];

  if (polygonPoints.length >= 3) {
    const ring = [...polygonPoints, polygonPoints[0]].map(p => [p.lng, p.lat, p.altitude || 0]);
    features.push({
      type: 'Feature',
      properties: {
        nome: `${propertyName} - ${talhaoName || 'Polígono Periciado'}`,
        tipo: 'Talhão Periciado',
        areaHa: calculatePolygonArea(polygonPoints).areaHa,
        perimetroMeters: calculatePerimeter(polygonPoints),
      },
      geometry: {
        type: 'Polygon',
        coordinates: [ring],
      },
    });
  }

  points.forEach(p => {
    features.push({
      type: 'Feature',
      properties: {
        identificador: p.identificador,
        tipo: p.tipo,
        descricao: p.descricao,
        altitude: p.altitude,
      },
      geometry: {
        type: 'Point',
        coordinates: [p.lng, p.lat, p.altitude || 0],
      },
    });
  });

  return JSON.stringify(
    {
      type: 'FeatureCollection',
      name: `${propertyName}_Georreferenciamento`,
      features,
    },
    null,
    2
  );
}

/**
 * Generates CSV string of vertices
 */
export function generateVerticesCSV(points: PericiaPontoGPS[]): string {
  const header = 'Ponto;Tipo;Latitude;Longitude;Altitude_m;Latitude_GMS;Longitude_GMS;Descricao\n';
  const rows = points
    .map(p => {
      const latGms = decimalToGms(p.lat, true);
      const lngGms = decimalToGms(p.lng, false);
      return `"${p.identificador}";"${p.tipo}";${p.lat};${p.lng};${p.altitude || ''};"${latGms}";"${lngGms}";"${p.descricao || ''}"`;
    })
    .join('\n');
  return header + rows;
}

/**
 * Converts UTM (SIRGAS 2000 / WGS84) coordinates to Decimal Degrees
 */
export function utmToDecimal(
  easting: number,
  northing: number,
  zone: number,
  isSouth: boolean = true
): { lat: number; lng: number } {
  const k0 = 0.9996;
  const a = 6378137.0; // WGS84 semi-major axis
  const e1sq = 0.00669437999014;
  const ePrimeSq = e1sq / (1.0 - e1sq);

  const x = easting - 500000.0;
  let y = northing;
  if (isSouth) {
    y -= 10000000.0;
  }

  const m = y / k0;
  const mu = m / (a * (1.0 - e1sq / 4.0 - (3.0 * e1sq * e1sq) / 64.0 - (5.0 * Math.pow(e1sq, 3)) / 256.0));

  const e1 = (1.0 - Math.sqrt(1.0 - e1sq)) / (1.0 + Math.sqrt(1.0 - e1sq));
  const j1 = (3.0 * e1) / 2.0 - (27.0 * Math.pow(e1, 3)) / 32.0;
  const j2 = (21.0 * Math.pow(e1, 2)) / 16.0 - (55.0 * Math.pow(e1, 4)) / 32.0;
  const j3 = (151.0 * Math.pow(e1, 3)) / 96.0;
  const j4 = (1097.0 * Math.pow(e1, 4)) / 512.0;

  const fp = mu + j1 * Math.sin(2.0 * mu) + j2 * Math.sin(4.0 * mu) + j3 * Math.sin(6.0 * mu) + j4 * Math.sin(8.0 * mu);

  const c1 = ePrimeSq * Math.pow(Math.cos(fp), 2);
  const t1 = Math.pow(Math.tan(fp), 2);
  const r1 = (a * (1.0 - e1sq)) / Math.pow(1.0 - e1sq * Math.pow(Math.sin(fp), 2), 1.5);
  const n1 = a / Math.sqrt(1.0 - e1sq * Math.pow(Math.sin(fp), 2));

  const d = x / (n1 * k0);

  // Latitude
  let lat =
    fp -
    ((n1 * Math.tan(fp)) / r1) *
      (Math.pow(d, 2) / 2.0 -
        ((5.0 + 3.0 * t1 + 10.0 * c1 - 4.0 * Math.pow(c1, 2) - 9.0 * ePrimeSq) * Math.pow(d, 4)) / 24.0 +
        ((61.0 + 90.0 * t1 + 298.0 * c1 + 45.0 * Math.pow(t1, 2) - 252.0 * ePrimeSq - 3.0 * Math.pow(c1, 2)) *
          Math.pow(d, 6)) /
          720.0);
  lat = (lat * 180.0) / Math.PI;

  // Longitude
  let lng =
    (d -
      ((1.0 + 2.0 * t1 + c1) * Math.pow(d, 3)) / 6.0 +
      ((5.0 - 2.0 * c1 + 28.0 * t1 - 3.0 * Math.pow(c1, 2) + 8.0 * ePrimeSq + 24.0 * Math.pow(t1, 2)) *
        Math.pow(d, 5)) /
        120.0) /
    Math.cos(fp);
  lng = (lng * 180.0) / Math.PI;

  const centralMeridian = (zone - 1) * 6 - 180 + 3;
  lng += centralMeridian;

  return {
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6)),
  };
}

/**
 * Converts Decimal Degrees to UTM (SIRGAS 2000 / WGS84)
 */
export function decimalToUtm(
  lat: number,
  lng: number
): { easting: number; northing: number; zone: number; hemisphere: 'S' | 'N' } {
  const k0 = 0.9996;
  const a = 6378137.0;
  const e1sq = 0.00669437999014;
  const ePrimeSq = e1sq / (1.0 - e1sq);

  const zone = Math.floor((lng + 180) / 6) + 1;
  const centralMeridian = (zone - 1) * 6 - 180 + 3;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const centralRad = (centralMeridian * Math.PI) / 180;

  const n = a / Math.sqrt(1 - e1sq * Math.sin(latRad) * Math.sin(latRad));
  const t = Math.tan(latRad) * Math.tan(latRad);
  const c = ePrimeSq * Math.cos(latRad) * Math.cos(latRad);
  const aCoeff = Math.cos(latRad) * (lngRad - centralRad);

  const m =
    a *
    ((1 - e1sq / 4 - (3 * e1sq * e1sq) / 64 - (5 * Math.pow(e1sq, 3)) / 256) * latRad -
      ((3 * e1sq) / 8 + (3 * e1sq * e1sq) / 32 + (45 * Math.pow(e1sq, 3)) / 1024) * Math.sin(2 * latRad) +
      ((15 * e1sq * e1sq) / 256 + (45 * Math.pow(e1sq, 3)) / 1024) * Math.sin(4 * latRad) -
      ((35 * Math.pow(e1sq, 3)) / 3072) * Math.sin(6 * latRad));

  const easting =
    k0 *
      n *
      (aCoeff +
        ((1 - t + c) * Math.pow(aCoeff, 3)) / 6 +
        ((5 - 18 * t + t * t + 72 * c - 58 * ePrimeSq) * Math.pow(aCoeff, 5)) / 120) +
    500000;

  let northing =
    k0 *
    (m +
      n *
        Math.tan(latRad) *
        (Math.pow(aCoeff, 2) / 2 +
          ((5 - t + 9 * c + 4 * c * c) * Math.pow(aCoeff, 4)) / 24 +
          ((61 - 58 * t + t * t + 600 * c - 330 * ePrimeSq) * Math.pow(aCoeff, 6)) / 720));

  const isSouth = lat < 0;
  if (isSouth) {
    northing += 10000000;
  }

  return {
    easting: Math.round(easting * 100) / 100,
    northing: Math.round(northing * 100) / 100,
    zone,
    hemisphere: isSouth ? 'S' : 'N',
  };
}

/**
 * Parses KMZ file buffer, extracts doc.kml and returns points and features
 */
export async function parseKMZ(
  fileData: ArrayBuffer | Blob
): Promise<{ points: PericiaPontoGPS[]; name?: string; description?: string; features: KMLFeature[] }> {
  const zip = await JSZip.loadAsync(fileData);
  // Find primary kml file (often doc.kml or any .kml file)
  const kmlFileNames = Object.keys(zip.files).filter(name => name.toLowerCase().endsWith('.kml') && !name.startsWith('__MACOSX'));
  
  if (kmlFileNames.length === 0) {
    throw new Error('Nenhum arquivo KML válido encontrado dentro do pacote KMZ compactado.');
  }

  // Prioritize doc.kml if exists, otherwise first kml
  const chosenFile = kmlFileNames.find(n => n.toLowerCase().endsWith('doc.kml')) || kmlFileNames[0];
  const kmlText = await zip.file(chosenFile)!.async('text');
  
  return parseKML(kmlText);
}

/**
 * Parses UTM tabular text (Easting, Northing, [Altitude], [Zone])
 */
export function parseUTMPastedCoordinates(
  text: string,
  defaultZone: number = 22,
  isSouth: boolean = true
): PericiaPontoGPS[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const results: PericiaPontoGPS[] = [];

  lines.forEach(line => {
    let cleanLine = line.replace(/;/g, ' ').replace(/\t/g, ' ');
    const tokens = cleanLine.split(/[,\t\s]+/).filter(Boolean);
    if (tokens.length < 2) return;

    let pName = `V-${String(results.length + 1).padStart(2, '0')}`;
    let easting: number | null = null;
    let northing: number | null = null;
    let alt = 0;
    let zone = defaultZone;

    const firstIsText = isNaN(Number(tokens[0].replace(',', '.')));
    let tokenIdx = 0;
    if (firstIsText) {
      pName = tokens[0];
      tokenIdx = 1;
    }

    const val1 = Number(tokens[tokenIdx]?.replace(',', '.'));
    const val2 = Number(tokens[tokenIdx + 1]?.replace(',', '.'));
    const val3 = tokens[tokenIdx + 2] ? Number(tokens[tokenIdx + 2].replace(',', '.')) : 0;

    // In Brazil UTM: Easting is ~ 100,000 to 900,000; Northing is ~ 6,000,000 to 10,000,000
    if (val1 > 5000000 && val2 < 1000000) {
      northing = val1;
      easting = val2;
      alt = val3 || 0;
    } else {
      easting = val1;
      northing = val2;
      alt = val3 || 0;
    }

    if (easting && northing && !isNaN(easting) && !isNaN(northing)) {
      const dec = utmToDecimal(easting, northing, zone, isSouth);
      results.push({
        id: `utm-${Date.now()}-${results.length}-${Math.random().toString(36).substring(2, 5)}`,
        identificador: pName,
        tipo: 'vertice_perimetro',
        lat: dec.lat,
        lng: dec.lng,
        altitude: alt > 0 ? Number(alt.toFixed(1)) : undefined,
        descricao: `Vértice UTM: E=${easting.toFixed(1)}, N=${northing.toFixed(1)}, Fuso ${zone}S`,
      });
    }
  });

  return results;
}

