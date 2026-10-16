import React, { useState, useMemo, useRef } from 'react';
import {
  Navigation,
  MapPin,
  Upload,
  FileCode,
  Download,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  FileSpreadsheet,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  FileText,
  Crosshair,
  Satellite,
  Sparkles,
} from 'lucide-react';
import {
  Pericia,
  PericiaPontoGPS,
  PericiaGeorreferenciamento,
  PericiaCoordenadas,
} from '../../types/pericia';
import {
  calculateCentroid,
  calculatePolygonArea,
  calculatePerimeter,
  calculateHaversineDistance,
  decimalToGms,
  gmsToDecimal,
  parsePastedCoordinates,
  parseKML,
  parseKMZ,
  parseGeoJSON,
  parseGPX,
  generateKMLString,
  generateGeoJSONString,
  generateVerticesCSV,
  utmToDecimal,
  decimalToUtm,
  parseUTMPastedCoordinates,
} from '../../utils/periciaGeoUtils';
import { PericiaKmlImporterModal } from './PericiaKmlImporterModal';

interface PericiaGeorreferenciamentoSectionProps {
  pericia: Pericia;
  onUpdatePericia: (updated: Pericia) => void;
}

export const PericiaGeorreferenciamentoSection: React.FC<
  PericiaGeorreferenciamentoSectionProps
