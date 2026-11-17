import Papa from 'papaparse';
import JSZip from 'jszip';
import { fromArrayBuffer } from 'geotiff';
import { NemaAttachment, NemaAttachmentKind } from '../components/nema-ai/types';

const MAX_INLINE_IMAGE_BYTES = 18 * 1024 * 1024;
const MAX_INLINE_VIDEO_BYTES = 22 * 1024 * 1024;
const MAX_INLINE_PDF_BYTES = 22 * 1024 * 1024;
const MAX_TEXT_EXTRACT_CHARS = 18000;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`Falha ao ler arquivo ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`Falha ao ler texto de ${file.name}.`));
    reader.readAsText(file, 'utf-8');
  });
}

function getExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : '';
}

function detectMimeByExtension(ext: string, fallback: string): string {
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    '3gp': 'video/3gpp',
    avi: 'video/x-msvideo',
    mpeg: 'video/mpeg',
    pdf: 'application/pdf',
    csv: 'text/csv',
    tsv: 'text/tab-separated-values',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    xls: 'application/vnd.ms-excel',
    kml: 'application/vnd.google-earth.kml+xml',
    kmz: 'application/vnd.google-earth.kmz',
    geojson: 'application/geo+json',
    json: 'application/json',
    gpx: 'application/gpx+xml',
    tif: 'image/tiff',
    tiff: 'image/tiff',
  };
  return map[ext] || fallback || 'application/octet-stream';
}

function detectKind(file: File): NemaAttachmentKind | null {
  const ext = getExtension(file.name);
  const mime = (file.type || '').toLowerCase();

  if (mime.startsWith('image/') && ext !== 'tif' && ext !== 'tiff') return 'image';
  if (['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif'].includes(ext)) return 'image';

  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', '3gp', 'mpeg', 'avi'].includes(ext)) {
    return 'video';
  }

  if (mime === 'application/pdf' || ext === 'pdf') return 'pdf';

  if (['csv', 'tsv', 'xlsx', 'ods', 'xls'].includes(ext) || mime.includes('spreadsheet') || mime === 'text/csv') {
    return 'spreadsheet';
  }

  if (['kml', 'kmz', 'geojson', 'json', 'gpx', 'tif', 'tiff'].includes(ext)) {
    return 'geoprocessing';
  }

  return null;
}

function parseColIndex(cellRef: string): number {
  const match = cellRef.match(/^([A-Z]+)/i);
  if (!match) return 0;
  let col = 0;
  const letters = match[1].toUpperCase();
  for (let i = 0; i < letters.length; i++) {
    col = col * 26 + (letters.charCodeAt(i) - 64);
  }
  return col - 1;
}

async function parseXlsxFile(file: File): Promise<{ text: string; summary: string }> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  // Shared strings
  const sharedStrings: string[] = [];
  const ssFile = zip.file('xl/sharedStrings.xml');
  if (ssFile) {
    const ssXml = await ssFile.async('text');
    const doc = new DOMParser().parseFromString(ssXml, 'application/xml');
    const siNodes = Array.from(doc.getElementsByTagName('si'));
    for (const si of siNodes) {
      const tNodes = Array.from(si.getElementsByTagName('t'));
      sharedStrings.push(tNodes.map((n) => n.textContent || '').join(''));
    }
  }

  // Sheet names from workbook.xml
  const sheetNames: string[] = [];
  const wbFile = zip.file('xl/workbook.xml');
  if (wbFile) {
    const wbXml = await wbFile.async('text');
    const wbDoc = new DOMParser().parseFromString(wbXml, 'application/xml');
    Array.from(wbDoc.getElementsByTagName('sheet')).forEach((el) => {
      sheetNames.push(el.getAttribute('name') || `Aba ${sheetNames.length + 1}`);
    });
  }

  const sheetPaths = Object.keys(zip.files)
    .filter((p) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(p))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .slice(0, 3);

  const chunks: string[] = [];
  let totalRows = 0;
  let maxCols = 0;

  for (let sIdx = 0; sIdx < sheetPaths.length; sIdx++) {
    const sheetXml = await zip.file(sheetPaths[sIdx])!.async('text');
    const doc = new DOMParser().parseFromString(sheetXml, 'application/xml');
    const rows = Array.from(doc.getElementsByTagName('row'));
    const sheetTitle = sheetNames[sIdx] || `Planilha ${sIdx + 1}`;
    totalRows += rows.length;

    const formattedRows: string[] = [];
    for (const row of rows.slice(0, 60)) {
      const cells = Array.from(row.getElementsByTagName('c'));
      const rowValues: string[] = [];
      for (const c of cells) {
        const ref = c.getAttribute('r') || '';
        const colIdx = ref ? parseColIndex(ref) : rowValues.length;
        const type = c.getAttribute('t');
        let val = '';

        if (type === 'inlineStr') {
          val = c.getElementsByTagName('t')[0]?.textContent || '';
        } else {
          const vNode = c.getElementsByTagName('v')[0];
          const raw = vNode?.textContent || '';
          if (type === 's') {
            val = sharedStrings[Number(raw)] ?? raw;
          } else {
            val = raw;
          }
        }

        while (rowValues.length < colIdx) rowValues.push('');
        rowValues[colIdx] = val.replace(/\s+/g, ' ').trim();
      }
      if (rowValues.some((v) => v !== '')) {
        maxCols = Math.max(maxCols, rowValues.length);
        formattedRows.push(rowValues.join(' | '));
      }
    }

    chunks.push(
      `=== ABA: ${sheetTitle} (${rows.length} linhas) ===\n${formattedRows.join('\n')}${
        rows.length > 60 ? `\n... (+${rows.length - 60} linhas omitidas)` : ''
      }`
    );
  }

  const text = chunks.join('\n\n').slice(0, MAX_TEXT_EXTRACT_CHARS);
  return {
    text: text || 'Planilha XLSX vazia ou sem dados tabulares legíveis.',
    summary: `XLSX • ${sheetPaths.length} aba(s), ~${totalRows} linhas × ${maxCols} cols`,
  };
}

async function parseOdsFile(file: File): Promise<{ text: string; summary: string }> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const contentFile = zip.file('content.xml');
  if (!contentFile) {
    return { text: 'Arquivo ODS sem content.xml legível.', summary: 'ODS inválido' };
  }
  const xml = await contentFile.async('text');
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const tables = Array.from(doc.getElementsByTagName('table:table')).slice(0, 3);
  const chunks: string[] = [];
  let totalRows = 0;

  tables.forEach((tbl, tIdx) => {
    const name = tbl.getAttribute('table:name') || `Aba ${tIdx + 1}`;
    const rows = Array.from(tbl.getElementsByTagName('table:table-row'));
    totalRows += rows.length;
    const lines: string[] = [];

    for (const r of rows.slice(0, 60)) {
      const cells = Array.from(r.getElementsByTagName('table:table-cell'));
      const vals: string[] = [];
      for (const c of cells) {
        const repeat = Math.min(10, Number(c.getAttribute('table:number-columns-repeated') || 1));
        const txt = (c.textContent || '').replace(/\s+/g, ' ').trim();
        for (let k = 0; k < repeat; k++) vals.push(txt);
      }
      if (vals.some(Boolean)) lines.push(vals.join(' | '));
    }

    chunks.push(`=== ABA: ${name} (${rows.length} linhas) ===\n${lines.join('\n')}`);
  });

  return {
    text: chunks.join('\n\n').slice(0, MAX_TEXT_EXTRACT_CHARS),
    summary: `ODS • ${tables.length} aba(s), ~${totalRows} linhas`,
  };
}

async function parseCsvFile(file: File): Promise<{ text: string; summary: string }> {
  const rawText = await readAsText(file);
  const parsed = Papa.parse<string[]>(rawText, { skipEmptyLines: true });
  const rows = parsed.data || [];
  const headers = rows[0] || [];

  // Compute quick numeric summary for columns
  const numericSummaries: string[] = [];
  if (rows.length > 1 && headers.length > 0) {
    headers.slice(0, 12).forEach((h, colIdx) => {
      const nums = rows
        .slice(1)
        .map((r) => Number(String(r[colIdx] || '').replace(',', '.')))
        .filter((n) => Number.isFinite(n));
      if (nums.length >= Math.max(2, Math.floor((rows.length - 1) * 0.4))) {
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        numericSummaries.push(
          `${h || `Col ${colIdx + 1}`}: mín=${min.toFixed(2)}, máx=${max.toFixed(2)}, média=${avg.toFixed(2)}`
        );
      }
    });
  }

  const previewLines = rows.slice(0, 75).map((r) => r.join(' | ')).join('\n');
  const text = [
    `Arquivo tabular: ${file.name} (${rows.length} linhas × ${headers.length} colunas)`,
    numericSummaries.length > 0 ? `Resumo Numérico:\n- ${numericSummaries.join('\n- ')}` : '',
    `Amostra de Linhas:\n${previewLines}`,
    rows.length > 75 ? `... (+${rows.length - 75} linhas adicionais)` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
    .slice(0, MAX_TEXT_EXTRACT_CHARS);

  return {
    text,
    summary: `Tabela • ${rows.length} linhas × ${headers.length} cols`,
  };
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function approxPolygonAreaHa(ring: [number, number][]): number {
  if (ring.length < 3) return 0;
  const meanLat = ring.reduce((acc, p) => acc + p[1], 0) / ring.length;
  const mPerDegLat = 111132;
  const mPerDegLon = 111320 * Math.cos((meanLat * Math.PI) / 180);
  let sum = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    sum += x1 * mPerDegLon * (y2 * mPerDegLat) - x2 * mPerDegLon * (y1 * mPerDegLat);
  }
  return Math.abs(sum) / 2 / 10000;
}

function parseKmlString(kmlText: string, fileName: string): { text: string; summary: string } {
  const doc = new DOMParser().parseFromString(kmlText, 'application/xml');
  const placemarks = Array.from(doc.getElementsByTagName('Placemark'));

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;
  let totalAreaHa = 0;
  const details: string[] = [];

  placemarks.slice(0, 40).forEach((pm, idx) => {
    const name = pm.getElementsByTagName('name')[0]?.textContent?.trim() || `Feição ${idx + 1}`;
    const desc = pm.getElementsByTagName('description')[0]?.textContent?.replace(/<[^>]+>/g, ' ').trim();
    const coordNodes = Array.from(pm.getElementsByTagName('coordinates'));
    let pmVertices = 0;
    let pmAreaHa = 0;

    coordNodes.forEach((cn) => {
      const pts: [number, number][] = [];
      const raw = (cn.textContent || '').trim().split(/\s+/);
      raw.forEach((token) => {
        const parts = token.split(',').map(Number);
        if (parts.length >= 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
          const [lon, lat] = parts;
          pts.push([lon, lat]);
          minLon = Math.min(minLon, lon);
          maxLon = Math.max(maxLon, lon);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
      });
      pmVertices += pts.length;
      if (pm.getElementsByTagName('Polygon').length > 0 && pts.length >= 3) {
        pmAreaHa += approxPolygonAreaHa(pts);
      }
    });

    totalAreaHa += pmAreaHa;
    details.push(
      `- ${name}: ${pmVertices} vértice(s)${pmAreaHa > 0 ? `, área aprox. ${pmAreaHa.toFixed(2)} ha` : ''}${
        desc ? ` | ${desc.slice(0, 140)}` : ''
      }`
    );
  });

  const boundsStr = Number.isFinite(minLat)
    ? `Bounds [Lon ${minLon.toFixed(5)}..${maxLon.toFixed(5)}, Lat ${minLat.toFixed(5)}..${maxLat.toFixed(5)}]`
    : 'Coordenadas não localizadas';

  const text = [
    `Arquivo Geoespacial KML/KMZ: ${fileName}`,
    `Total de Placemarks/Feições: ${placemarks.length}${totalAreaHa > 0 ? ` | Área total estimada: ${totalAreaHa.toFixed(2)} ha` : ''}`,
    boundsStr,
    `Feições:\n${details.join('\n')}`,
  ]
    .join('\n\n')
    .slice(0, MAX_TEXT_EXTRACT_CHARS);

  return {
    text,
    summary: `KML/KMZ • ${placemarks.length} feição(ões)${totalAreaHa > 0 ? ` (${totalAreaHa.toFixed(1)} ha)` : ''}`,
  };
}

function parseGeoJsonString(rawText: string, fileName: string): { text: string; summary: string } {
  try {
    const json = JSON.parse(rawText);
    const features = json.type === 'FeatureCollection' ? json.features || [] : json.type === 'Feature' ? [json] : [];
    const geomTypes = new Set<string>();
    const propKeys = new Set<string>();
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLon = Infinity;
    let maxLon = -Infinity;
    let totalAreaHa = 0;

    const scanCoords = (coords: any) => {
      if (!Array.isArray(coords)) return;
      if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        minLon = Math.min(minLon, coords[0]);
        maxLon = Math.max(maxLon, coords[0]);
        minLat = Math.min(minLat, coords[1]);
        maxLat = Math.max(maxLat, coords[1]);
      } else {
        coords.forEach(scanCoords);
      }
    };

    const featureSummaries = features.slice(0, 40).map((f: any, idx: number) => {
      const gType = f?.geometry?.type || 'Desconhecido';
      geomTypes.add(gType);
      if (f?.geometry?.coordinates) {
        scanCoords(f.geometry.coordinates);
        if (gType === 'Polygon' && Array.isArray(f.geometry.coordinates[0])) {
          totalAreaHa += approxPolygonAreaHa(f.geometry.coordinates[0]);
        } else if (gType === 'MultiPolygon' && Array.isArray(f.geometry.coordinates)) {
          f.geometry.coordinates.forEach((poly: any) => {
            if (Array.isArray(poly[0])) totalAreaHa += approxPolygonAreaHa(poly[0]);
          });
        }
      }
      const props = f?.properties || {};
      Object.keys(props).forEach((k) => propKeys.add(k));
      return `- Feição #${idx + 1} (${gType}): ${JSON.stringify(props).slice(0, 220)}`;
    });

    const text = [
      `GeoJSON: ${fileName} | Tipo: ${json.type} | Feições: ${features.length}`,
      `Geometrias: ${Array.from(geomTypes).join(', ') || 'N/A'}${totalAreaHa > 0 ? ` | Área estimada: ${totalAreaHa.toFixed(2)} ha` : ''}`,
      Number.isFinite(minLat)
        ? `Bounding Box: Lon [${minLon.toFixed(5)}, ${maxLon.toFixed(5)}], Lat [${minLat.toFixed(5)}, ${maxLat.toFixed(5)}]`
        : '',
      `Atributos encontrados: ${Array.from(propKeys).join(', ') || 'Nenhum'}`,
      `Amostra de Feições:\n${featureSummaries.join('\n')}`,
    ]
      .filter(Boolean)
      .join('\n\n')
      .slice(0, MAX_TEXT_EXTRACT_CHARS);

    return {
      text,
      summary: `GeoJSON • ${features.length} feição(ões)${totalAreaHa > 0 ? ` (${totalAreaHa.toFixed(1)} ha)` : ''}`,
    };
  } catch {
    return {
      text: rawText.slice(0, MAX_TEXT_EXTRACT_CHARS),
      summary: `JSON • ${formatBytes(rawText.length)}`,
    };
  }
}

