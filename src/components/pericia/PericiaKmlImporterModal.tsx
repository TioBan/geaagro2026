import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Upload,
  FileCode,
  MapPin,
  Layers,
  Compass,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Maximize2,
  Minimize2,
  Info,
  ChevronRight,
  ExternalLink,
  Ruler,
  Landmark,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Pericia, PericiaPontoGPS, PericiaCoordenadas } from '../../types/pericia';
import {
  parseKML,
  parseKMZ,
  parseGeoJSON,
  parseGPX,
  parsePastedCoordinates,
  calculatePolygonArea,
  calculatePerimeter,
  calculateCentroid,
  decimalToGms,
  decimalToUtm,
  KMLFeature,
} from '../../utils/periciaGeoUtils';

interface PericiaKmlImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  pericia: Pericia;
  onApplyImport: (data: {
    pontos: PericiaPontoGPS[];
    areaHa: number;
    areaM2: number;
    perimetroM: number;
    centroide: PericiaCoordenadas;
    nomeArquivo: string;
    tipoArquivo: 'kml' | 'kmz' | 'geojson' | 'gpx';
    syncAreaTotal: boolean;
    syncAreaAfetada: boolean;
    syncCoordsCentrais: boolean;
    syncDocumentoAnexo: boolean;
  }) => void;
}

