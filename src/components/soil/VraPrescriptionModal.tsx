import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  FileCode,
  Sliders,
  Grid,
  TrendingUp,
  MapPin,
  RefreshCw,
  X,
  Play,
  Compass,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  SamplePoint,
  GridBounding,
  KrigingParameters,
  SemivariogramModel,
  DoseInterval,
  PrescriptionMapResult,
  interpolateIDW,
  interpolateKriging,
  generatePrescriptionMap,
  exportToGeoJSON,
  exportToISOXMLStructure,
  generateSyntheticPhosphorusSamples,
} from '../../utils/spatialInterpolationEngine';
import { VraGridCanvasMap } from '../geoprocessamento/VraGridCanvasMap';
import { SemivariogramInteractivePanel } from './SemivariogramInteractivePanel';

export interface VraPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  plotName: string;
  farmName: string;
  boundaryCoordinates?: [number, number][];
  existingPoints?: Array<{ id: string; lat: number; lng: number; code: string; notes?: string }>;
  onPrescriptionGenerated?: (result: PrescriptionMapResult) => void;
}

const DEFAULT_P_INTERVALS: DoseInterval[] = [
  { id: '1', minVal: 0, maxVal: 15, dose: 120, unit: 'KG_HA', label: 'Crítico (0 - 15 mg/dm³)', color: '#ef4444' },
  { id: '2', minVal: 15, maxVal: 30, dose: 70, unit: 'KG_HA', label: 'Médio (15 - 30 mg/dm³)', color: '#f59e0b' },
  { id: '3', minVal: 30, maxVal: 45, dose: 30, unit: 'KG_HA', label: 'Adequado (30 - 45 mg/dm³)', color: '#10b981' },
  { id: '4', minVal: 45, maxVal: 999, dose: 0, unit: 'KG_HA', label: 'Alto (> 45 mg/dm³)', color: '#3b82f6' },
];

