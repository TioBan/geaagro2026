import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Layers,
  Download,
  FileCode,
  Sliders,
  CheckCircle2,
  Grid,
  TrendingUp,
  MapPin,
  RefreshCw,
  X,
  Play,
  HelpCircle,
  FileText,
  Compass,
  AlertCircle,
  Activity,
  Maximize2,
  Minimize2
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
  generateSyntheticPhosphorusSamples
} from '../../utils/spatialInterpolationEngine';
import { VraGridCanvasMap } from '../geoprocessamento/VraGridCanvasMap';
import { SemivariogramInteractivePanel } from './SemivariogramInteractivePanel';

interface VraPrescriptionModalProps {
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
    ]
  },
  'Nitrogênio (N)': {
    unit: 'KG_HA',
    intervals: [
      { id: '1', minVal: 0, maxVal: 30, dose: 120, unit: 'KG_HA', label: 'Baixa Biomassa (0 - 30 kg/ha N)', color: '#ef4444' },
      { id: '2', minVal: 30, maxVal: 60, dose: 80, unit: 'KG_HA', label: 'Média Biomassa (30 - 60 kg/ha N)', color: '#f59e0b' },
      { id: '3', minVal: 60, maxVal: 90, dose: 40, unit: 'KG_HA', label: 'Alta Biomassa (60 - 90 kg/ha N)', color: '#10b981' },
      { id: '4', minVal: 90, maxVal: 999, dose: 0, unit: 'KG_HA', label: 'Saturado (> 90 kg/ha N)', color: '#3b82f6' },
    ]
  },
  'Calagem (NC)': {
    unit: 'T_HA',
    intervals: [
      { id: '1', minVal: 0, maxVal: 1, dose: 0, unit: 'T_HA', label: 'Sem Necessidade (0 - 1.0 t/ha)', color: '#10b981' },
      { id: '2', minVal: 1, maxVal: 2, dose: 1.5, unit: 'T_HA', label: 'Calagem Leve (1.0 - 2.0 t/ha)', color: '#f59e0b' },
      { id: '3', minVal: 2, maxVal: 3.5, dose: 3.0, unit: 'T_HA', label: 'Calagem Média (2.0 - 3.5 t/ha)', color: '#ef4444' },
      { id: '4', minVal: 3.5, maxVal: 99, dose: 4.5, unit: 'T_HA', label: 'Calagem Pesada (> 3.5 t/ha)', color: '#7c3aed' },
    ]
  },
  'Gessagem (NG)': {
    unit: 'T_HA',
    intervals: [
      { id: '1', minVal: 0, maxVal: 0.5, dose: 0, unit: 'T_HA', label: 'Sem Gessagem (0 - 0.5 t/ha)', color: '#10b981' },
      { id: '2', minVal: 0.5, maxVal: 1.5, dose: 1.0, unit: 'T_HA', label: 'Gessagem Leve (0.5 - 1.5 t/ha)', color: '#f59e0b' },
      { id: '3', minVal: 1.5, maxVal: 3.0, dose: 2.0, unit: 'T_HA', label: 'Gessagem Média (1.5 - 3.0 t/ha)', color: '#ef4444' },
      { id: '4', minVal: 3.0, maxVal: 99, dose: 3.5, unit: 'T_HA', label: 'Gessagem Alta (> 3.0 t/ha)', color: '#7c3aed' },
    ]
  },
  'pH em CaCl2': {
    unit: 'T_HA',
    intervals: [
      { id: '1', minVal: 0, maxVal: 4.8, dose: 3.5, unit: 'T_HA', label: 'Muito Ácido (< 4.8)', color: '#ef4444' },
      { id: '2', minVal: 4.8, maxVal: 5.4, dose: 2.0, unit: 'T_HA', label: 'Ácido (4.8 - 5.4)', color: '#f59e0b' },
      { id: '3', minVal: 5.4, maxVal: 6.0, dose: 0.8, unit: 'T_HA', label: 'Moderado (5.4 - 6.0)', color: '#10b981' },
      { id: '4', minVal: 6.0, maxVal: 14, dose: 0, unit: 'T_HA', label: 'Ideal (> 6.0)', color: '#3b82f6' },
    ]
  },
  'Saturação por Bases (V%)': {
    unit: 'T_HA',
    intervals: [
      { id: '1', minVal: 0, maxVal: 45, dose: 2.5, unit: 'T_HA', label: 'V% Muito Baixo (< 45%)', color: '#ef4444' },
      { id: '2', minVal: 45, maxVal: 60, dose: 1.2, unit: 'T_HA', label: 'V% Médio (45 - 60%)', color: '#f59e0b' },
      { id: '3', minVal: 60, maxVal: 70, dose: 0.5, unit: 'T_HA', label: 'V% Bom (60 - 70%)', color: '#10b981' },
      { id: '4', minVal: 70, maxVal: 100, dose: 0, unit: 'T_HA', label: 'V% Pleno (> 70%)', color: '#3b82f6' },
    ]
  }
};

