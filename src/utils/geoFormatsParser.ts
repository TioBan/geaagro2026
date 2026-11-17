/**
 * Utilitário para importação e exportação de dados geográficos
 * Suporta GeoJSON, KML (Google Earth / INCRA) e GPX (GPS Garmin / Mobile)
 */

import { CoordenadaGps, PontoInteresseVistoria } from '../types/avaliacaoImoveis';

export interface GeoFeaturePoint {
  nome: string;
  descricao?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface GeoPolygon {
  nome: string;
  coordenadas: [number, number][]; // [lon, lat]
}

export interface GeoParsedData {
  pontos: GeoFeaturePoint[];
  poligonos: GeoPolygon[];
}

/**
 * Parser para arquivo GeoJSON
 */
export function parseGeoJSON(text: string): GeoParsedData {
  const result: GeoParsedData = { pontos: [], poligonos: [] };
  try {
    const json = JSON.parse(text);
    const features = json.type === 'FeatureCollection' ? json.features : [json];

    for (const f of features) {
      const geom = f.geometry;
      const props = f.properties || {};
      const nome = props.nome || props.name || props.title || 'Ponto Importado';
      const descricao = props.descricao || props.description || '';

      if (!geom) continue;

      if (geom.type === 'Point' && Array.isArray(geom.coordinates)) {
        result.pontos.push({
          nome,
          descricao,
          longitude: geom.coordinates[0],
          latitude: geom.coordinates[1],
          altitude: geom.coordinates[2]
        });
      } else if (geom.type === 'Polygon' && Array.isArray(geom.coordinates)) {
        const ring = geom.coordinates[0];
        if (Array.isArray(ring)) {
          result.poligonos.push({
            nome,
            coordenadas: ring.map((pt: number[]) => [pt[0], pt[1]])
          });
        }
      }
    }
  } catch (err) {
    console.error('Falha ao processar GeoJSON:', err);
  }
  return result;
}

/**
 * Parser para arquivo KML simples (XML)
 */
export function parseKML(text: string): GeoParsedData {
  const result: GeoParsedData = { pontos: [], poligonos: [] };
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');

    const placemarks = doc.querySelectorAll('Placemark');
    placemarks.forEach((pm) => {
      const name = pm.querySelector('name')?.textContent || 'Ponto KML';
      const desc = pm.querySelector('description')?.textContent || '';

      // Point
      const pointCoord = pm.querySelector('Point coordinates')?.textContent?.trim();
      if (pointCoord) {
        const parts = pointCoord.split(',').map((p) => parseFloat(p.trim()));
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          result.pontos.push({
            nome: name,
            descricao: desc,
            longitude: parts[0],
            latitude: parts[1],
            altitude: parts[2]
          });
        }
      }

      // Polygon
      const polyCoord = pm.querySelector('Polygon coordinates')?.textContent?.trim();
      if (polyCoord) {
        const coordsRaw = polyCoord.split(/\s+/);
        const ring: [number, number][] = [];
        coordsRaw.forEach((raw) => {
          const parts = raw.split(',').map((p) => parseFloat(p.trim()));
          if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            ring.push([parts[0], parts[1]]);
          }
        });
        if (ring.length > 0) {
          result.poligonos.push({
            nome: name,
            coordenadas: ring
          });
        }
      }
    });
  } catch (err) {
    console.error('Falha ao processar KML:', err);
  }
  return result;
}

/**
 * Parser para arquivo GPX simples (waypoints wpt)
 */
export function parseGPX(text: string): GeoParsedData {
  const result: GeoParsedData = { pontos: [], poligonos: [] };
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/xml');

    const wpts = doc.querySelectorAll('wpt');
    wpts.forEach((wpt) => {
      const lat = parseFloat(wpt.getAttribute('lat') || '0');
      const lon = parseFloat(wpt.getAttribute('lon') || '0');
      const name = wpt.querySelector('name')?.textContent || 'Ponto GPX';
      const desc = wpt.querySelector('desc')?.textContent || '';
      const ele = parseFloat(wpt.querySelector('ele')?.textContent || '0');

      if (!isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0)) {
        result.pontos.push({
          nome: name,
          descricao: desc,
          latitude: lat,
          longitude: lon,
          altitude: isNaN(ele) ? undefined : ele
        });
      }
    });
  } catch (err) {
    console.error('Falha ao processar GPX:', err);
  }
  return result;
}

/**
 * Exporta pontos de vistoria para GeoJSON
 */
export function exportarPontosVistoriaParaGeoJSON(pontos: PontoInteresseVistoria[], propNome: string): string {
  const features = pontos.map((pt) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [pt.coordenadas.longitude, pt.coordenadas.latitude, pt.coordenadas.altitude || 0]
    },
    properties: {
      id: pt.id,
      nome: pt.nome,
      categoria: pt.categoria,
      descricao: pt.descricao,
      propriedade: propNome
    }
  }));

  return JSON.stringify(
    {
      type: 'FeatureCollection',
      metadata: {
        geradoPor: 'GeaAgro Avaliação de Imóveis Rurais - NBR 14653-3',
        propriedade: propNome,
        dataCriacao: new Date().toISOString()
      },
      features
    },
    null,
    2
  );
}

/**
 * Exporta pontos para KML (compatível com Google Earth e QGIS)
 */
export function exportarPontosParaKML(pontos: PontoInteresseVistoria[], propNome: string): string {
  const placemarksXml = pontos
    .map(
      (p) => `
    <Placemark>
      <name><![CDATA[${p.nome}]]></name>
      <description><![CDATA[Categoria: ${p.categoria} | ${p.descricao}]]></description>
      <Point>
        <coordinates>${p.coordenadas.longitude},${p.coordenadas.latitude},${p.coordenadas.altitude || 0}</coordinates>
      </Point>
    </Placemark>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name><![CDATA[Pontos de Vistoria - ${propNome}]]></name>
    <description><![CDATA[Levantamento pericial GeaAgro NBR 14653-3]]></description>
    ${placemarksXml}
  </Document>
</kml>`;
}

/**
 * Exporta pontos para GPX (compatível com GPS Garmin, Locus, etc.)
 */
export function exportarPontosParaGPX(pontos: PontoInteresseVistoria[], propNome: string): string {
  const wptsXml = pontos
    .map(
      (p) => `
  <wpt lat="${p.coordenadas.latitude}" lon="${p.coordenadas.longitude}">
    <ele>${p.coordenadas.altitude || 0}</ele>
    <name><![CDATA[${p.nome}]]></name>
    <desc><![CDATA[${p.descricao}]]></desc>
    <type>${p.categoria}</type>
  </wpt>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="GeaAgro Rural Engine" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name><![CDATA[Vistoria - ${propNome}]]></name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  ${wptsXml}
</gpx>`;
}

/**
 * Dispara download do arquivo no navegador
 */
export function downloadArquivoTexto(conteudo: string, nomeArquivo: string, mimeType: string = 'application/json') {
  const blob = new Blob([conteudo], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