const NUTRIENT_PRESETS: Record<string, { intervals: DoseInterval[]; unit: 'KG_HA' | 'T_HA' }> = {
  'Fósforo (P)': { intervals: DEFAULT_P_INTERVALS, unit: 'KG_HA' },
  'Potássio (K)': {
    unit: 'KG_HA',
    intervals: [
      { id: '1', minVal: 0, maxVal: 40, dose: 140, unit: 'KG_HA', label: 'Crítico (0 - 40 mg/dm³)', color: '#ef4444' },
      { id: '2', minVal: 40, maxVal: 80, dose: 80, unit: 'KG_HA', label: 'Médio (40 - 80 mg/dm³)', color: '#f59e0b' },
      { id: '3', minVal: 80, maxVal: 120, dose: 40, unit: 'KG_HA', label: 'Adequado (80 - 120 mg/dm³)', color: '#10b981' },
      { id: '4', minVal: 120, maxVal: 999, dose: 0, unit: 'KG_HA', label: 'Alto (> 120 mg/dm³)', color: '#3b82f6' },
    ],
  },
  'Nitrogênio (N)': {
    unit: 'KG_HA',
    intervals: [
      { id: '1', minVal: 0, maxVal: 30, dose: 120, unit: 'KG_HA', label: 'Baixa Biomassa (0 - 30 kg/ha N)', color: '#ef4444' },
      { id: '2', minVal: 30, maxVal: 60, dose: 80, unit: 'KG_HA', label: 'Média Biomassa (30 - 60 kg/ha N)', color: '#f59e0b' },
      { id: '3', minVal: 60, maxVal: 90, dose: 40, unit: 'KG_HA', label: 'Alta Biomassa (60 - 90 kg/ha N)', color: '#10b981' },
      { id: '4', minVal: 90, maxVal: 999, dose: 0, unit: 'KG_HA', label: 'Saturado (> 90 kg/ha N)', color: '#3b82f6' },
    ],
  },
  'Calagem (NC)': {
    unit: 'T_HA',
    intervals: [
      { id: '1', minVal: 0, maxVal: 1, dose: 0, unit: 'T_HA', label: 'Sem Necessidade (0 - 1.0 t/ha)', color: '#10b981' },
      { id: '2', minVal: 1, maxVal: 2, dose: 1.5, unit: 'T_HA', label: 'Calagem Leve (1.0 - 2.0 t/ha)', color: '#f59e0b' },
      { id: '3', minVal: 2, maxVal: 3.5, dose: 3.0, unit: 'T_HA', label: 'Calagem Média (2.0 - 3.5 t/ha)', color: '#ef4444' },
      { id: '4', minVal: 3.5, maxVal: 99, dose: 4.5, unit: 'T_HA', label: 'Calagem Pesada (> 3.5 t/ha)', color: '#7c3aed' },
    ],
  },
  'Gessagem (NG)': {
    unit: 'T_HA',
    intervals: [
      { id: '1', minVal: 0, maxVal: 0.5, dose: 0, unit: 'T_HA', label: 'Sem Gessagem (0 - 0.5 t/ha)', color: '#10b981' },
      { id: '2', minVal: 0.5, maxVal: 1.5, dose: 1.0, unit: 'T_HA', label: 'Gessagem Leve (0.5 - 1.5 t/ha)', color: '#f59e0b' },
      { id: '3', minVal: 1.5, maxVal: 3.0, dose: 2.0, unit: 'T_HA', label: 'Gessagem Média (1.5 - 3.0 t/ha)', color: '#ef4444' },
      { id: '4', minVal: 3.0, maxVal: 99, dose: 3.5, unit: 'T_HA', label: 'Gessagem Alta (> 3.0 t/ha)', color: '#7c3aed' },
    ],
  },
  'pH em CaCl2': {
    unit: 'T_HA',
    intervals: [
      { id: '1', minVal: 0, maxVal: 4.8, dose: 3.5, unit: 'T_HA', label: 'Muito Ácido (< 4.8)', color: '#ef4444' },
      { id: '2', minVal: 4.8, maxVal: 5.4, dose: 2.0, unit: 'T_HA', label: 'Ácido (4.8 - 5.4)', color: '#f59e0b' },
      { id: '3', minVal: 5.4, maxVal: 6.0, dose: 0.8, unit: 'T_HA', label: 'Moderado (5.4 - 6.0)', color: '#10b981' },
      { id: '4', minVal: 6.0, maxVal: 14, dose: 0, unit: 'T_HA', label: 'Ideal (> 6.0)', color: '#3b82f6' },
    ],
  },
  'Saturação por Bases (V%)': {
    unit: 'T_HA',
    intervals: [
      { id: '1', minVal: 0, maxVal: 45, dose: 2.5, unit: 'T_HA', label: 'V% Muito Baixo (< 45%)', color: '#ef4444' },
      { id: '2', minVal: 45, maxVal: 60, dose: 1.2, unit: 'T_HA', label: 'V% Médio (45 - 60%)', color: '#f59e0b' },
      { id: '3', minVal: 60, maxVal: 70, dose: 0.5, unit: 'T_HA', label: 'V% Bom (60 - 70%)', color: '#10b981' },
      { id: '4', minVal: 70, maxVal: 100, dose: 0, unit: 'T_HA', label: 'V% Pleno (> 70%)', color: '#3b82f6' },
    ],
  },
};