> = ({ pericia, onUpdatePericia }) => {
  // Navigation tabs for the georeferencing panel
  const [subTab, setSubTab] = useState<'manual' | 'importar' | 'tabela' | 'lote'>('manual');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Real device GPS loading state
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(2.1);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Copied memorial feedback
  const [hasCopiedMemorial, setHasCopiedMemorial] = useState(false);

  // Selected/Hovered point for interactive map
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // Advanced KML/KMZ importer modal state
  const [isKmlImporterOpen, setIsKmlImporterOpen] = useState(false);

  // Fallback initial georeferencing if not present
  const defaultGeoData: PericiaGeorreferenciamento = useMemo(() => {
    const propertyArea = pericia.objetoDescricao.areaAfetadaHa || 18.5;
    const baseLat = -16.1482;
    const baseLng = -47.5192;

    const initialPoints: PericiaPontoGPS[] = [
      {
        id: 'p-01',
        identificador: 'V-01',
        tipo: 'vertice_perimetro',
        lat: -16.1465,
        lng: -47.5215,
        altitude: 980,
        precisaoMeters: 1.8,
        descricao: 'Vértice Noroeste - Canto de Cerca com Estrada Vicinal',
      },
      {
        id: 'p-02',
        identificador: 'V-02',
        tipo: 'vertice_perimetro',
        lat: -16.1468,
        lng: -47.5168,
        altitude: 985,
        precisaoMeters: 2.0,
        descricao: 'Vértice Nordeste - Marco M-02 de Concreto',
      },
      {
        id: 'p-03',
        identificador: 'V-03',
        tipo: 'vertice_perimetro',
        lat: -16.1501,
        lng: -47.5162,
        altitude: 983,
        precisaoMeters: 2.2,
        descricao: 'Vértice Sudeste - Divisa Fazenda Boa Vista',
      },
      {
        id: 'p-04',
        identificador: 'V-04',
        tipo: 'vertice_perimetro',
        lat: -16.1512,
        lng: -47.5198,
        altitude: 978,
        precisaoMeters: 1.9,
        descricao: 'Vértice Sul - Próximo a Drenagem Natural',
      },
      {
        id: 'p-05',
        identificador: 'V-05',
        tipo: 'vertice_perimetro',
        lat: -16.1495,
        lng: -47.5222,
        altitude: 979,
        precisaoMeters: 2.1,
        descricao: 'Vértice Sudoeste - Marco M-05',
      },
      {
        id: 'p-06',
        identificador: 'P-F01',
        tipo: 'foto',
        lat: -16.148,
        lng: -47.5185,
        altitude: 982,
        precisaoMeters: 1.5,
        descricao: 'Ponto Fotográfico 01 - Epinastia em Tomate',
      },
      {
        id: 'p-07',
        identificador: 'P-A01',
        tipo: 'ponto_amostra',
        lat: -16.1485,
        lng: -47.519,
        altitude: 981,
        precisaoMeters: 1.6,
        descricao: 'Ponto de Amostragem Foliar 01',
      },
    ];

    return {
      sistemaReferencia: 'SIRGAS 2000 (Geodésico Oficial)',
      fusoUtm: 'Fuso 22S (MC 51° W)',
      centroide: { lat: baseLat, lng: baseLng, altitude: 982, precisaoMeters: 2.1 },
      pontos: initialPoints,
      arquivoImportadoNome: 'Talhao_04_Fazenda_Santa_Helena.kml',
      arquivoImportadoTipo: 'kml',
      areaCalculadaHa: propertyArea,
      perimetroCalculadoMeters: 1780,
      observacoesGeodesicas:
        'Levantamento georreferenciado pericial em conformidade com as normas técnicas da ABNT e do INCRA (3ª Edição NTGIR).',
    };
  }, [pericia]);

  const geoData: PericiaGeorreferenciamento = pericia.georreferenciamento || defaultGeoData;

  // Single Point Form State
  const [newPoint, setNewPoint] = useState<Partial<PericiaPontoGPS>>({
    identificador: `V-${String(geoData.pontos.length + 1).padStart(2, '0')}`,
    tipo: 'vertice_perimetro',
    lat: geoData.centroide.lat || -16.1482,
    lng: geoData.centroide.lng || -47.5192,
    altitude: 980,
    precisaoMeters: 2.0,
    descricao: '',
  });

  // Manual Coordinate Input Format ('decimal' | 'gms' | 'utm')
  const [manualInputFormat, setManualInputFormat] = useState<'decimal' | 'gms' | 'utm'>('decimal');

  // GMS Converter input state
  const [gmsLatInput, setGmsLatInput] = useState('');
  const [gmsLngInput, setGmsLngInput] = useState('');

  // UTM Converter input state
  const [utmEastingInput, setUtmEastingInput] = useState('');
  const [utmNorthingInput, setUtmNorthingInput] = useState('');
  const [utmZoneInput, setUtmZoneInput] = useState('22');
  const [utmHemisphereInput, setUtmHemisphereInput] = useState<'S' | 'N'>('S');

  // Batch paste state & mode
  const [batchCoordinatesText, setBatchCoordinatesText] = useState('');
  const [batchFormat, setBatchFormat] = useState<'decimal' | 'utm'>('decimal');
  const [batchUtmZone, setBatchUtmZone] = useState('22');

  // Updates full georeferencing object and persists in Pericia
  const updateGeoData = (updated: PericiaGeorreferenciamento) => {
    // Recalculate polygon area and perimeter if vertices exist
    const vertices = updated.pontos.filter(p => p.tipo === 'vertice_perimetro');
    if (vertices.length >= 3) {
      const { areaHa } = calculatePolygonArea(vertices);
      const perim = calculatePerimeter(vertices);
      updated.areaCalculadaHa = areaHa;
      updated.perimetroCalculadoMeters = perim;
    }
    if (updated.pontos.length > 0) {
      updated.centroide = calculateCentroid(updated.pontos);
    }

    onUpdatePericia({
      ...pericia,
      georreferenciamento: updated,
      atualizadoEm: new Date().toISOString(),
    });
  };

  // Capture real GPS via Geolocation API
  const handleCaptureRealGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocalização não suportada neste dispositivo/navegador.');
      return;
    }
    setIsCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        setIsCapturingGps(false);
        const { latitude, longitude, altitude, accuracy } = position.coords;
        const roundedLat = Number(latitude.toFixed(6));
        const roundedLng = Number(longitude.toFixed(6));
        const roundedAcc = Math.round(accuracy * 10) / 10;
        setGpsAccuracy(roundedAcc);

        setNewPoint(prev => ({
          ...prev,
          lat: roundedLat,
          lng: roundedLng,
          altitude: altitude ? Math.round(altitude) : prev.altitude,
          precisaoMeters: roundedAcc,
        }));

        showToast(`Coordenadas obtidas via GPS com precisão de ±${roundedAcc}m!`);
      },
      error => {
        setIsCapturingGps(false);
        showToast(`Erro ao capturar GPS: ${error.message}. Verifique as permissões de localização.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Convert GMS inputs to Decimal
  const handleConvertGms = () => {
    let latDec: number | null = null;
    let lngDec: number | null = null;

    if (gmsLatInput) {
      latDec = gmsToDecimal(gmsLatInput);
    }
    if (gmsLngInput) {
      lngDec = gmsToDecimal(gmsLngInput);
    }

    if (latDec === null && lngDec === null) {
      showToast('Formato GMS inválido. Exemplo: 16°08\'53.5" S');
      return;
    }

    setNewPoint(prev => ({
      ...prev,
      lat: latDec !== null ? latDec : prev.lat,
      lng: lngDec !== null ? lngDec : prev.lng,
    }));

    showToast('Coordenadas GMS convertidas com sucesso para Graus Decimais!');
  };

  // Convert UTM inputs to Decimal
  const handleConvertUtm = () => {
    const easting = parseFloat(utmEastingInput.replace(',', '.'));
    const northing = parseFloat(utmNorthingInput.replace(',', '.'));
    const zone = parseInt(utmZoneInput, 10) || 22;
    const isSouth = utmHemisphereInput === 'S';

    if (isNaN(easting) || isNaN(northing)) {
      showToast('Preencha os valores válidos de Coordenada Este (X) e Norte (Y).');
      return;
    }

    const dec = utmToDecimal(easting, northing, zone, isSouth);
    setNewPoint(prev => ({
      ...prev,
      lat: dec.lat,
      lng: dec.lng,
    }));

    showToast(`Coordenadas UTM convertidas: Lat ${dec.lat.toFixed(6)}°, Lng ${dec.lng.toFixed(6)}° (Fuso ${zone}${isSouth ? 'S' : 'N'})`);
  };

  // Add individual point
  const handleAddIndividualPoint = () => {
    if (newPoint.lat === undefined || newPoint.lng === undefined) {
      showToast('Informe a latitude e longitude do ponto.');
      return;
    }

    const createdPoint: PericiaPontoGPS = {
      id: `p-${Date.now()}`,
      identificador:
        newPoint.identificador?.trim() ||
        `P-${String(geoData.pontos.length + 1).padStart(2, '0')}`,
      tipo: newPoint.tipo || 'vertice_perimetro',
      lat: Number(newPoint.lat),
      lng: Number(newPoint.lng),
      altitude: newPoint.altitude ? Number(newPoint.altitude) : undefined,
      precisaoMeters: newPoint.precisaoMeters ? Number(newPoint.precisaoMeters) : 2.0,
      descricao: newPoint.descricao || '',
    };

    const updatedPoints = [...geoData.pontos, createdPoint];
    updateGeoData({
      ...geoData,
      pontos: updatedPoints,
    });

    // Increment next point name
    const nextNum = updatedPoints.length + 1;
    setNewPoint({
      identificador: `V-${String(nextNum).padStart(2, '0')}`,
      tipo: 'vertice_perimetro',
      lat: newPoint.lat,
      lng: newPoint.lng,
      altitude: newPoint.altitude,
      precisaoMeters: newPoint.precisaoMeters,
      descricao: '',
    });

    showToast(`Ponto ${createdPoint.identificador} adicionado com sucesso!`);
  };

  // Batch coordinates import (supports Decimals or UTM)
  const handleAddBatchCoordinates = () => {
    if (!batchCoordinatesText.trim()) {
      showToast('Cole a lista de coordenadas para processar.');
      return;
    }

    let parsed: PericiaPontoGPS[] = [];
    if (batchFormat === 'utm') {
      const zoneNum = parseInt(batchUtmZone, 10) || 22;
      parsed = parseUTMPastedCoordinates(batchCoordinatesText, zoneNum, true);
    } else {
      parsed = parsePastedCoordinates(batchCoordinatesText);
    }

    if (parsed.length === 0) {
      showToast(
        batchFormat === 'utm'
          ? 'Nenhuma coordenada UTM válida encontrada. Verifique o formato (ex: E: 658240, N: 8214150).'
          : 'Nenhuma coordenada válida identificada. Verifique o formato (ex: -16.1482, -47.5192).'
      );
      return;
    }

    const updatedPoints = [...geoData.pontos, ...parsed];
    updateGeoData({
      ...geoData,
      pontos: updatedPoints,
      arquivoImportadoNome: `Entrada_Manual_${batchFormat.toUpperCase()}_em_Lote.txt`,
      arquivoImportadoTipo: 'manual',
    });

    setBatchCoordinatesText('');
    showToast(`${parsed.length} pontos e vértices adicionados com sucesso ao polígono!`);
  };

  // Delete point
  const handleDeletePoint = (pointId: string) => {
    const filtered = geoData.pontos.filter(p => p.id !== pointId);
    updateGeoData({
      ...geoData,
      pontos: filtered,
    });
    showToast('Ponto removido.');
  };

  // Clear all points
  const handleClearAllPoints = () => {
    if (confirm('Deseja realmente limpar todos os pontos e vértices cadastrados?')) {
      updateGeoData({
        ...geoData,
        pontos: [],
        areaCalculadaHa: 0,
        perimetroCalculadoMeters: 0,
        arquivoImportadoNome: undefined,
        arquivoImportadoTipo: undefined,
      });
      showToast('Todos os pontos foram removidos.');
    }
  };

  // File Upload Handler (KML, KMZ, GeoJSON, GPX, CSV, TXT)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';

    // Specialized binary KMZ unpacker
    if (fileExt === 'kmz') {
      parseKMZ(file)
        .then(parsed => {
          if (parsed.points.length === 0) {
            showToast(`Nenhuma coordenada válida encontrada no arquivo KMZ "${fileName}".`);
            return;
          }
          updateGeoData({
            ...geoData,
            pontos: parsed.points,
            arquivoImportadoNome: fileName,
            arquivoImportadoTipo: 'kmz',
          });
          showToast(`Arquivo KMZ "${fileName}" importado com sucesso! ${parsed.points.length} vértices carregados.`);
        })
        .catch(err => {
          showToast(`Erro ao descompactar KMZ: ${err.message || 'Arquivo corrompido'}`);
        });

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();

    reader.onload = event => {
      const content = event.target?.result as string;
      if (!content) return;

      let extractedPoints: PericiaPontoGPS[] = [];
      let detectedType: 'kml' | 'kmz' | 'geojson' | 'gpx' | 'csv' = 'kml';

      if (fileExt === 'kml') {
        const parsed = parseKML(content);
        extractedPoints = parsed.points;
        detectedType = 'kml';
      } else if (fileExt === 'geojson' || fileExt === 'json') {
        extractedPoints = parseGeoJSON(content);
        detectedType = 'geojson';
      } else if (fileExt === 'gpx') {
        extractedPoints = parseGPX(content);
        detectedType = 'gpx';
      } else if (fileExt === 'csv' || fileExt === 'txt') {
        extractedPoints = parsePastedCoordinates(content);
        detectedType = 'csv';
      } else {
        // Fallback try KML or raw text
        if (content.includes('<kml')) {
          extractedPoints = parseKML(content).points;
          detectedType = 'kml';
        } else {
          extractedPoints = parsePastedCoordinates(content);
          detectedType = 'csv';
        }
      }

      if (extractedPoints.length === 0) {
        showToast(
          `Não foi possível extrair coordenadas válidas do arquivo "${fileName}". Verifique a formatação.`
        );
        return;
      }

      updateGeoData({
        ...geoData,
        pontos: extractedPoints,
        arquivoImportadoNome: fileName,
        arquivoImportadoTipo: detectedType,
      });

      showToast(
        `Arquivo "${fileName}" importado com sucesso! ${extractedPoints.length} vértices carregados.`
      );
    };

    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Load sample KML for demo
  const handleLoadSampleKml = () => {
    updateGeoData(defaultGeoData);
    showToast('Polígono de demonstração carregado com 7 vértices periciais (18.5 ha)!');
  };

  // Downloads / Exports
  const handleDownloadKML = () => {
    if (geoData.pontos.length === 0) {
      showToast('Não há pontos para exportar.');
      return;
    }
    const kmlStr = generateKMLString(
      geoData.pontos,
      pericia.imovelNome,
      pericia.objetoDescricao.localTalhao
    );
    const blob = new Blob([kmlStr], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Georreferenciamento_${pericia.codigoPericia}.kml`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Arquivo KML gerado e baixado com sucesso!');
  };

  const handleDownloadGeoJSON = () => {
    if (geoData.pontos.length === 0) {
      showToast('Não há pontos para exportar.');
      return;
    }
    const geojsonStr = generateGeoJSONString(
      geoData.pontos,
      pericia.imovelNome,
      pericia.objetoDescricao.localTalhao
    );
    const blob = new Blob([geojsonStr], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Georreferenciamento_${pericia.codigoPericia}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Arquivo GeoJSON gerado e baixado com sucesso!');
  };

  const handleDownloadCSV = () => {
    if (geoData.pontos.length === 0) {
      showToast('Não há pontos para exportar.');
      return;
    }
    const csvStr = generateVerticesCSV(geoData.pontos);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vertices_${pericia.codigoPericia}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Tabela de vértices CSV exportada com sucesso!');
  };

  // Copy Memorial Descritivo to clipboard
  const handleCopyMemorial = () => {
    const vertices = geoData.pontos.filter(p => p.tipo === 'vertice_perimetro');
    if (vertices.length === 0) {
      showToast('Cadastre vértices perimetrais para gerar o memorial descritivo.');
      return;
    }

    let text = `MEMORIAL DESCRITIVO SIMPLIFICADO - PERÍCIA TÉCNICA JUDICIAL\n`;
    text += `PROCESSO / CÓDIGO: ${pericia.codigoPericia}\n`;
    text += `IMÓVEL: ${pericia.imovelNome} — ${pericia.municipio}/${pericia.uf}\n`;
    text += `SISTEMA DE REFERÊNCIA: ${geoData.sistemaReferencia} | ${geoData.fusoUtm || 'Fuso 22S'}\n`;
    text += `ÁREA DELIMITADA: ${geoData.areaCalculadaHa || 0} ha | PERÍMETRO: ${geoData.perimetroCalculadoMeters || 0} m\n\n`;
    text += `VÉRTICES E COORDENADAS:\n`;

    vertices.forEach((v, idx) => {
      const nextIdx = (idx + 1) % vertices.length;
      const nextV = vertices[nextIdx];
      const dist = calculateHaversineDistance(v.lat, v.lng, nextV.lat, nextV.lng);
      text += `${v.identificador}: Lat ${v.lat.toFixed(6)} (${decimalToGms(v.lat, true)}), Lng ${v.lng.toFixed(6)} (${decimalToGms(v.lng, false)}), Alt: ${v.altitude || 0}m -> Distância até ${nextV.identificador}: ${dist.toFixed(2)} m\n`;
    });

    navigator.clipboard.writeText(text);
    setHasCopiedMemorial(true);
    setTimeout(() => setHasCopiedMemorial(false), 3000);
    showToast('Memorial descritivo copiado para a área de transferência!');
  };

  // Interactive SVG Polygon Geometry Calculation
  const polygonSvgData = useMemo(() => {
    const polygonVertices = geoData.pontos.filter(p => p.tipo === 'vertice_perimetro');
    const allPts = geoData.pontos;

    if (allPts.length === 0) return null;

    const lats = allPts.map(p => p.lat);
    const lngs = allPts.map(p => p.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = maxLat - minLat || 0.005;
    const lngSpan = maxLng - minLng || 0.005;

    const padding = 40;
    const width = 680;
    const height = 280;

    const project = (lat: number, lng: number) => {
      const x = padding + ((lng - minLng) / lngSpan) * (width - 2 * padding);
      // Invert Y because SVG 0 is top, but higher latitude is North
      const y = height - padding - ((lat - minLat) / latSpan) * (height - 2 * padding);
      return { x, y };
    };

    const projectedPoints = allPts.map(p => ({
      ...p,
      pos: project(p.lat, p.lng),
    }));

    let polyPath = '';
    const polyProjected = polygonVertices.map(p => project(p.lat, p.lng));
    if (polyProjected.length >= 3) {
      polyPath = `M ${polyProjected.map(pt => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' L ')} Z`;
    }

    return {
      width,
      height,
      polyPath,
      projectedPoints,
    };
  }, [geoData.pontos]);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white dark:bg-emerald-600 px-4 py-3 rounded-2xl shadow-xl border border-emerald-500/40 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER WITH REAL GPS BUTTON AND ACCURACY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-150 dark:border-zinc-800 pb-3 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-600" />
            2.2 Georreferenciamento e Pontos GPS da Perícia
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Lançamento manual de coordenadas, importação de KML/GeoJSON/GPX e delimitação vetorial do talhão periciado.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCaptureRealGps}
            disabled={isCapturingGps}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Capturar coordenadas atuais do dispositivo móvel ou antena GPS"
          >
            {isCapturingGps ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : (
              <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{isCapturingGps ? 'Buscando Satélites...' : 'Capturar GPS Atual'}</span>
          </button>

          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            GPS Ativo: ±{gpsAccuracy ? `${gpsAccuracy}m` : '2.1m'}
          </span>
        </div>
      </div>

      {/* TOP CARD: DARK-THEMED INTERACTIVE MAP VIEWER (Exact Visual Style requested by User) */}
      <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl space-y-4 relative overflow-hidden shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-xs text-emerald-400 font-mono uppercase font-bold tracking-wider">
              PONTOS E POLÍGONOS DE CAMPO
            </p>
            <h4 className="text-base font-bold">
              {pericia.imovelNome} — {pericia.municipio}/{pericia.uf}
            </h4>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full text-xs font-mono font-bold">
              Lat: {geoData.centroide.lat.toFixed(4)}° | Lng: {geoData.centroide.lng.toFixed(4)}°
            </span>

            <a
              href={`https://www.google.com/maps?q=${geoData.centroide.lat},${geoData.centroide.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-full text-[11px] font-mono flex items-center gap-1 transition-all"
              title="Visualizar localização no Google Maps"
            >
              <ExternalLink className="w-3 h-3 text-emerald-400" />
              <span>Google Maps</span>
            </a>
          </div>
        </div>

        {/* MAP CONTAINER WITH VIRTUAL/SVG RENDERING */}
        <div className="relative min-h-64 sm:h-72 bg-slate-800/90 rounded-xl border border-slate-700 overflow-hidden flex flex-col justify-between p-3">
          {/* Geodesic Background Grid & Compass */}
          <div className="absolute inset-0 pointer-events-none opacity-25">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="geoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#64748b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#geoGrid)" />
            </svg>
          </div>

          {/* Compass Rose Badge */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 bg-slate-900/80 backdrop-blur-xs border border-slate-700 rounded-lg text-[10px] font-mono text-emerald-300">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Norte Geodésico</span>
          </div>

          {/* Scale & Datum Badge */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs border border-slate-700 rounded text-[10px] font-mono text-slate-300">
              {geoData.sistemaReferencia}
            </span>
            {geoData.arquivoImportadoNome && (
              <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-800 rounded text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                <FileCode className="w-3 h-3 text-emerald-400" />
                {geoData.arquivoImportadoNome}
              </span>
            )}
          </div>

          {/* Interactive SVG Geometry Rendering */}
          {polygonSvgData && polygonSvgData.projectedPoints.length > 0 ? (
            <div className="w-full h-full flex items-center justify-center my-auto relative z-0">
              <svg
                viewBox={`0 0 ${polygonSvgData.width} ${polygonSvgData.height}`}
                className="w-full h-56 max-h-60"
              >
                {/* Polygon Fill and Outline */}
                {polygonSvgData.polyPath && (
                  <path
                    d={polygonSvgData.polyPath}
                    fill="rgba(16, 185, 129, 0.22)"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="none"
                  />
                )}

                {/* Vertices and Markers */}
                {polygonSvgData.projectedPoints.map(p => {
                  const isSelected = selectedPointId === p.id;
                  const isFoto = p.tipo === 'foto';
                  const isAmostra = p.tipo === 'ponto_amostra';
                  const markerColor = isFoto ? '#38bdf8' : isAmostra ? '#f59e0b' : '#10b981';

                  return (
                    <g
                      key={p.id}
                      className="cursor-pointer transition-transform duration-200"
                      onClick={() => setSelectedPointId(p.id === selectedPointId ? null : p.id)}
                    >
                      {/* Pulse circle */}
                      <circle
                        cx={p.pos.x}
                        cy={p.pos.y}
                        r={isSelected ? 10 : 6}
                        fill={markerColor}
                        fillOpacity={isSelected ? 0.9 : 0.8}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? 2 : 1.5}
                      />
                      {/* Vertex Label */}
                      <text
                        x={p.pos.x}
                        y={p.pos.y - 10}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        className="pointer-events-none drop-shadow-md"
                      >
                        {p.identificador}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="my-auto text-center space-y-2 relative z-10">
              <MapPin className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <p className="text-xs font-mono text-slate-300">Mapa de Delimitação do Talhão Periciado</p>
              <p className="text-[10px] text-slate-400">
                Área Periciada: {geoData.areaCalculadaHa || pericia.objetoDescricao.areaAfetadaHa} ha • Pontos de Fotografia: {pericia.fotografias.length}
              </p>
            </div>
          )}

          {/* Bottom Info Bar inside Dark Map */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-700/80 text-xs">
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300 flex-wrap">
              <span>
                Área: <strong className="text-emerald-400">{geoData.areaCalculadaHa || pericia.objetoDescricao.areaAfetadaHa} ha</strong>
              </span>
              <span>•</span>
              <span>
                Perímetro: <strong className="text-emerald-400">{geoData.perimetroCalculadoMeters || 1780} m</strong>
              </span>
              <span>•</span>
              <span>
                Vértices: <strong className="text-emerald-400">{geoData.pontos.length}</strong>
              </span>
              {selectedPointId && (
                <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  Selecionado:{' '}
                  {geoData.pontos.find(p => p.id === selectedPointId)?.identificador} (
                  {geoData.pontos.find(p => p.id === selectedPointId)?.lat.toFixed(6)},{' '}
                  {geoData.pontos.find(p => p.id === selectedPointId)?.lng.toFixed(6)})
                </span>
              )}
            </div>

            {/* Quick Export Tools */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadKML}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                title="Exportar polígono em KML para Google Earth"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>KML</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadGeoJSON}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                title="Exportar polígono em GeoJSON para QGIS/ArcGIS"
              >
                <Download className="w-3 h-3 text-blue-400" />
                <span>GeoJSON</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                title="Exportar tabela de coordenadas em CSV"
              >
                <FileSpreadsheet className="w-3 h-3 text-amber-400" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABS FOR COORDINATE INPUT MODES */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 text-xs">
        <button
          type="button"
          onClick={() => setSubTab('manual')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            subTab === 'manual'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          Lançar Coordenadas Manualmente
        </button>

        <button
          type="button"
          onClick={() => setSubTab('importar')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            subTab === 'importar'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Importar Arquivo (KML / GeoJSON / GPX)
          {geoData.arquivoImportadoNome && (
            <span className="w-2 h-2 rounded-full bg-emerald-300" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('lote')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            subTab === 'lote'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Colar em Lote (Texto/Planilha)
        </button>

        <button
          type="button"
          onClick={() => setSubTab('tabela')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            subTab === 'tabela'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Tabela de Vértices & Memorial ({geoData.pontos.length})
        </button>
      </div>

      {/* SUBTAB 1: LANÇAMENTO MANUAL DE COORDENADAS */}
      {subTab === 'manual' && (
        <div className="space-y-5">
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-700 pb-2">
              <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                Lançamento Manual de Coordenadas
              </h4>
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setManualInputFormat('decimal')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    manualInputFormat === 'decimal'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Graus Decimais (DD)
                </button>
                <button
                  type="button"
                  onClick={() => setManualInputFormat('gms')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    manualInputFormat === 'gms'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Graus/Min/Seg (GMS)
                </button>
                <button
                  type="button"
                  onClick={() => setManualInputFormat('utm')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    manualInputFormat === 'utm'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Projeção UTM (Métrica)
                </button>
              </div>
            </div>

            {/* FORMAT SPECIFIC COORDINATE INPUTS */}
            {manualInputFormat === 'decimal' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                    Latitude (Graus Decimais) *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Ex: -16.148200"
                    value={newPoint.lat ?? ''}
                    onChange={e => setNewPoint({ ...newPoint, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    GMS: {newPoint.lat !== undefined ? decimalToGms(newPoint.lat, true) : '—'}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                    Longitude (Graus Decimais) *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Ex: -47.519200"
                    value={newPoint.lng ?? ''}
                    onChange={e => setNewPoint({ ...newPoint, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    GMS: {newPoint.lng !== undefined ? decimalToGms(newPoint.lng, false) : '—'}
                  </span>
                </div>
              </div>
            )}

            {manualInputFormat === 'gms' && (
              <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-600" />
                    Lançamento em Graus, Minutos e Segundos (GMS)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Ideal para transcrição direta de certidões e matrículas imobiliárias
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 text-[10px] font-semibold mb-1">
                      Latitude GMS (Ex: 16°08'53.52"S)
                    </label>
                    <input
                      type="text"
                      placeholder="16°08'53.52&quot;S"
                      value={gmsLatInput}
                      onChange={e => setGmsLatInput(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 text-[10px] font-semibold mb-1">
                      Longitude GMS (Ex: 47°31'09.12"W)
                    </label>
                    <input
                      type="text"
                      placeholder="47°31'09.12&quot;W"
                      value={gmsLngInput}
                      onChange={e => setGmsLngInput(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono text-xs"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleConvertGms}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all cursor-pointer text-xs"
                    >
                      Converter p/ Decimal
                    </button>
                  </div>
                </div>

                {newPoint.lat !== undefined && newPoint.lng !== undefined && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold pt-1">
                    Equivalente Decimal: Lat {newPoint.lat.toFixed(6)}°, Lng {newPoint.lng.toFixed(6)}°
                  </p>
                )}
              </div>
            )}

            {manualInputFormat === 'utm' && (
              <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-emerald-600" />
                    Lançamento em Coordenadas UTM (Planas / Métricas)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Padrão INCRA / SIGEF (SIRGAS 2000 / WGS84)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 text-[10px] font-semibold mb-1">
                      Fuso / Zona UTM
                    </label>
                    <select
                      value={utmZoneInput}
                      onChange={e => setUtmZoneInput(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono text-xs"
                    >
                      {[18, 19, 20, 21, 22, 23, 24, 25].map(z => (
                        <option key={z} value={z}>
                          Fuso {z}S (MC {(z - 1) * 6 - 180 + 3}° W)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 text-[10px] font-semibold mb-1">
                      Coordenada Este / X (m) *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 658240.50"
                      value={utmEastingInput}
                      onChange={e => setUtmEastingInput(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-zinc-400 text-[10px] font-semibold mb-1">
                      Coordenada Norte / Y (m) *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 8214150.20"
                      value={utmNorthingInput}
                      onChange={e => setUtmNorthingInput(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono text-xs"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleConvertUtm}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all cursor-pointer text-xs"
                    >
                      Converter p/ Lat/Lng
                    </button>
                  </div>
                </div>

                {newPoint.lat !== undefined && newPoint.lng !== undefined && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold pt-1">
                    Equivalente Geodésico: Lat {newPoint.lat.toFixed(6)}°, Lng {newPoint.lng.toFixed(6)}° ({decimalToGms(newPoint.lat, true)}, {decimalToGms(newPoint.lng, false)})
                  </p>
                )}
              </div>
            )}

            {/* COMMON POINT ATTRIBUTES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Identificador */}
              <div>
                <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                  Identificador / Ponto *
                </label>
                <input
                  type="text"
                  placeholder="Ex: V-06, P-01, M-01"
                  value={newPoint.identificador || ''}
                  onChange={e => setNewPoint({ ...newPoint, identificador: e.target.value })}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Tipo de Ponto */}
              <div>
                <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                  Tipo de Ponto
                </label>
                <select
                  value={newPoint.tipo || 'vertice_perimetro'}
                  onChange={e => setNewPoint({ ...newPoint, tipo: e.target.value as any })}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="vertice_perimetro">Vértice de Perímetro (Delimitação)</option>
                  <option value="ponto_amostra">Ponto de Amostragem (Solo/Folha)</option>
                  <option value="foto">Ponto Fotográfico / Evidência</option>
                  <option value="marco_fisico">Marco Físico / Canto de Cerca</option>
                  <option value="sede">Sede / Benfeitoria / Pivô</option>
                  <option value="outro">Outro Marco Notável</option>
                </select>
              </div>

              {/* Altitude */}
              <div>
                <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                  Altitude Ortométrica (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 982"
                  value={newPoint.altitude ?? ''}
                  onChange={e => setNewPoint({ ...newPoint, altitude: parseFloat(e.target.value) || undefined })}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono text-slate-800 dark:text-zinc-200"
                />
              </div>

              {/* Precisão GPS */}
              <div>
                <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                  Precisão Estimada (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 2.1"
                  value={newPoint.precisaoMeters ?? ''}
                  onChange={e => setNewPoint({ ...newPoint, precisaoMeters: parseFloat(e.target.value) || undefined })}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono text-slate-800 dark:text-zinc-200"
                />
              </div>

              {/* Descrição */}
              <div className="sm:col-span-4">
                <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                  Descrição / Confrontação do Ponto
                </label>
                <input
                  type="text"
                  placeholder="Ex: Marco de concreto cravado na divisa Norte com a Fazenda Primavera"
                  value={newPoint.descricao || ''}
                  onChange={e => setNewPoint({ ...newPoint, descricao: e.target.value })}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={handleAddIndividualPoint}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar Ponto no Polígono</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: IMPORTAR ARQUIVOS (KML, KMZ, GeoJSON, GPX, CSV, TXT) */}
      {subTab === 'importar' && (
        <div className="space-y-4 text-xs">
          {/* Advanced Processor Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white flex items-center gap-1 w-fit">
                <Sparkles className="w-3 h-3 text-amber-300" />
                Processador Geográfico Oficial
              </span>
              <h4 className="text-sm font-black">
                Assistente Visual de Importação de KML / KMZ (CAR & SIGEF)
              </h4>
              <p className="text-xs text-white/80 max-w-xl">
                Importe perímetros completos com cálculo automático de área em hectares, perímetro, fuso UTM, centróide e seleção de camadas de talhões.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsKmlImporterOpen(true)}
              className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <FileCode className="w-4 h-4 text-emerald-600" />
              <span>Abrir Importador KML/KMZ</span>
            </button>
          </div>

          {/* File format badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5" />
              KML / KMZ (Google Earth)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              GeoJSON / JSON (QGIS / SIG)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1">
              <Satellite className="w-3.5 h-3.5" />
              GPX (GPS Garmin / Trimble)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              CSV / TXT (Coordenadas Tabuladas)
            </span>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".kml,.kmz,.geojson,.json,.gpx,.csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                Clique para selecionar ou arraste o arquivo do talhão aqui (.kml, .kmz, .geojson, .gpx, .csv)
              </p>
              <p className="text-slate-500 dark:text-zinc-400 text-xs mt-1">
                Suporte nativo e automático a polígonos, arquivos KMZ comprimidos, anéis de coordenadas e waypoints de campo.
              </p>
            </div>
          </div>

          {/* Quick Demo Loader and File Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700">
            <div>
              <span className="font-bold text-slate-700 dark:text-zinc-200 block">
                Arquivo Atual:{' '}
                <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
                  {geoData.arquivoImportadoNome || 'Nenhum arquivo importado (utilizando dados manuais)'}
                </strong>
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                Total de vértices ativos: {geoData.pontos.length} • Área periciada calculada:{' '}
                {geoData.areaCalculadaHa || 0} ha
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsKmlImporterOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Analisar KML/KMZ</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSampleKml}
                className="px-3 py-1.5 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-300 dark:border-zinc-600 hover:bg-slate-100 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Carregar Demonstração</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: COLAR EM LOTE (TEXTO / PLANILHA / UTM) */}
      {subTab === 'lote' && (
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-700 pb-2">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Lançamento em Lote de Coordenadas
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Copie e cole tabelas de coordenadas de memoriais, arquivos de texto ou planilhas Excel.
                </p>
              </div>

              {/* Format Switcher */}
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setBatchFormat('decimal')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    batchFormat === 'decimal'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Graus Decimais (Lat / Lng)
                </button>
                <button
                  type="button"
                  onClick={() => setBatchFormat('utm')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    batchFormat === 'utm'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Coordenadas UTM (Este / Norte)
                </button>
              </div>
            </div>

            {batchFormat === 'utm' && (
              <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700">
                <span className="font-semibold text-slate-700 dark:text-zinc-300 text-[11px]">
                  Fuso UTM dos Vértices:
                </span>
                <select
                  value={batchUtmZone}
                  onChange={e => setBatchUtmZone(e.target.value)}
                  className="p-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg font-mono text-xs"
                >
                  {[18, 19, 20, 21, 22, 23, 24, 25].map(z => (
                    <option key={z} value={z}>
                      Fuso {z}S (MC {(z - 1) * 6 - 180 + 3}° W)
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400">
                  Formato esperado por linha: <code className="font-mono bg-slate-100 dark:bg-zinc-800 px-1 rounded">V01; 658240; 8214150; 980</code>
                </span>
              </div>
            )}

            <textarea
              rows={6}
              value={batchCoordinatesText}
              onChange={e => setBatchCoordinatesText(e.target.value)}
              placeholder={
                batchFormat === 'utm'
                  ? `Cole aqui as coordenadas UTM linha por linha (Ponto; Este; Norte; Altitude):
V01; 658240.20; 8214150.10; 980
V02; 658735.40; 8214120.50; 985
V03; 658800.10; 8213750.30; 983
V04; 658420.80; 8213630.90; 978
V05; 658160.00; 8213820.40; 979`
                  : `Cole aqui as coordenadas linha por linha (Ponto; Latitude; Longitude; Altitude):
V01; -16.1465; -47.5215; 980
V02; -16.1468; -47.5168; 985
V03; -16.1501; -47.5162; 983
V04; -16.1512; -47.5198; 978
V05; -16.1495; -47.5222; 979`
              }
              className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono text-xs leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Linhas detectadas:{' '}
                {batchCoordinatesText.split(/\r?\n/).filter(l => l.trim()).length}
              </span>

              <button
                type="button"
                onClick={handleAddBatchCoordinates}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Processar e Adicionar Todos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: TABELA DE VÉRTICES & MEMORIAL */}
      {subTab === 'tabela' && (
        <div className="space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                Relação Completa de Vértices e Pontos Georreferenciados
              </h4>
              <span className="text-[11px] text-slate-500">
                {geoData.pontos.length} pontos cadastrados • Sistema {geoData.sistemaReferencia}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyMemorial}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Copiar memorial descritivo dos vértices para petição/laudo"
              >
                {hasCopiedMemorial ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopiedMemorial ? 'Copiado!' : 'Copiar Memorial'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearAllPoints}
                className="px-3 py-1.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Remover todos os pontos do polígono"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Todos</span>
              </button>
            </div>
          </div>

          {geoData.pontos.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
              <p className="font-bold">Nenhum ponto ou vértice cadastrado.</p>
              <p className="text-xs mt-0.5">Use as abas de lançamento manual ou importação para começar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold border-b border-slate-200 dark:border-zinc-700">
                    <th className="p-2.5">Ponto</th>
                    <th className="p-2.5">Tipo</th>
                    <th className="p-2.5 font-mono">Latitude (DD)</th>
                    <th className="p-2.5 font-mono">Longitude (DD)</th>
                    <th className="p-2.5 font-mono">Latitude (GMS)</th>
                    <th className="p-2.5 font-mono">Longitude (GMS)</th>
                    <th className="p-2.5 font-mono">UTM (Este / Norte)</th>
                    <th className="p-2.5 font-mono text-center">Alt (m)</th>
                    <th className="p-2.5">Descrição</th>
                    <th className="p-2.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {geoData.pontos.map((p, idx) => {
                    const utm = decimalToUtm(p.lat, p.lng);
                    return (
                    <tr
                      key={p.id || idx}
                      className={`hover:bg-slate-50/70 dark:hover:bg-zinc-800/50 transition-colors ${
                        selectedPointId === p.id ? 'bg-emerald-50/70 dark:bg-emerald-950/40' : ''
                      }`}
                    >
                      <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">
                        {p.identificador}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.tipo === 'vertice_perimetro'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : p.tipo === 'foto'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : p.tipo === 'ponto_amostra'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          {p.tipo === 'vertice_perimetro'
                            ? 'Vértice Perímetro'
                            : p.tipo === 'foto'
                            ? 'Foto'
                            : p.tipo === 'ponto_amostra'
                            ? 'Amostra'
                            : p.tipo}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-700 dark:text-zinc-300">
                        {p.lat.toFixed(6)}°
                      </td>
                      <td className="p-2.5 font-mono text-slate-700 dark:text-zinc-300">
                        {p.lng.toFixed(6)}°
                      </td>
                      <td className="p-2.5 font-mono text-slate-500 text-[10px]">
                        {decimalToGms(p.lat, true)}
                      </td>
                      <td className="p-2.5 font-mono text-slate-500 text-[10px]">
                        {decimalToGms(p.lng, false)}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600 dark:text-zinc-300 text-[10px] whitespace-nowrap">
                        {Math.round(utm.easting)}E, {Math.round(utm.northing)}N ({utm.zone}{utm.hemisphere})
                      </td>
                      <td className="p-2.5 font-mono text-center text-slate-600 dark:text-zinc-400">
                        {p.altitude || '—'}
                      </td>
                      <td className="p-2.5 text-slate-600 dark:text-zinc-400 max-w-xs truncate">
                        {p.descricao || '—'}
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <a
                            href={`https://www.google.com/maps?q=${p.lat},${p.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Ver no Google Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeletePoint(p.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                            title="Remover ponto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Advanced KML / KMZ Importer Modal */}
      {isKmlImporterOpen && (
        <PericiaKmlImporterModal
          isOpen={isKmlImporterOpen}
          onClose={() => setIsKmlImporterOpen(false)}
          pericia={pericia}
          onApplyImport={data => {
            const updatedGeo: PericiaGeorreferenciamento = {
              ...geoData,
              pontos: data.pontos,
              areaCalculadaHa: data.areaHa,
              perimetroCalculadoMeters: data.perimetroM,
              arquivoImportadoNome: data.nomeArquivo,
              arquivoImportadoTipo: data.tipoArquivo,
              centroide: data.centroide,
            };

            const updatedPericia: Pericia = {
              ...pericia,
              imovelAvaliado: {
                ...pericia.imovelAvaliado,
                imovelNome: pericia.imovelAvaliado?.imovelNome || pericia.imovelNome || '',
                matricula: pericia.imovelAvaliado?.matricula || '',
                areaTotal: data.syncAreaTotal ? data.areaHa : pericia.imovelAvaliado?.areaTotal || 0,
                areaAgricultavel: pericia.imovelAvaliado?.areaAgricultavel || 0,
                acesso: pericia.imovelAvaliado?.acesso || '',
                indicePluviometrico: pericia.imovelAvaliado?.indicePluviometrico || '',
                topografia: pericia.imovelAvaliado?.topografia || '',
                caracteristicasSolo: pericia.imovelAvaliado?.caracteristicasSolo || '',
                aptidao: pericia.imovelAvaliado?.aptidao || '',
                infraestrutura: pericia.imovelAvaliado?.infraestrutura || '',
                produtividadeCulturas: pericia.imovelAvaliado?.produtividadeCulturas || '',
                benfeitorias: pericia.imovelAvaliado?.benfeitorias || '',
              },
              objetoDescricao: {
                ...pericia.objetoDescricao,
                areaAfetadaHa: data.syncAreaAfetada ? data.areaHa : pericia.objetoDescricao.areaAfetadaHa,
              },
              georreferenciamento: updatedGeo,
              documentosIniciais: data.syncDocumentoAnexo
                ? [
                    ...pericia.documentosIniciais,
                    {
                      id: `doc-kml-${Date.now()}`,
                      nome: `Perímetro Vetorial (${data.nomeArquivo})`,
                      tipo: 'mapa',
                      data: new Date().toISOString().split('T')[0],
                      fonte: 'Upload KML/KMZ',
                      descricao: `Perímetro e vértices processados: ${data.pontos.length} vértices, área ${data.areaHa.toFixed(2)} ha.`,
                    },
                  ]
                : pericia.documentosIniciais,
            };

            onUpdatePericia(updatedPericia);
            showToast(
              `Perímetro de "${data.nomeArquivo}" (${data.pontos.length} vértices, ${data.areaHa.toFixed(2)} ha) importado com sucesso!`
            );
          }}
        />
      )}
    </div>
  );
};