function parseGpxString(gpxText: string, fileName: string): { text: string; summary: string } {
  const doc = new DOMParser().parseFromString(gpxText, 'application/xml');
  const wpts = Array.from(doc.getElementsByTagName('wpt'));
  const trkpts = Array.from(doc.getElementsByTagName('trkpt'));
  let distM = 0;
  let prev: [number, number] | null = null;

  trkpts.forEach((pt) => {
    const lat = Number(pt.getAttribute('lat'));
    const lon = Number(pt.getAttribute('lon'));
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      if (prev) distM += haversineMeters(prev[0], prev[1], lat, lon);
      prev = [lat, lon];
    }
  });

  const wptLines = wpts.slice(0, 40).map((w, i) => {
    const name = w.getElementsByTagName('name')[0]?.textContent || `Ponto ${i + 1}`;
    const lat = w.getAttribute('lat');
    const lon = w.getAttribute('lon');
    const ele = w.getElementsByTagName('ele')[0]?.textContent;
    return `- ${name}: lat ${lat}, lon ${lon}${ele ? `, elev ${ele}m` : ''}`;
  });

  return {
    text: [
      `Trilha/Pontos GPX: ${fileName}`,
      `Waypoints: ${wpts.length} | Pontos de trilha: ${trkpts.length} | Distância estimada: ${(distM / 1000).toFixed(2)} km`,
      wptLines.length > 0 ? `Pontos:\n${wptLines.join('\n')}` : '',
    ]
      .filter(Boolean)
      .join('\n\n')
      .slice(0, MAX_TEXT_EXTRACT_CHARS),
    summary: `GPX • ${wpts.length} pts / ${(distM / 1000).toFixed(1)} km`,
  };
}