export const PericiaKmlImporterModal: React.FC<PericiaKmlImporterModalProps> = ({
  isOpen,
  onClose,
  pericia,
  onApplyImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Parsed File State
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<'kml' | 'kmz' | 'geojson' | 'gpx'>('kml');
  const [features, setFeatures] = useState<KMLFeature[]>([]);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('all');
  const [customPoints, setCustomPoints] = useState<PericiaPontoGPS[]>([]);

  // Sync Options
  const [syncAreaTotal, setSyncAreaTotal] = useState(true);
  const [syncAreaAfetada, setSyncAreaAfetada] = useState(false);
  const [syncCoordsCentrais, setSyncCoordsCentrais] = useState(true);
  const [syncDocumentoAnexo, setSyncDocumentoAnexo] = useState(true);

  // Active points based on selected feature or all
  const activePoints = useMemo(() => {
    if (selectedFeatureId === 'all') {
      if (customPoints.length > 0) return customPoints;
      // Combine all features
      return features.flatMap(f => f.points);
    }
    const found = features.find(f => f.id === selectedFeatureId);
    return found ? found.points : [];
  }, [features, selectedFeatureId, customPoints]);

  // Derived metrics
  const metrics = useMemo(() => {
    if (activePoints.length === 0) {
      return {
        areaHa: 0,
        areaM2: 0,
        perimetroM: 0,
        perimetroKm: 0,
        centroide: { lat: -16.1482, lng: -47.5192 },
        utm: { easting: 0, northing: 0, zone: 22, hemisphere: 'S' as const },
        latGms: '',
        lngGms: '',
      };
    }

    const { areaHa, areaM2 } = calculatePolygonArea(activePoints);
    const perimetroM = calculatePerimeter(activePoints);
    const perimetroKm = perimetroM / 1000;
    const centroide = calculateCentroid(activePoints);
    const utm = decimalToUtm(centroide.lat, centroide.lng);
    const latGms = decimalToGms(centroide.lat, true);
    const lngGms = decimalToGms(centroide.lng, false);

    return {
      areaHa,
      areaM2,
      perimetroM,
      perimetroKm,
      centroide,
      utm,
      latGms,
      lngGms,
    };
  }, [activePoints]);

  if (!isOpen) return null;

  // Process File Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const processUploadedFile = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const fName = file.name;
    const ext = fName.split('.').pop()?.toLowerCase() || '';

    try {
      if (ext === 'kmz') {
        const parsed = await parseKMZ(file);
        if (parsed.points.length === 0 && (!parsed.features || parsed.features.length === 0)) {
          throw new Error('Nenhum polígono ou coordenada geográfica válida foi encontrada no arquivo KMZ.');
        }
        setFileName(fName);
        setFileType('kmz');
        setFeatures(parsed.features || []);
        setCustomPoints(parsed.points);
        setSelectedFeatureId(parsed.features && parsed.features.length > 0 ? parsed.features[0].id : 'all');
        setSuccessMsg(`Arquivo KMZ "${fName}" descompactado e processado com sucesso!`);
      } else if (ext === 'kml') {
        const text = await file.text();
        const parsed = parseKML(text);
        if (parsed.points.length === 0 && (!parsed.features || parsed.features.length === 0)) {
          throw new Error('Nenhum polígono ou coordenada geográfica válida foi encontrada no arquivo KML.');
        }
        setFileName(fName);
        setFileType('kml');
        setFeatures(parsed.features || []);
        setCustomPoints(parsed.points);
        setSelectedFeatureId(parsed.features && parsed.features.length > 0 ? parsed.features[0].id : 'all');
        setSuccessMsg(`Arquivo KML "${fName}" analisado com sucesso!`);
      } else if (ext === 'geojson' || ext === 'json') {
        const text = await file.text();
        const points = parseGeoJSON(text);
        if (points.length === 0) {
          throw new Error('Nenhuma coordenada encontrada no arquivo GeoJSON.');
        }
        setFileName(fName);
        setFileType('geojson');
        setFeatures([
          {
            id: 'geo-1',
            name: fName.replace(/\.[^/.]+$/, ''),
            type: 'Polygon',
            points,
            ...calculatePolygonArea(points),
            perimeterM: calculatePerimeter(points),
          },
        ]);
        setCustomPoints(points);
        setSelectedFeatureId('geo-1');
        setSuccessMsg(`Arquivo GeoJSON importado com sucesso!`);
      } else if (ext === 'gpx') {
        const text = await file.text();
        const points = parseGPX(text);
        if (points.length === 0) {
          throw new Error('Nenhum trilha ou ponto encontrado no arquivo GPX.');
        }
        setFileName(fName);
        setFileType('gpx');
        setFeatures([
          {
            id: 'gpx-1',
            name: fName.replace(/\.[^/.]+$/, ''),
            type: 'Polygon',
            points,
            ...calculatePolygonArea(points),
            perimeterM: calculatePerimeter(points),
          },
        ]);
        setCustomPoints(points);
        setSelectedFeatureId('gpx-1');
        setSuccessMsg(`Arquivo GPX importado com sucesso!`);
      } else {
        throw new Error('Formato de arquivo não suportado. Por favor utilize arquivos .kml, .kmz, .geojson ou .gpx.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar arquivo geográfico.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Demo Farm KML Loader
  const handleLoadDemoFarmKml = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Realistic Demo Farm KML: Fazenda Santa Maria (138.5 ha with Talhão 1 Soja, Talhão 2 Milho, APP)
    const demoKmlText = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Fazenda Santa Helena - Perímetro e Glebas Agrícolas</name>
    <description>Levantamento Georreferenciado INCRA/SIGEF e CAR</description>
    <Placemark>
      <name>Perímetro Geral da Fazenda (Sede e Lavoura)</name>
      <description>Perímetro completo do imóvel rural para fins de perícia agronômica</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -47.519200,-16.148200,850.0
              -47.514500,-16.148500,852.0
              -47.512100,-16.152300,845.0
              -47.513800,-16.156100,840.0
              -47.518900,-16.157200,842.0
              -47.522100,-16.153400,848.0
              -47.521000,-16.149800,850.0
              -47.519200,-16.148200,850.0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
    <Placemark>
      <name>Gleba A - Área Atingida / Sinistro</name>
      <description>Talhão periciado com sintomas de fitotoxicidade e deriva</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -47.519200,-16.148200,850.0
              -47.514500,-16.148500,852.0
              -47.512100,-16.152300,845.0
              -47.516500,-16.151000,847.0
              -47.519200,-16.148200,850.0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
    <Placemark>
      <name>Área de Preservação Permanente (APP - Nascente)</name>
      <description>Vegetação nativa ripária protegida pelo Código Florestal</description>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -47.521000,-16.149800,850.0
              -47.522100,-16.153400,848.0
              -47.518900,-16.157200,842.0
              -47.520000,-16.155000,846.0
              -47.521000,-16.149800,850.0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>`;

    try {
      const parsed = parseKML(demoKmlText);
      setFileName('Fazenda_Santa_Helena_CAR_SIGEF.kml');
      setFileType('kml');
      setFeatures(parsed.features || []);
      setCustomPoints(parsed.points);
      setSelectedFeatureId(parsed.features[0]?.id || 'all');
      setSuccessMsg('Modelo KML oficial de Fazenda (3 camadas / talhões) carregado com sucesso!');
    } catch (e: any) {
      setErrorMsg('Erro ao gerar modelo KML.');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm Apply Import
  const handleConfirm = () => {
    if (activePoints.length === 0) {
      setErrorMsg('Nenhuma coordenada válida selecionada para importar.');
      return;
    }

    onApplyImport({
      pontos: activePoints,
      areaHa: metrics.areaHa,
      areaM2: metrics.areaM2,
      perimetroM: metrics.perimetroM,
      centroide: metrics.centroide,
      nomeArquivo: fileName || 'perimetro_importado.kml',
      tipoArquivo: fileType,
      syncAreaTotal,
      syncAreaAfetada,
      syncCoordsCentrais,
      syncDocumentoAnexo,
    });

    onClose();
  };

  // SVG Polygon coordinates preview helper
  const svgBounds = useMemo(() => {
    if (activePoints.length === 0) return null;
    const lats = activePoints.map(p => p.lat);
    const lngs = activePoints.map(p => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = maxLat - minLat || 0.001;
    const lngSpan = maxLng - minLng || 0.001;

    // ViewBox: 0 0 500 320 with 40px padding
    const width = 500;
    const height = 320;
    const pad = 40;

    const pointsSvg = activePoints
      .map(p => {
        const x = pad + ((p.lng - minLng) / lngSpan) * (width - pad * 2);
        // Invert Y because latitude goes north/up
        const y = height - pad - ((p.lat - minLat) / latSpan) * (height - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    const centroidX = pad + ((metrics.centroide.lng - minLng) / lngSpan) * (width - pad * 2);
    const centroidY = height - pad - ((metrics.centroide.lat - minLat) / latSpan) * (height - pad * 2);

    return {
      pointsSvg,
      centroidX,
      centroidY,
      minLat,
      maxLat,
      minLng,
      maxLng,
      width,
      height,
    };
  }, [activePoints, metrics.centroide]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 via-slate-50 to-white dark:from-emerald-950/30 dark:via-zinc-900 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Importação & Processamento de KML / KMZ</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  Google Earth • CAR • SIGEF
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Imóvel:{' '}
                <span className="font-semibold text-slate-700 dark:text-zinc-300">
                  {pericia.imovelNome || 'Imóvel Periciado'}
                </span>{' '}
                • Código:{' '}
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {pericia.codigoPericia}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Top Info Banner & Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Upload Dropzone */}
            <div className="md:col-span-2 border-2 border-dashed border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 rounded-2xl p-4 sm:p-5 bg-emerald-50/30 dark:bg-emerald-950/10 text-center flex flex-col items-center justify-center transition-all relative group cursor-pointer">
              <input
                ref={fileInputRef}
                type="file"
                accept=".kml,.kmz,.geojson,.gpx,.json"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                Arraste ou clique para selecionar seu arquivo KML ou KMZ
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Suporta KML, KMZ compactado, GeoJSON e GPX do Google Earth, QGIS, INCRA, CAR e SIGEF.
              </p>
            </div>

            {/* Quick Demo Template */}
            <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Demonstração Rápida
                </span>
                <p className="text-xs text-slate-700 dark:text-zinc-300 font-semibold mt-1">
                  Testar com Perímetro Oficial
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Carregue um arquivo KML com 3 camadas de fazenda (Perímetro, Área Sinistrada e APP).
                </p>
              </div>

              <button
                type="button"
                onClick={handleLoadDemoFarmKml}
                disabled={isLoading}
                className="mt-3 w-full py-2 px-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-zinc-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Carregar Modelo de Teste</span>
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* If features / polygons were extracted */}
          {features.length > 0 && (
            <div className="space-y-4">
              
              {/* Layer / Feature Selection Tabs if multiple */}
              {features.length > 1 && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block mb-2">
                    Camadas Geográficas Encontradas no Arquivo ({features.length}):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {features.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFeatureId(f.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedFeatureId === f.id
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-white dark:bg-zinc-800/70 border-slate-200 dark:border-zinc-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {f.name}
                          </span>
                          {selectedFeatureId === f.id && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                          <span>{f.points.length} vértices</span>
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            {f.areaHa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Geographic Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                    Área Calculada
                  </span>
                  <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {metrics.areaHa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ha
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    {metrics.areaM2.toLocaleString('pt-BR')} m²
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                    Perímetro Linear
                  </span>
                  <p className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mt-0.5">
                    {metrics.perimetroM.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} m
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    {metrics.perimetroKm.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} km
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                    Vértices Extraídos
                  </span>
                  <p className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mt-0.5">
                    {activePoints.length}
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Coordenadas WGS84
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-2xl p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
                    Fuso UTM & Hemisfério
                  </span>
                  <p className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mt-0.5">
                    Fuso {metrics.utm.zone}{metrics.utm.hemisphere}
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    SIRGAS 2000
                  </span>
                </div>
              </div>

              {/* Vector Polygon Map Preview */}
              {svgBounds && (
                <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl bg-slate-900 p-4 text-white relative overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Delimitação Vetorial do Perímetro
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400">
                      Centróide: {metrics.centroide.lat.toFixed(5)}, {metrics.centroide.lng.toFixed(5)}
                    </span>
                  </div>

                  {/* SVG Canvas */}
                  <div className="w-full flex items-center justify-center py-2">
                    <svg
                      viewBox={`0 0 ${svgBounds.width} ${svgBounds.height}`}
                      className="w-full max-h-56 stroke-linejoin-round"
                    >
                      {/* Background Grid */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Polygon Filled */}
                      <polygon
                        points={svgBounds.pointsSvg}
                        className="fill-emerald-500/25 stroke-emerald-400 stroke-2"
                      />

                      {/* Vertices points */}
                      {activePoints.map((p, idx) => {
                        const lats = activePoints.map(pt => pt.lat);
                        const lngs = activePoints.map(pt => pt.lng);
                        const minLat = Math.min(...lats);
                        const maxLat = Math.max(...lats);
                        const minLng = Math.min(...lngs);
                        const maxLng = Math.max(...lngs);
                        const latSpan = maxLat - minLat || 0.001;
                        const lngSpan = maxLng - minLng || 0.001;

                        const x = 40 + ((p.lng - minLng) / lngSpan) * (svgBounds.width - 80);
                        const y = svgBounds.height - 40 - ((p.lat - minLat) / latSpan) * (svgBounds.height - 80);

                        return (
                          <g key={p.id || idx}>
                            <circle cx={x} cy={y} r="3.5" className="fill-amber-400 stroke-slate-900 stroke-1" />
                            <text
                              x={x + 5}
                              y={y - 5}
                              className="fill-slate-300 text-[9px] font-mono select-none"
                            >
                              {p.identificador}
                            </text>
                          </g>
                        );
                      })}

                      {/* Centroid Mark */}
                      <circle
                        cx={svgBounds.centroidX}
                        cy={svgBounds.centroidY}
                        r="5"
                        className="fill-rose-500 stroke-white stroke-1"
                      />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800 pt-2 mt-1">
                    <span>GMS: {metrics.latGms} • {metrics.lngGms}</span>
                    <span>UTM: E {metrics.utm.easting.toLocaleString('pt-BR')} m • N {metrics.utm.northing.toLocaleString('pt-BR')} m</span>
                  </div>
                </div>
              )}

              {/* Sync Options Checkboxes */}
              <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
                  Opções de Atualização Automática no Laudo:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <label className="flex items-center gap-2.5 text-slate-700 dark:text-zinc-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncAreaTotal}
                      onChange={e => setSyncAreaTotal(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Atualizar Área Total do Imóvel ({metrics.areaHa.toFixed(2)} ha)</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-slate-700 dark:text-zinc-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncAreaAfetada}
                      onChange={e => setSyncAreaAfetada(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Definir como Área Afetada/Periciada</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-slate-700 dark:text-zinc-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncCoordsCentrais}
                      onChange={e => setSyncCoordsCentrais(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Definir Centróide como Ponto Central da Perícia</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-slate-700 dark:text-zinc-300 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncDocumentoAnexo}
                      onChange={e => setSyncDocumentoAnexo(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Registrar Arquivo no Inventário de Documentos</span>
                  </label>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-4 sm:px-6 sm:py-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50 dark:bg-zinc-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={activePoints.length === 0 || isLoading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Aplicar Perímetro à Perícia ({activePoints.length} Vértices)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