export const VraPrescriptionModal: React.FC<VraPrescriptionModalProps> = ({
  isOpen,
  onClose,
  plotName,
  farmName,
  boundaryCoordinates,
  existingPoints = [],
  onPrescriptionGenerated,
}) => {
  if (!isOpen) return null;

  // Estado de Tela Cheia (Default true conforme solicitado)
  const [isFullScreen, setIsFullScreen] = useState<boolean>(true);

  // Estado dos Parâmetros do Motor
  const [method, setMethod] = useState<'IDW' | 'Kriging'>('Kriging'); // Padrão Krigagem para demonstrar o painel
  const [nutrientName, setNutrientName] = useState('Fósforo (P)');
  const [gridResolution, setGridResolution] = useState<number>(15);

  // Parâmetros IDW
  const [idwPower, setIdwPower] = useState<number>(2);
  const [maxNeighbors, setMaxNeighbors] = useState<number>(12);

  // Parâmetros Krigagem
  const [krigingModel, setKrigingModel] = useState<SemivariogramModel>('spherical');
  const [nugget, setNugget] = useState<number>(0.1);
  const [sill, setSill] = useState<number>(1.2);
  const [range, setRange] = useState<number>(250);

  // Intervalos de Dose / Regras Agronômicas
  const [intervals, setIntervals] = useState<DoseInterval[]>(DEFAULT_P_INTERVALS);

  // Amostras ativas
  const [customSamples, setCustomSamples] = useState<SamplePoint[]>(() => {
    if (existingPoints && existingPoints.length >= 3) {
      return existingPoints.map((p, idx) => ({
        id: p.id,
        code: p.code || `P-${idx + 1}`,
        x: p.lng,
        y: p.lat,
        valor: 12 + ((idx * 7) % 28), // Valor padrão se não especificado
      }));
    }
    return generateSyntheticPhosphorusSamples(boundaryCoordinates);
  });

  // Estado de Processamento e Resultado
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PrescriptionMapResult | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'result' | 'xml'>('config');

  // Tratar mudança no Select de Nutriente / Parâmetro
  const handleNutrientSelectChange = (selectedNutrient: string) => {
    setNutrientName(selectedNutrient);
    const preset = NUTRIENT_PRESETS[selectedNutrient];
    if (preset) {
      setIntervals(preset.intervals);
    }
  };

  // Carregar Exemplo Sintético
  const handleLoadSyntheticExample = () => {
    const synth = generateSyntheticPhosphorusSamples(boundaryCoordinates);
    setCustomSamples(synth);
    setIntervals(DEFAULT_P_INTERVALS);
    setNutrientName('Fósforo (P)');
  };

  // Atualizar Valor de uma Amostra Específica
  const handleSampleValueChange = (id: string, val: number) => {
    setCustomSamples(prev => prev.map(s => s.id === id ? { ...s, valor: val } : s));
  };

  // Executar Pipeline Completo
  const handleRunPipeline = () => {
    if (!customSamples || customSamples.length < 3) {
      alert('São necessárias pelo menos 3 amostras georreferenciadas para interpolação espacial.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      try {
        // Encontrar Bounding Box do Talhão ou das Amostras
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        if (boundaryCoordinates && boundaryCoordinates.length >= 3) {
          boundaryCoordinates.forEach(([lat, lng]) => {
            if (lng < minX) minX = lng;
            if (lng > maxX) maxX = lng;
            if (lat < minY) minY = lat;
            if (lat > maxY) maxY = lat;
          });
        } else {
          customSamples.forEach(s => {
            if (s.x < minX) minX = s.x;
            if (s.x > maxX) maxX = s.x;
            if (s.y < minY) minY = s.y;
            if (s.y > maxY) maxY = s.y;
          });
          // Margem de 10% em volta
          const dx = (maxX - minX) * 0.1 || 0.001;
          const dy = (maxY - minY) * 0.1 || 0.001;
          minX -= dx; maxX += dx;
          minY -= dy; maxY += dy;
        }

        const gridBounding: GridBounding = {
          minX,
          maxX,
          minY,
          maxY,
          resolutionMeters: gridResolution,
          boundaryCoordinates,
        };

        // 1. Interpolação Espacial
        let interpolatedGrid = [];
        if (method === 'IDW') {
          interpolatedGrid = interpolateIDW(customSamples, gridBounding, idwPower, maxNeighbors);
        } else {
          const params: KrigingParameters = {
            modelo: krigingModel,
            nugget,
            sill,
            range,
          };
          interpolatedGrid = interpolateKriging(customSamples, gridBounding, params);
        }

        // 2. Processador de Taxa Variável (Prescrição)
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
        alert('Erro no processamento da interpolação espacial.');
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  // Downloads de Exportação
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
    <div className={`fixed inset-0 z-[2000] flex flex-col bg-slate-950/90 backdrop-blur-md animate-fade-in ${
      isFullScreen ? 'p-0' : 'p-2 sm:p-5 items-center justify-center overflow-y-auto'
    }`}>
      <div className={`bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl w-full overflow-hidden flex flex-col ${
        isFullScreen ? 'h-full rounded-none' : 'max-w-6xl rounded-3xl my-auto max-h-[95vh]'
      }`}>
        {/* Header Superior */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-4 border-b border-emerald-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-black text-emerald-300 uppercase tracking-wide">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Geoprocessamento de Precisão VRA</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                Interpolação Espacial &amp; Mapa de Prescrição (VRA)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title={isFullScreen ? 'Restaurar Janela' : 'Abrir em Tela Cheia'}
            >
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              <span className="hidden sm:inline">{isFullScreen ? 'Janela' : 'Tela Cheia'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Abas Superiores */}
        <div className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto shrink-0 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('config')}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'config'
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>1. Semivariograma &amp; Parâmetros (IDW / Krigagem)</span>
            </button>

            <button
              onClick={() => setActiveTab('result')}
              disabled={!result}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40 ${
                activeTab === 'result'
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>2. Mapa Visual &amp; Zonas VRA</span>
            </button>

            <button
              onClick={() => setActiveTab('xml')}
              disabled={!result}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40 ${
                activeTab === 'xml'
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>3. Código ISOXML (ISO 11783-10)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleLoadSyntheticExample}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 border border-amber-400/40 rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0"
            title="Carrega 10 pontos sintéticos georreferenciados de Fósforo (P) para demonstração"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exemplo Sintético (10 Pontos P)</span>
          </button>
        </div>

        {/* Corpo Modal */}
        <div className="p-5 overflow-y-auto space-y-6 grow text-xs text-slate-700 dark:text-zinc-300">
          {/* TAB 1: CONFIGURAÇÃO DO MOTOR & SEMIVARIOGRAMA */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              {/* Card de Escolha do Método */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setMethod('IDW')}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 ${
                    method === 'IDW'
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-md'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <Grid className="w-4 h-4 text-emerald-600" />
                      <span>Inverso do Peso da Distância (IDW)</span>
                    </span>
                    {method === 'IDW' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    Método determinístico rápido e robusto. Atribui maior peso aos pontos mais próximos do centro de cada célula da grade.
                  </p>
                </div>

                <div
                  onClick={() => setMethod('Kriging')}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer space-y-2 ${
                    method === 'Kriging'
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-md'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>Krigagem Ordinária (Ordinary Kriging)</span>
                    </span>
                    {method === 'Kriging' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </div>
                  <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                    Método geoestatístico estocástico avançado. Modela a estrutura de autocorrelação espacial via semivariograma teórico.
                  </p>
                </div>
              </div>

              {/* Seção Principal de Nutriente & Resolução do Grid */}
              <div className="p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-600" />
                  <span>Configuração de Nutriente &amp; Resolução do Grid</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-zinc-400 block mb-1">Nutriente / Parâmetro do Solo:</label>
                    <select
                      value={nutrientName}
                      onChange={(e) => handleNutrientSelectChange(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 font-bold cursor-pointer text-xs"
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
                        <option value="Alumínio Tópico (Al³⁺)">Alumínio Tópico (Al³⁺)</option>
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
                    <label className="font-bold text-slate-600 dark:text-zinc-400 block mb-1">Resolução do Grid (m):</label>
                    <select
                      value={gridResolution}
                      onChange={(e) => setGridResolution(Number(e.target.value))}
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 font-bold cursor-pointer text-xs"
                    >
                      <option value={10}>10 metros (Grade Alta / Detalhada)</option>
                      <option value={15}>15 metros (Recomendado Padrão)</option>
                      <option value={20}>20 metros (Grade Média)</option>
                      <option value={30}>30 metros (Grade Larga)</option>
                    </select>
                  </div>
                </div>

                {method === 'IDW' && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <div>
                      <label className="font-bold text-slate-600 dark:text-zinc-400 block mb-1">Expoente de Distância (Power):</label>
                      <input
                        type="number"
                        min="1"
                        max="4"
                        step="0.5"
                        value={idwPower}
                        onChange={(e) => setIdwPower(Number(e.target.value))}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 dark:text-zinc-400 block mb-1">Máximo de Vizinhos Próximos:</label>
                      <input
                        type="number"
                        min="3"
                        max="24"
                        value={maxNeighbors}
                        onChange={(e) => setMaxNeighbors(Number(e.target.value))}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Painel Interativo do Semivariograma quando Método = Krigagem */}
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

              {/* Tabela de Amostras de Entrada */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Amostras Georreferenciadas de Entrada ({customSamples.length} Pontos)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Ajuste os teores medidos em campo:</span>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-900 border-b font-bold text-slate-500">
                      <tr>
                        <th className="p-2.5">Código</th>
                        <th className="p-2.5">Latitude (Y)</th>
                        <th className="p-2.5">Longitude (X)</th>
                        <th className="p-2.5">Teor ({nutrientName})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono text-[11px]">
                      {customSamples.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                          <td className="p-2.5 font-bold font-sans text-slate-800 dark:text-zinc-200">{s.code}</td>
                          <td className="p-2.5 text-slate-500">{s.y.toFixed(5)}</td>
                          <td className="p-2.5 text-slate-500">{s.x.toFixed(5)}</td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              step="0.1"
                              value={s.valor}
                              onChange={(e) => handleSampleValueChange(s.id, Number(e.target.value))}
                              className="w-24 bg-slate-100 dark:bg-zinc-800 border rounded px-2 py-1 font-bold text-emerald-600 dark:text-emerald-400 font-sans"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Botão de Ação Executar */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleRunPipeline}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processando Matriz Espacial...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Executar Interpolação &amp; Gerar Mapa VRA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: RESULTADO DO MAPA DE PRESCRIÇÃO E VISUALIZAÇÃO LEAFLET */}
          {activeTab === 'result' && result && (
            <div className="space-y-6 animate-fade-in">
              {/* Banner Resumo de Resultados */}
              <div className="p-4 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl shadow-md border border-emerald-800/40">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-300 block font-bold uppercase">Área Total Mapeada</span>
                    <strong className="text-base font-black text-white">{result.metadata.totalAreaHa} ha</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-300 block font-bold uppercase">Insumo Total Requerido</span>
                    <strong className="text-base font-black text-amber-300">{result.metadata.totalInputRequired} {result.metadata.inputUnit}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-300 block font-bold uppercase">Teor Médio Interpolado</span>
                    <strong className="text-base font-black text-white">{result.metadata.meanValue}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-300 block font-bold uppercase">Células da Grade</span>
                    <strong className="text-base font-black text-white">{result.features.length} ({result.metadata.gridResolutionMeters}m)</strong>
                  </div>
                </div>
              </div>

              {/* Visualização Interativa do Mapa do Grid Leaflet */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-600" />
                    <span>Visualização Interativa do Grid Interpolado sobre Imagem Satélite</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Passe o mouse ou clique sobre as células da grade para ver detalhes.</span>
                </div>

                <VraGridCanvasMap
                  prescriptionResult={result}
                  height={isFullScreen ? '580px' : '420px'}
                  nutrientName={nutrientName}
                  plotName={plotName}
                  farmName={farmName}
                  boundaryCoordinates={boundaryCoordinates}
                  onDownloadGeoJSON={handleDownloadGeoJSON}
                  onDownloadISOXML={handleDownloadISOXML}
                />
              </div>

              {/* Tabela das Células/Zonas do Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <Grid className="w-4 h-4 text-emerald-600" />
                    <span>Zonas de Aplicação / Grade de Células Prescritas</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadGeoJSON}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar GeoJSON VRA</span>
                    </button>
                    <button
                      onClick={handleDownloadISOXML}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Baixar ISOXML (TASKDATA.XML)</span>
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden max-h-52 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-900 border-b font-bold text-slate-500">
                      <tr>
                        <th className="p-2.5">Zona / ID</th>
                        <th className="p-2.5">Teor Estimado</th>
                        <th className="p-2.5">Classe Agronômica</th>
                        <th className="p-2.5">Dose Prescrita (Target)</th>
                        <th className="p-2.5">Insumo na Célula</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {result.features.slice(0, 30).map((f) => {
                        const p = f.properties;
                        return (
                          <tr key={p.ID} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50">
                            <td className="p-2.5 font-bold text-slate-800 dark:text-zinc-200">{p.ID}</td>
                            <td className="p-2.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              {p.VALOR_INTERPOLADO}
                            </td>
                            <td className="p-2.5">
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                                style={{ backgroundColor: p.COLOR }}
                              >
                                {p.CLASS_LABEL}
                              </span>
                            </td>
                            <td className="p-2.5 font-bold">{p.DOSE_TARGET} {p.UNIT}</td>
                            <td className="p-2.5 text-slate-500 font-mono">{p.TOTAL_INPUT_KG_TON} kg/ton</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ISOXML CODE VIEW */}
          {activeTab === 'xml' && result && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-600" />
                    <span>Arquivo ISO 11783-10 (TASKDATA.XML) para Tratores &amp; Pilotos</span>
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Formato internacional aceito por computadores de bordo John Deere, Case IH, New Holland, Stara, Jacto, Trimble e AGCO.
                  </p>
                </div>
                <button
                  onClick={handleDownloadISOXML}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download TASKDATA.XML</span>
                </button>
              </div>

              <div className="bg-slate-900 text-emerald-300 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-[500px] border border-slate-800 shadow-inner">
                <pre>{exportToISOXMLStructure(result, `TASK_${plotName}`)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