async function parseGeoTiffFile(file: File): Promise<{ text: string; summary: string; previewUrl?: string }> {
  const buffer = await file.arrayBuffer();
  const tiff = await fromArrayBuffer(buffer);
  const image = await tiff.getImage();
  const width = image.getWidth();
  const height = image.getHeight();
  const samplesPerPixel = image.getSamplesPerPixel();
  let bbox: number[] = [];
  try {
    bbox = image.getBoundingBox();
  } catch {}
  const geoKeys = image.getGeoKeys?.() || {};

  // Sample downscaled raster for statistics and NDVI/heatmap preview
  const sampleW = Math.min(160, width);
  const sampleH = Math.min(160, height);
  const rasters = await image.readRasters({ width: sampleW, height: sampleH, interleave: false });

  const bandStats: string[] = [];
  const bandCount = Math.min(4, rasters.length);

  for (let b = 0; b < bandCount; b++) {
    const arr = rasters[b] as ArrayLike<number>;
    const valid: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (Number.isFinite(v) && v > -9999 && v < 1e9) {
        valid.push(v);
      }
    }
    if (valid.length > 0) {
      valid.sort((a, c) => a - c);
      const min = valid[0];
      const max = valid[valid.length - 1];
      const mean = valid.reduce((acc, v) => acc + v, 0) / valid.length;
      const p10 = valid[Math.floor(valid.length * 0.1)];
      const p50 = valid[Math.floor(valid.length * 0.5)];
      const p90 = valid[Math.floor(valid.length * 0.9)];
      bandStats.push(
        `Banda ${b + 1}: mín=${min.toFixed(3)}, p10=${p10.toFixed(3)}, mediana=${p50.toFixed(3)}, média=${mean.toFixed(3)}, p90=${p90.toFixed(3)}, máx=${max.toFixed(3)}`
      );
    }
  }

  // Create false-color NDVI/grayscale preview canvas
  let previewUrl: string | undefined;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = sampleW;
    canvas.height = sampleH;
    const ctx = canvas.getContext('2d');
    if (ctx && rasters[0]) {
      const imgData = ctx.createImageData(sampleW, sampleH);
      const b0 = rasters[0] as ArrayLike<number>;
      let min = Infinity;
      let max = -Infinity;
      for (let i = 0; i < b0.length; i++) {
        if (Number.isFinite(b0[i]) && b0[i] > -9999) {
          min = Math.min(min, b0[i]);
          max = Math.max(max, b0[i]);
        }
      }
      const span = max - min || 1;
      const looksLikeNdvi = min >= -1.05 && max <= 1.05;

      for (let i = 0; i < sampleW * sampleH; i++) {
        const val = b0[i];
        const norm = Number.isFinite(val) && val > -9999 ? Math.max(0, Math.min(1, (val - min) / span)) : 0;
        const idx = i * 4;
        if (looksLikeNdvi) {
          // Red -> Amber -> Emerald gradient for vegetation index
          imgData.data[idx] = Math.round(norm < 0.5 ? 220 : 220 * (1 - (norm - 0.5) * 2));
          imgData.data[idx + 1] = Math.round(norm < 0.5 ? 60 + norm * 320 : 185 + (norm - 0.5) * 90);
          imgData.data[idx + 2] = Math.round(45 + norm * 40);
        } else {
          const gray = Math.round(norm * 255);
          imgData.data[idx] = gray;
          imgData.data[idx + 1] = gray;
          imgData.data[idx + 2] = gray;
        }
        imgData.data[idx + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
      previewUrl = canvas.toDataURL('image/png');
    }
  } catch {}

  const text = [
    `Raster GeoTIFF / NDVI: ${file.name}`,
    `Dimensões: ${width} × ${height} px | Bandas: ${samplesPerPixel}`,
    bbox.length === 4 ? `Bounding Box CRS: [${bbox.map((n) => n.toFixed(5)).join(', ')}]` : '',
    `EPSG/CRS GeoKeys: ${geoKeys.ProjectedCSTypeGeoKey || geoKeys.GeographicTypeGeoKey || 'Não especificado'}`,
    bandStats.length > 0 ? `Estatísticas Amostrais das Bandas:\n- ${bandStats.join('\n- ')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
    .slice(0, MAX_TEXT_EXTRACT_CHARS);

  return {
    text,
    summary: `GeoTIFF • ${width}×${height} px (${samplesPerPixel} banda${samplesPerPixel > 1 ? 's' : ''})`,
    previewUrl,
  };
}

export async function parseNemaAttachment(file: File): Promise<NemaAttachment> {
  const kind = detectKind(file);
  if (!kind) {
    throw new Error(
      `Formato não suportado (${file.name}). Envie fotos, vídeos, PDFs, planilhas (CSV/XLSX/ODS) ou arquivos de geoprocessamento (KML/KMZ/GeoJSON/GPX/GeoTIFF).`
    );
  }

  const ext = getExtension(file.name);
  const mimeType = detectMimeByExtension(ext, file.type);
  const id = `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  if (kind === 'image') {
    if (file.size > MAX_INLINE_IMAGE_BYTES) {
      throw new Error(`A imagem "${file.name}" excede 18 MB (${formatBytes(file.size)}).`);
    }
    const dataUrl = await readAsDataURL(file);
    const base64Data = dataUrl.split(',')[1] || '';
    return {
      id,
      name: file.name,
      mimeType,
      sizeBytes: file.size,
      kind,
      base64Data,
      previewUrl: dataUrl,
      summaryLabel: `Foto • ${formatBytes(file.size)}`,
    };
  }

  if (kind === 'video') {
    if (file.size > MAX_INLINE_VIDEO_BYTES) {
      throw new Error(
        `O vídeo "${file.name}" tem ${formatBytes(file.size)} e excede o limite de 22 MB para envio direto.`
      );
    }
    const dataUrl = await readAsDataURL(file);
    const base64Data = dataUrl.split(',')[1] || '';
    const objectUrl = URL.createObjectURL(file);
    return {
      id,
      name: file.name,
      mimeType,
      sizeBytes: file.size,
      kind,
      base64Data,
      previewUrl: objectUrl,
      summaryLabel: `Vídeo • ${formatBytes(file.size)}`,
    };
  }

  if (kind === 'pdf') {
    if (file.size > MAX_INLINE_PDF_BYTES) {
      throw new Error(`O PDF "${file.name}" excede 22 MB (${formatBytes(file.size)}).`);
    }
    const dataUrl = await readAsDataURL(file);
    const base64Data = dataUrl.split(',')[1] || '';
    return {
      id,
      name: file.name,
      mimeType: 'application/pdf',
      sizeBytes: file.size,
      kind,
      base64Data,
      summaryLabel: `PDF • ${formatBytes(file.size)}`,
    };
  }

  if (kind === 'spreadsheet') {
    if (ext === 'xlsx') {
      const { text, summary } = await parseXlsxFile(file);
      return { id, name: file.name, mimeType, sizeBytes: file.size, kind, extractedText: text, summaryLabel: summary };
    }
    if (ext === 'ods') {
      const { text, summary } = await parseOdsFile(file);
      return { id, name: file.name, mimeType, sizeBytes: file.size, kind, extractedText: text, summaryLabel: summary };
    }
    if (ext === 'csv' || ext === 'tsv') {
      const { text, summary } = await parseCsvFile(file);
      return { id, name: file.name, mimeType, sizeBytes: file.size, kind, extractedText: text, summaryLabel: summary };
    }
    // Legacy .xls fallback: extract readable ASCII/UTF-8 tokens
    const raw = await readAsText(file);
    const printable = raw.replace(/[^\x20-\x7E\xC0-\xFF\n\t;]/g, ' ').replace(/\s{2,}/g, ' ').slice(0, 6000);
    return {
      id,
      name: file.name,
      mimeType,
      sizeBytes: file.size,
      kind,
      extractedText: `Planilha .XLS legada (${file.name}). Para leitura numérica 100% precisa, recomenda-se exportar como .XLSX ou .CSV.\nTrechos detectados:\n${printable}`,
      summaryLabel: `XLS • ${formatBytes(file.size)}`,
    };
  }

  // Geoprocessing
  if (ext === 'tif' || ext === 'tiff') {
    const { text, summary, previewUrl } = await parseGeoTiffFile(file);
    return {
      id,
      name: file.name,
      mimeType,
      sizeBytes: file.size,
      kind,
      extractedText: text,
      previewUrl,
      summaryLabel: summary,
    };
  }

  if (ext === 'kmz') {
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);
    const kmlKey = Object.keys(zip.files).find((k) => k.toLowerCase().endsWith('.kml'));
    if (!kmlKey) throw new Error('Arquivo KMZ não contém arquivo .kml interno.');
    const kmlText = await zip.file(kmlKey)!.async('text');
    const { text, summary } = parseKmlString(kmlText, file.name);
    return { id, name: file.name, mimeType, sizeBytes: file.size, kind, extractedText: text, summaryLabel: summary };
  }

  if (ext === 'kml') {
    const kmlText = await readAsText(file);
    const { text, summary } = parseKmlString(kmlText, file.name);
    return { id, name: file.name, mimeType, sizeBytes: file.size, kind, extractedText: text, summaryLabel: summary };
  }

  if (ext === 'gpx') {
    const gpxText = await readAsText(file);
    const { text, summary } = parseGpxString(gpxText, file.name);
    return { id, name: file.name, mimeType, sizeBytes: file.size, kind, extractedText: text, summaryLabel: summary };
  }

  // geojson / json
  const jsonText = await readAsText(file);
  const { text, summary } = parseGeoJsonString(jsonText, file.name);
  return { id, name: file.name, mimeType, sizeBytes: file.size, kind, extractedText: text, summaryLabel: summary };
}