const VraPrescriptionModalInner: React.FC<Omit<VraPrescriptionModalProps, 'isOpen'>> = ({
  onClose,
  plotName,
  farmName,
  boundaryCoordinates,
  existingPoints = [],
  onPrescriptionGenerated,
}) => {
  const [isFullScreen, setIsFullScreen] = useState<boolean>(true);
  const [method, setMethod] = useState<'IDW' | 'Kriging'>('Kriging');
  const [nutrientName, setNutrientName] = useState('Fósforo (P)');
  const [gridResolution, setGridResolution] = useState<number>(15);

  const [idwPower, setIdwPower] = useState<number>(2);
  const [maxNeighbors, setMaxNeighbors] = useState<number>(12);

  const [krigingModel, setKrigingModel] = useState<SemivariogramModel>('spherical');
  const [nugget, setNugget] = useState<number>(0.1);
  const [sill, setSill] = useState<number>(1.2);
  const [range, setRange] = useState<number>(250);

  const [intervals, setIntervals] = useState<DoseInterval[]>(DEFAULT_P_INTERVALS);

  const [customSamples, setCustomSamples] = useState<SamplePoint[]>(() => {
    if (existingPoints && existingPoints.length >= 3) {
      return existingPoints.map((p, idx) => ({
        id: p.id,
        code: p.code || `P-${idx + 1}`,
        x: p.lng,
        y: p.lat,
        valor: 12 + ((idx * 7) % 28),
      }));
    }
    return generateSyntheticPhosphorusSamples(boundaryCoordinates);
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<PrescriptionMapResult | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'result' | 'xml'>('config');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleNutrientSelectChange = (selectedNutrient: string) => {
    setNutrientName(selectedNutrient);
    const preset = NUTRIENT_PRESETS[selectedNutrient];
    if (preset) {
      setIntervals(preset.intervals);
    }
  };

  const handleLoadSyntheticExample = () => {
    setErrorMessage(null);
    const synth = generateSyntheticPhosphorusSamples(boundaryCoordinates);
    setCustomSamples(synth);
    setIntervals(DEFAULT_P_INTERVALS);
    setNutrientName('Fósforo (P)');
  };

  const handleSampleValueChange = (id: string, val: number) => {
    setCustomSamples((prev) => prev.map((s) => (s.id === id ? { ...s, valor: val } : s)));
  };

  const handleRunPipeline = () => {
    setErrorMessage(null);
    if (!customSamples || customSamples.length < 3) {
      setErrorMessage('São necessárias pelo menos 3 amostras georreferenciadas para interpolação espacial.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      try {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        if (boundaryCoordinates && boundaryCoordinates.length >= 3) {
          boundaryCoordinates.forEach(([lat, lng]) => {
            if (lng < minX) minX = lng;
            if (lng > maxX) maxX = lng;
            if (lat < minY) minY = lat;
            if (lat > maxY) maxY = lat;
          });
        } else {
          customSamples.forEach((s) => {
            if (s.x < minX) minX = s.x;
            if (s.x > maxX) maxX = s.x;
            if (s.y < minY) minY = s.y;
            if (s.y > maxY) maxY = s.y;
          });
          const dx = (maxX - minX) * 0.1 || 0.001;
          const dy = (maxY - minY) * 0.1 || 0.001;
          minX -= dx;
          maxX += dx;
          minY -= dy;
          maxY += dy;
        }

        const gridBounding: GridBounding = {
          minX,
          maxX,
          minY,
          maxY,
          resolutionMeters: gridResolution,
          boundaryCoordinates,
        };

        const interpolatedGrid =
          method === 'IDW'
            ? interpolateIDW(customSamples, gridBounding, idwPower, maxNeighbors)
            : interpolateKriging(customSamples, gridBounding, {
                modelo: krigingModel,
                nugget,
                sill,
                range,
              });

        const prescMap = generatePrescriptionMap(
          interpolatedGrid,
          intervals,
          `Prescrição VRA ${nutrientName}`,
          nutrientName
        );

        setResult(prescMap);
        setActiveTab('result');

        if (onPrescriptionGenerated) {
          onPrescriptionGenerated(prescMap);
        }
      } catch (err) {
        console.error('Erro no processamento da interpolação:', err);
        setErrorMessage('Não foi possível concluir a interpolação espacial. Revise os parâmetros e tente novamente.');
      } finally {
        setIsProcessing(false);
      }
    }, 60);
  };

  const handleDownloadGeoJSON = () => {
    if (!result) return;
    const jsonStr = exportToGeoJSON(result);
    const blob = new Blob([jsonStr], { type: 'application/geo+json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VRA_${nutrientName.replace(/[^A-Za-z0-9]/g, '_')}_${plotName.replace(/\s+/g, '_')}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadISOXML = () => {
    if (!result) return;
    const xmlStr = exportToISOXMLStructure(result, `TASK_${plotName}`);
    const blob = new Blob([xmlStr], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TASKDATA_${plotName.replace(/\s+/g, '_')}.XML`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`fixed inset-0 z-[2000] flex flex-col bg-black/60 backdrop-blur-xs ${
        isFullScreen ? 'p-0' : 'p-2 sm:p-5 items-center justify-center overflow-y-auto'
      }`}
    >
      <div
        className={`bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 w-full overflow-hidden flex flex-col ${
          isFullScreen ? 'h-full rounded-none' : 'max-w-6xl rounded-xl my-auto max-h-[92vh]'
        }`}
      >
        {/* Cabeçalho Hairline */}
        <div className="bg-white dark:bg-zinc-900 px-4 sm:px-5 py-3.5 flex items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 truncate">
                Interpolação Espacial e Mapa de Prescrição (VRA)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
              {farmName} · {plotName} · {nutrientName}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="h-8 px-2.5 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium"
              title={isFullScreen ? 'Restaurar Janela' : 'Abrir em Tela Cheia'}
            >
              {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullScreen ? 'Janela' : 'Tela cheia'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal VRA"
              className="h-8 w-8 inline-flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Abas */}
        <div className="px-4 sm:px-5 py-2 bg-slate-50 dark:bg-zinc-900/70 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'config'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>1. Parâmetros e Semivariograma</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('result')}
              disabled={!result}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === 'result'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>2. Mapa Visual e Zonas VRA</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('xml')}
              disabled={!result}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                activeTab === 'xml'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>3. ISOXML (ISO 11783-10)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleLoadSyntheticExample}
            className="h-8 px-3 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded-md text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            title="Carrega 10 pontos sintéticos georreferenciados de Fósforo (P) para demonstração"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Exemplo Sintético (10 Pontos P)</span>
          </button>
        </div>

        {/* Corpo */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 grow text-xs text-slate-700 dark:text-zinc-300">
          {errorMessage && (
            <div className="px-3.5 py-2.5 rounded-md border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-500 hover:text-rose-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Método */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('IDW')}
                  className={`text-left p-3.5 rounded-lg border transition-colors cursor-pointer space-y-1 ${
                    method === 'IDW'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100 inline-flex items-center gap-1.5">
                      <Grid className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Inverso do Peso da Distância (IDW)</span>
                    </span>
                    {method === 'IDW' && (
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Método determinístico rápido que atribui maior peso aos pontos mais próximos do centro de cada célula.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('Kriging')}
                  className={`text-left p-3.5 rounded-lg border transition-colors cursor-pointer space-y-1 ${
                    method === 'Kriging'
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100 inline-flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Krigagem Ordinária</span>
                    </span>
                    {method === 'Kriging' && (
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Método geoestatístico que modela a estrutura de autocorrelação espacial por semivariograma teórico.
                  </p>
                </button>
              </div>

              {/* Nutriente & Grid */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-3">
                <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Nutriente e Resolução da Grade</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                      Nutriente / Parâmetro do Solo
                    </label>
                    <select
                      value={nutrientName}
                      onChange={(e) => handleNutrientSelectChange(e.target.value)}
                      className="w-full h-8 px-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-md font-medium cursor-pointer text-xs text-slate-900 dark:text-zinc-100"
                    >
                      <optgroup label="Macronutrientes (Primários e Secundários)">
                        <option value="Fósforo (P)">Fósforo (P)</option>
                        <option value="Potássio (K)">Potássio (K)</option>
                        <option value="Nitrogênio (N)">Nitrogênio (N)</option>
                        <option value="Cálcio (Ca)">Cálcio (Ca)</option>
                        <option value="Magnésio (Mg)">Magnésio (Mg)</option>
                        <option value="Enxofre (S)">Enxofre (S)</option>
                      </optgroup>
                      <optgroup label="Micronutrientes">
                        <option value="Boro (B)">Boro (B)</option>
                        <option value="Cobre (Cu)">Cobre (Cu)</option>
                        <option value="Ferro (Fe)">Ferro (Fe)</option>
                        <option value="Manganês (Mn)">Manganês (Mn)</option>
                        <option value="Zinco (Zn)">Zinco (Zn)</option>
                        <option value="Molibdênio (Mo)">Molibdênio (Mo)</option>
                        <option value="Silício (Si)">Silício (Si)</option>
                        <option value="Cobalto (Co)">Cobalto (Co)</option>
                        <option value="Selênio (Se)">Selênio (Se)</option>
                      </optgroup>
                      <optgroup label="Atributos Físico-Químicos e Manejo">
                        <option value="pH em CaCl2">pH em CaCl2</option>
                        <option value="Matéria Orgânica (M.O.)">Matéria Orgânica (M.O.)</option>
                        <option value="Alumínio Tópico (Al³⁺)">Alumínio Trocável (Al³⁺)</option>
                        <option value="Acidez Potencial (H+Al)">Acidez Potencial (H+Al)</option>
                        <option value="Saturação por Bases (V%)">Saturação por Bases (V%)</option>
                        <option value="Saturação por Alumínio (m%)">Saturação por Alumínio (m%)</option>
                        <option value="Capacidade de Troca Catiônica (CTC)">Capacidade de Troca Catiônica (CTC)</option>
                        <option value="Teor de Argila (%)">Teor de Argila (%)</option>
                        <option value="Teor de Areia (%)">Teor de Areia (%)</option>
                        <option value="Teor de Silte (%)">Teor de Silte (%)</option>
                        <option value="Calagem (NC)">Calagem (NC - t/ha)</option>
                        <option value="Gessagem (NG)">Gessagem (NG - t/ha)</option>
                        <option value="BioAS (Atividade Enzimática)">BioAS (Atividade Enzimática)</option>
                        <option value="Relação Ca/Mg">Relação Ca/Mg</option>
                        <option value="Relação Ca/K">Relação Ca/K</option>
                        <option value="Relação Mg/K">Relação Mg/K</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                      Resolução do Grid (m)
                    </label>
                    <select
                      value={gridResolution}
                      onChange={(e) => setGridResolution(Number(e.target.value))}
                      className="w-full h-8 px-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-md font-medium cursor-pointer text-xs text-slate-900 dark:text-zinc-100"
                    >
                      <option value={10}>10 metros (Grade Alta / Detalhada)</option>
                      <option value={15}>15 metros (Padrão Recomendado)</option>
                      <option value={20}>20 metros (Grade Média)</option>
                      <option value={30}>30 metros (Grade Larga)</option>
                    </select>
                  </div>
                </div>

                {method === 'IDW' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                        Expoente de Distância (Power)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        step="0.5"
                        value={idwPower}
                        onChange={(e) => setIdwPower(Number(e.target.value))}
                        className="w-full h-8 px-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-md font-medium tabular-nums text-slate-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block mb-1">
                        Máximo de Vizinhos Próximos
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="24"
                        value={maxNeighbors}
                        onChange={(e) => setMaxNeighbors(Number(e.target.value))}
                        className="w-full h-8 px-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-md font-medium tabular-nums text-slate-900 dark:text-zinc-100"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Semivariograma */}
              {method === 'Kriging' && (
                <SemivariogramInteractivePanel
                  samples={customSamples}
                  krigingParams={{ modelo: krigingModel, nugget, sill, range }}
                  onChangeParams={(params) => {
                    setKrigingModel(params.modelo);
                    setNugget(params.nugget);
                    setSill(params.sill);
                    setRange(params.range);
                  }}
                />
              )}

              {/* Tabela de Amostras */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Amostras Georreferenciadas ({customSamples.length} pontos)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Ajuste os teores medidos
                  </span>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
                  <table className="w-full text-left text-xs tabular-nums">
                    <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 font-semibold text-[11px] text-slate-500 dark:text-zinc-400">
                      <tr>
                        <th className="py-2 px-3">Código</th>
                        <th className="py-2 px-3">Latitude (Y)</th>
                        <th className="py-2 px-3">Longitude (X)</th>
                        <th className="py-2 px-3">Teor ({nutrientName})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {customSamples.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                          <td className="py-2 px-3 font-medium text-slate-900 dark:text-zinc-100">
                            {s.code}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                            {s.y.toFixed(5)}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                            {s.x.toFixed(5)}
                          </td>
                          <td className="py-1.5 px-3">
                            <input
                              type="number"
                              step="0.1"
                              value={s.valor}
                              onChange={(e) => handleSampleValueChange(s.id, Number(e.target.value))}
                              className="w-24 h-7 px-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded text-xs font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={handleRunPipeline}
                  disabled={isProcessing}
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md transition-colors cursor-pointer inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processando Matriz Espacial...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Executar Interpolação e Gerar Mapa VRA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'result' && result && (
            <div className="space-y-4">
              {/* Faixa KPI */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 tabular-nums">
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                    Área Total Mapeada
                  </span>
                  <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                    {result.metadata.totalAreaHa} ha
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                    Insumo Total Requerido
                  </span>
                  <strong className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                    {result.metadata.totalInputRequired} {result.metadata.inputUnit}
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                    Teor Médio Interpolado
                  </span>
                  <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                    {result.metadata.meanValue}
                  </strong>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                    Células da Grade
                  </span>
                  <strong className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                    {result.features.length} ({result.metadata.gridResolutionMeters}m)
                  </strong>
                </div>
              </div>

              {/* Mapa Grid */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Grid Interpolado sobre Imagem de Satélite</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Clique ou passe o cursor nas células para inspecionar.
                  </span>
                </div>

                <VraGridCanvasMap
                  prescriptionResult={result}
                  height={isFullScreen ? '540px' : '400px'}
                  nutrientName={nutrientName}
                  plotName={plotName}
                  farmName={farmName}
                  boundaryCoordinates={boundaryCoordinates}
                  onDownloadGeoJSON={handleDownloadGeoJSON}
                  onDownloadISOXML={handleDownloadISOXML}
                />
              </div>

              {/* Tabela de Zonas */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Zonas de Aplicação Prescritas</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadGeoJSON}
                      className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar GeoJSON</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadISOXML}
                      className="h-8 px-3 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-md font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <FileCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Baixar ISOXML</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs tabular-nums">
                    <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 font-semibold text-[11px] text-slate-500 dark:text-zinc-400">
                      <tr>
                        <th className="py-2 px-3">Zona / ID</th>
                        <th className="py-2 px-3">Teor Estimado</th>
                        <th className="py-2 px-3">Classe Agronômica</th>
                        <th className="py-2 px-3">Dose Prescrita</th>
                        <th className="py-2 px-3">Insumo na Célula</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {result.features.slice(0, 30).map((f) => {
                        const p = f.properties;
                        return (
                          <tr key={p.ID} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                            <td className="py-2 px-3 font-medium text-slate-900 dark:text-zinc-100">
                              {p.ID}
                            </td>
                            <td className="py-2 px-3 font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                              {p.VALOR_INTERPOLADO}
                            </td>
                            <td className="py-2 px-3">
                              <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                                <span
                                  className="w-2 h-2 rounded-sm shrink-0"
                                  style={{ backgroundColor: p.COLOR }}
                                />
                                <span>{p.CLASS_LABEL}</span>
                              </span>
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-900 dark:text-zinc-100">
                              {p.DOSE_TARGET} {p.UNIT}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-500 dark:text-zinc-400">
                              {p.TOTAL_INPUT_KG_TON} kg/ton
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'xml' && result && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Arquivo ISO 11783-10 (TASKDATA.XML)</span>
                  </h4>
                  <p className="text-slate-500 dark:text-zinc-400 text-[11px] mt-0.5">
                    Compatível com monitores John Deere, Case IH, New Holland, Stara, Jacto, Trimble e AGCO.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadISOXML}
                  className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar TASKDATA.XML</span>
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-emerald-300 p-3.5 rounded-lg font-mono text-[11px] overflow-x-auto max-h-[500px] border border-slate-200 dark:border-zinc-800">
                <pre>{exportToISOXMLStructure(result, `TASK_${plotName}`)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const VraPrescriptionModal: React.FC<VraPrescriptionModalProps> = ({
  isOpen,
  ...rest
}) => {
  if (!isOpen) return null;
  return <VraPrescriptionModalInner {...rest} />;
};
