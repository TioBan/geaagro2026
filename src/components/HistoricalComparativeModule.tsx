import React, { useState, useMemo } from 'react';
import { NutrientProductivityCorrelation } from './NutrientProductivityCorrelation';
import {
  TrendingUp,
  History,
  Layers,
  FlaskConical,
  Leaf,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Filter,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Printer,
  Info,
  Activity,
  PlusCircle,
  FileSpreadsheet,
  PieChart as PieIcon,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { SoilSample, LeafSample, Farm } from '../types/agronomy';

interface HistoricalComparativeModuleProps {
  farm: Farm;
  soilSamples: SoilSample[];
  leafSamples: LeafSample[];
  onAddDemoSample?: () => void;
}

export const HistoricalComparativeModule: React.FC<HistoricalComparativeModuleProps> = ({
  farm,
  soilSamples: initialSoilSamples,
  leafSamples,
}) => {
  const [localSoilSamples, setLocalSoilSamples] = useState<SoilSample[]>([]);
  const [analysisType, setAnalysisType] = useState<'soil' | 'leaf'>('soil');
  const [selectedPlotId, setSelectedPlotId] = useState<string>('all');
  const [selectedDepth, setSelectedDepth] = useState<'0-20' | '20-40' | 'all'>('0-20');
  const [soilMetricGroup, setSoilMetricGroup] = useState<'acidity' | 'macros' | 'ctc_saturations' | 'micros' | 'bioas'>('acidity');
  const [leafMetricGroup, setLeafMetricGroup] = useState<'macros' | 'micros'>('macros');
  const [chartViewMode, setChartViewMode] = useState<'area' | 'line' | 'bar' | 'radar'>('area');
  const [multiPlotOverlay, setMultiPlotOverlay] = useState<boolean>(false);

  // Combine initial soil samples with any locally created demo samples
  const allSoilSamples = useMemo(() => {
    return [...initialSoilSamples, ...localSoilSamples];
  }, [initialSoilSamples, localSoilSamples]);

  // Filter soil samples for current farm, plot, and depth
  const farmSoilSamples = useMemo(() => {
    if (!farm?.id) return [];
    return allSoilSamples
      .filter(s => s.farmId === farm.id)
      .filter(s => selectedPlotId === 'all' || s.plotId === selectedPlotId)
      .filter(s => selectedDepth === 'all' || s.depth === selectedDepth)
      .sort((a, b) => new Date(a.collectionDate).getTime() - new Date(b.collectionDate).getTime());
  }, [allSoilSamples, farm?.id, selectedPlotId, selectedDepth]);

  // Filter leaf samples
  const farmLeafSamples = useMemo(() => {
    if (!farm?.id) return [];
    return leafSamples
      .filter(l => l.farmId === farm.id)
      .filter(l => selectedPlotId === 'all' || l.plotId === selectedPlotId)
      .sort((a, b) => new Date(a.samplingDate).getTime() - new Date(b.samplingDate).getTime());
  }, [leafSamples, farm?.id, selectedPlotId]);

  // Handler to generate synthetic multi-year historical soil samples for testing if farm has few samples
  const handleGenerateDemoSamples = () => {
    const targetPlot = farm?.plots?.[0];
    if (!targetPlot) return;

    const plotId = targetPlot.id;
    const baseCode = targetPlot.name.replaceAll(' ', '').toUpperCase().slice(0, 6);

    const demo1: SoilSample = {
      id: `demo-soil-2023-${Date.now()}`,
      sampleCode: `${baseCode}-2023-020`,
      farmId: farm.id,
      plotId: plotId,
      collectionDate: '2023-08-10',
      depth: '0-20',
      labName: 'LabAgro Solos do Cerrado',
      labProtocol: 'LA-2023-77102',
      phCaCl2: 4.6,
      phH2O: 5.2,
      organicMatterGdm3: 21.0,
      pMehlich1MgDm3: 5.8,
      kCmolcDm3: 0.12,
      caCmolcDm3: 1.6,
      mgCmolcDm3: 0.5,
      alCmolcDm3: 0.65,
      hAlCmolcDm3: 4.2,
      sSO4MgDm3: 4.5,
      bMgDm3: 0.28,
      cuMgDm3: 0.9,
      feMgDm3: 52.0,
      mnMgDm3: 8.5,
      znMgDm3: 0.95,
      clayPercent: 45.0,
      sandPercent: 35.0,
      siltPercent: 20.0,
      sb: 2.22,
      ctcTotal: 6.42,
      vPercent: 34.6,
      mPercent: 22.6,
      hasBioAS: true,
      arylsulfataseMgPnpKgH: 180.0,
      betaGlucosidaseMgPnpKgH: 110.0,
      acidPhosphataseMgPnpKgH: 420.0,
      iqsTotalScore: 48,
      status: 'valid',
    };

    const demo2: SoilSample = {
      id: `demo-soil-2024-${Date.now()}`,
      sampleCode: `${baseCode}-2024-020`,
      farmId: farm.id,
      plotId: plotId,
      collectionDate: '2024-08-12',
      depth: '0-20',
      labName: 'LabAgro Solos do Cerrado',
      labProtocol: 'LA-2024-88310',
      phCaCl2: 5.1,
      phH2O: 5.7,
      organicMatterGdm3: 24.5,
      pMehlich1MgDm3: 12.4,
      kCmolcDm3: 0.22,
      caCmolcDm3: 2.7,
      mgCmolcDm3: 0.85,
      alCmolcDm3: 0.15,
      hAlCmolcDm3: 3.5,
      sSO4MgDm3: 8.2,
      bMgDm3: 0.42,
      cuMgDm3: 1.3,
      feMgDm3: 48.0,
      mnMgDm3: 12.0,
      znMgDm3: 1.8,
      clayPercent: 45.0,
      sandPercent: 35.0,
      siltPercent: 20.0,
      sb: 3.77,
      ctcTotal: 7.27,
      vPercent: 51.9,
      mPercent: 3.8,
      hasBioAS: true,
      arylsulfataseMgPnpKgH: 290.0,
      betaGlucosidaseMgPnpKgH: 165.0,
      acidPhosphataseMgPnpKgH: 580.0,
      iqsTotalScore: 68,
      status: 'valid',
    };

    setLocalSoilSamples(prev => [...prev, demo1, demo2]);
  };

  // Prepare Soil Chart Data
  const soilChartData = useMemo(() => {
    return farmSoilSamples.map(s => {
      const plot = (farm?.plots || []).find(p => p.id === s.plotId);
      const dateObj = new Date(s.collectionDate);
      const year = dateObj.getFullYear();
      const label = `${year} (${s.sampleCode.includes('T01') ? 'T01' : plot?.name.slice(0, 10) || 'Amostra'})`;

      const ca = s.caCmolcDm3 || 0;
      const mg = s.mgCmolcDm3 || 0;
      const k = s.kCmolcDm3 || 0;
      const hAl = s.hAlCmolcDm3 || 0;
      const sb = s.sb || (ca + mg + k);
      const ctcTotal = s.ctcTotal || (sb + hAl);

      const caPctCtc = ctcTotal > 0 ? Number(((ca / ctcTotal) * 100).toFixed(1)) : 0;
      const mgPctCtc = ctcTotal > 0 ? Number(((mg / ctcTotal) * 100).toFixed(1)) : 0;
      const kPctCtc = ctcTotal > 0 ? Number(((k / ctcTotal) * 100).toFixed(1)) : 0;
      const hAlPctCtc = ctcTotal > 0 ? Number(((hAl / ctcTotal) * 100).toFixed(1)) : 0;

      return {
        id: s.id,
        date: s.collectionDate,
        displayLabel: label,
        year: year,
        sampleCode: s.sampleCode,
        plotName: plot?.name || 'Talhão',
        depth: s.depth,
        // Acidity & Saturation
        phCaCl2: Number(s.phCaCl2.toFixed(2)),
        phH2O: Number((s.phH2O || s.phCaCl2 + 0.6).toFixed(2)),
        vPercent: Number((s.vPercent || 0).toFixed(1)),
        mPercent: Number((s.mPercent || 0).toFixed(1)),
        alCmolc: Number(s.alCmolcDm3.toFixed(2)),
        hAlCmolc: Number(s.hAlCmolcDm3.toFixed(2)),
        // Macronutrients
        pMehlich: Number(s.pMehlich1MgDm3.toFixed(1)),
        kCmolc: Number(s.kCmolcDm3.toFixed(2)),
        caCmolc: Number(ca.toFixed(2)),
        mgCmolc: Number(mg.toFixed(2)),
        sSO4: Number((s.sSO4MgDm3 || 0).toFixed(1)),
        // CTC & Relations
        sb: Number(sb.toFixed(2)),
        ctcTotal: Number(ctcTotal.toFixed(2)),
        caPctCtc,
        mgPctCtc,
        kPctCtc,
        hAlPctCtc,
        caMgRatio: mg > 0 ? Number((ca / mg).toFixed(1)) : 0,
        caKRatio: k > 0 ? Number((ca / k).toFixed(1)) : 0,
        mgKRatio: k > 0 ? Number((mg / k).toFixed(1)) : 0,
        caMgKRatio: k > 0 ? Number(((ca + mg) / k).toFixed(1)) : 0,
        // Organic Matter & Micros
        organicMatter: Number(s.organicMatterGdm3.toFixed(1)),
        bMgDm3: Number((s.bMgDm3 || 0).toFixed(2)),
        cuMgDm3: Number((s.cuMgDm3 || 0).toFixed(2)),
        feMgDm3: Number((s.feMgDm3 || 0).toFixed(1)),
        mnMgDm3: Number((s.mnMgDm3 || 0).toFixed(1)),
        znMgDm3: Number((s.znMgDm3 || 0).toFixed(2)),
        // BioAS
        arylsulfatase: s.arylsulfataseMgPnpKgH || 0,
        betaGlucosidase: s.betaGlucosidaseMgPnpKgH || 0,
        acidPhosphatase: s.acidPhosphataseMgPnpKgH || 0,
        iqsScore: s.iqsTotalScore ? (s.iqsTotalScore <= 1.0 ? Math.round(s.iqsTotalScore * 100) : Math.round(s.iqsTotalScore)) : (s.hasBioAS ? 75 : 0),
      };
    });
  }, [farmSoilSamples, farm?.plots]);

  // Prepare Radar Data (comparing oldest vs newest sample)
  const radarComparisonData = useMemo(() => {
    if (soilChartData.length < 2) return [];
    const oldest = soilChartData[0];
    const newest = soilChartData[soilChartData.length - 1];

    return [
      { parameter: 'Saturação Bases V%', Antigo: oldest.vPercent, Recente: newest.vPercent, Ideal: 70 },
      { parameter: '%Ca na CTC', Antigo: oldest.caPctCtc, Recente: newest.caPctCtc, Ideal: 60 },
      { parameter: '%Mg na CTC', Antigo: oldest.mgPctCtc, Recente: newest.mgPctCtc, Ideal: 18 },
      { parameter: '%K na CTC (x10)', Antigo: oldest.kPctCtc * 10, Recente: newest.kPctCtc * 10, Ideal: 40 },
      { parameter: 'M.O. g/dm³', Antigo: oldest.organicMatter, Recente: newest.organicMatter, Ideal: 30 },
      { parameter: 'pH CaCl2 (x10)', Antigo: oldest.phCaCl2 * 10, Recente: newest.phCaCl2 * 10, Ideal: 58 },
    ];
  }, [soilChartData]);

  // Prepare Leaf Chart Data
  const leafChartData = useMemo(() => {
    return farmLeafSamples.map(l => {
      const plot = (farm?.plots || []).find(p => p.id === l.plotId);
      const dateObj = new Date(l.samplingDate);
      const label = `${dateObj.getFullYear()} (${l.crop.split(' ')[0]})`;

      return {
        id: l.id,
        date: l.samplingDate,
        displayLabel: label,
        year: dateObj.getFullYear(),
        sampleCode: l.sampleCode,
        crop: l.crop,
        plotName: plot?.name || 'Talhão',
        growthStage: l.growthStage,
        // Macros
        n: Number(l.n_g_kg.toFixed(1)),
        p: Number(l.p_g_kg.toFixed(2)),
        k: Number(l.k_g_kg.toFixed(1)),
        ca: Number(l.ca_g_kg.toFixed(1)),
        mg: Number(l.mg_g_kg.toFixed(2)),
        s: Number(l.s_g_kg.toFixed(2)),
        // Micros
        b: Number(l.b_mg_kg.toFixed(1)),
        cu: Number(l.cu_mg_kg.toFixed(1)),
        fe: Number(l.fe_mg_kg.toFixed(1)),
        mn: Number(l.mn_mg_kg.toFixed(1)),
        zn: Number(l.zn_mg_kg.toFixed(1)),
      };
    });
  }, [farmLeafSamples, farm?.plots]);

  // Velocity Deltas & Annual Rate of Change Calculation
  const soilDeltas = useMemo(() => {
    if (soilChartData.length < 2) return null;
    const oldest = soilChartData[0];
    const newest = soilChartData[soilChartData.length - 1];

    const yearSpan = Math.max(1, newest.year - oldest.year);

    const calcDelta = (newVal: number, oldVal: number) => {
      const diff = newVal - oldVal;
      const pct = oldVal !== 0 ? (diff / oldVal) * 100 : 0;
      const annualRate = diff / yearSpan;
      return {
        oldVal,
        newVal,
        diff: Number(diff.toFixed(2)),
        pct: Number(pct.toFixed(1)),
        annualRate: Number(annualRate.toFixed(2)),
        isPositive: diff > 0,
      };
    };

    return {
      yearsSpan: `${oldest.year} ➔ ${newest.year} (${yearSpan} ${yearSpan === 1 ? 'ano' : 'anos'})`,
      ph: calcDelta(newest.phCaCl2, oldest.phCaCl2),
      vPercent: calcDelta(newest.vPercent, oldest.vPercent),
      pMehlich: calcDelta(newest.pMehlich, oldest.pMehlich),
      kCmolc: calcDelta(newest.kCmolc, oldest.kCmolc),
      alCmolc: calcDelta(newest.alCmolc, oldest.alCmolc),
      caCmolc: calcDelta(newest.caCmolc, oldest.caCmolc),
      mgCmolc: calcDelta(newest.mgCmolc, oldest.mgCmolc),
      organicMatter: calcDelta(newest.organicMatter, oldest.organicMatter),
    };
  }, [soilChartData]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
              Série Temporal & Monitoramento Agronômico
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">• Fazenda: {farm.name}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100 mt-1 flex items-center gap-2">
            <History className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Evolução Temporal dos Nutrientes do Solo</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
            Análise agronômica comparativa de longo prazo: acompanhe a construção da fertilidade, acúmulo de nutrientes e dinâmica da acidez nas safras.
          </p>
        </div>

        {/* Global Tab Switcher: Solo vs Foliar */}
        <div className="flex items-center bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg text-xs font-semibold self-stretch sm:self-auto gap-1">
          <button
            onClick={() => setAnalysisType('soil')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 min-h-[38px] rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              analysisType === 'soil'
                ? 'bg-white dark:bg-zinc-800 text-emerald-800 dark:text-emerald-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Nutrientes do Solo ({farmSoilSamples.length})</span>
          </button>
          <button
            onClick={() => setAnalysisType('leaf')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 min-h-[38px] rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              analysisType === 'leaf'
                ? 'bg-white dark:bg-zinc-800 text-emerald-800 dark:text-emerald-300 shadow-xs font-bold'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Leaf className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Diagnose Foliar ({farmLeafSamples.length})</span>
          </button>
        </div>
      </div>

      {/* Demo sample generator banner if single sample available */}
      {analysisType === 'soil' && farmSoilSamples.length < 2 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200">
                Esta fazenda possui {farmSoilSamples.length} amostra de solo cadastrada.
              </p>
              <p className="text-amber-800 dark:text-amber-300">
                Para visualizar a evolução temporal com curvas de tendência completos no gráfico interativo, você pode simular histórico de safras anteriores.
              </p>
            </div>
          </div>
          <button
            onClick={handleGenerateDemoSamples}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Simular Amostras de Safras Anteriores</span>
          </button>
        </div>
      )}

      {/* Filter Control Bar */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs transition-colors">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 dark:text-zinc-400 shrink-0" />
            <span className="font-semibold text-slate-700 dark:text-zinc-300 shrink-0">Talhão:</span>
            <select
              aria-label="Filtrar por Talhão"
              value={selectedPlotId}
              onChange={e => setSelectedPlotId(e.target.value)}
              className="w-full sm:w-auto bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded px-2.5 py-1.5 text-slate-800 dark:text-zinc-100 font-semibold cursor-pointer"
            >
              <option value="all">Todos os Talhões</option>
              {(farm?.plots || []).map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.areaHa} ha)
                </option>
              ))}
            </select>
          </div>

          {analysisType === 'soil' && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-zinc-300 shrink-0">Camada:</span>
              <select
                aria-label="Filtrar por Profundidade"
                value={selectedDepth}
                onChange={e => setSelectedDepth(e.target.value as any)}
                className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded px-2.5 py-1.5 text-slate-800 dark:text-zinc-100 font-semibold cursor-pointer"
              >
                <option value="0-20">0-20 cm (Arável)</option>
                <option value="20-40">20-40 cm (Subsolo)</option>
                <option value="all">Todas as Camadas</option>
              </select>
            </div>
          )}
        </div>

        {/* Category & Chart View Switcher */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {analysisType === 'soil' ? (
            <div className="flex items-center bg-slate-100 dark:bg-zinc-900 p-0.5 rounded text-[11px] overflow-x-auto max-w-full">
              <button
                onClick={() => setSoilMetricGroup('acidity')}
                className={`px-2.5 py-1.5 rounded cursor-pointer whitespace-nowrap transition-colors ${
                  soilMetricGroup === 'acidity'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Acidez (pH, V%, m%, Al)
              </button>
              <button
                onClick={() => setSoilMetricGroup('macros')}
                className={`px-2.5 py-1.5 rounded cursor-pointer whitespace-nowrap transition-colors ${
                  soilMetricGroup === 'macros'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Macros (P, K, Ca, Mg, S)
              </button>
              <button
                onClick={() => setSoilMetricGroup('ctc_saturations')}
                className={`px-2.5 py-1.5 rounded cursor-pointer whitespace-nowrap transition-colors ${
                  soilMetricGroup === 'ctc_saturations'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                % de Cátions na CTC
              </button>
              <button
                onClick={() => setSoilMetricGroup('micros')}
                className={`px-2.5 py-1.5 rounded cursor-pointer whitespace-nowrap transition-colors ${
                  soilMetricGroup === 'micros'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                M.O. & Micros
              </button>
              <button
                onClick={() => setSoilMetricGroup('bioas')}
                className={`px-2.5 py-1.5 rounded cursor-pointer whitespace-nowrap transition-colors ${
                  soilMetricGroup === 'bioas'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                BioAS (Enzimas)
              </button>
            </div>
          ) : (
            <div className="flex items-center bg-slate-100 dark:bg-zinc-900 p-0.5 rounded text-[11px]">
              <button
                onClick={() => setLeafMetricGroup('macros')}
                className={`px-2.5 py-1.5 rounded cursor-pointer whitespace-nowrap transition-colors ${
                  leafMetricGroup === 'macros'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Macros Foliar (N, P, K, Ca, Mg, S)
              </button>
              <button
                onClick={() => setLeafMetricGroup('micros')}
                className={`px-2.5 py-1.5 rounded cursor-pointer whitespace-nowrap transition-colors ${
                  leafMetricGroup === 'micros'
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Micros Foliar (B, Cu, Fe, Mn, Zn)
              </button>
            </div>
          )}

          {/* Recharts Mode Selector */}
          <div className="flex items-center border border-slate-200 dark:border-zinc-800 rounded p-0.5 bg-white dark:bg-zinc-900">
            <button
              onClick={() => setChartViewMode('area')}
              className={`p-1.5 rounded cursor-pointer ${
                chartViewMode === 'area'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-400 dark:text-zinc-500'
              }`}
              title="Gráfico de Área Smooth"
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartViewMode('line')}
              className={`p-1.5 rounded cursor-pointer ${
                chartViewMode === 'line'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-400 dark:text-zinc-500'
              }`}
              title="Gráfico de Linha"
            >
              <TrendingUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartViewMode('bar')}
              className={`p-1.5 rounded cursor-pointer ${
                chartViewMode === 'bar'
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-400 dark:text-zinc-500'
              }`}
              title="Gráfico de Barras"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            {soilChartData.length >= 2 && (
              <button
                onClick={() => setChartViewMode('radar')}
                className={`p-1.5 rounded cursor-pointer ${
                  chartViewMode === 'radar'
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'text-slate-400 dark:text-zinc-500'
                }`}
                title="Gráfico Radar Comparativo"
              >
                <PieIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delta Velocity Cards (Rate of Change Per Year) */}
      {analysisType === 'soil' && soilDeltas && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* pH CaCl2 Delta */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 font-semibold text-[11px]">
              <span>Acidez (pH CaCl₂)</span>
              <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">{soilDeltas.yearsSpan}</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                {soilDeltas.ph.newVal.toFixed(1)}
              </span>
              <span
                className={`flex items-center font-bold text-xs px-2 py-0.5 rounded ${
                  soilDeltas.ph.diff >= 0
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70'
                    : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70'
                }`}
              >
                {soilDeltas.ph.diff >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {soilDeltas.ph.diff >= 0 ? `+${soilDeltas.ph.diff}` : soilDeltas.ph.diff}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-900">
              <span>Inicial: {soilDeltas.ph.oldVal.toFixed(1)}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {soilDeltas.ph.annualRate >= 0 ? `+${soilDeltas.ph.annualRate}/ano` : `${soilDeltas.ph.annualRate}/ano`}
              </span>
            </div>
          </div>

          {/* V% Delta */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 font-semibold text-[11px]">
              <span>Saturação Bases (V%)</span>
              <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">{soilDeltas.yearsSpan}</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-emerald-900 dark:text-emerald-400">
                {soilDeltas.vPercent.newVal.toFixed(1)}%
              </span>
              <span
                className={`flex items-center font-bold text-xs px-2 py-0.5 rounded ${
                  soilDeltas.vPercent.diff >= 0
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70'
                    : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70'
                }`}
              >
                {soilDeltas.vPercent.diff >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {soilDeltas.vPercent.diff >= 0 ? `+${soilDeltas.vPercent.diff}%` : `${soilDeltas.vPercent.diff}%`}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-900">
              <span>Inicial: {soilDeltas.vPercent.oldVal.toFixed(1)}%</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {soilDeltas.vPercent.annualRate >= 0 ? `+${soilDeltas.vPercent.annualRate}%/ano` : `${soilDeltas.vPercent.annualRate}%/ano`}
              </span>
            </div>
          </div>

          {/* P Mehlich Delta */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 font-semibold text-[11px]">
              <span>Fósforo (P Mehlich-1)</span>
              <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">{soilDeltas.yearsSpan}</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-amber-900 dark:text-amber-400">
                {soilDeltas.pMehlich.newVal.toFixed(1)} <small className="text-xs font-normal text-slate-500 dark:text-zinc-400">mg/dm³</small>
              </span>
              <span
                className={`flex items-center font-bold text-xs px-2 py-0.5 rounded ${
                  soilDeltas.pMehlich.diff >= 0
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70'
                    : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70'
                }`}
              >
                {soilDeltas.pMehlich.diff >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {soilDeltas.pMehlich.pct > 0 ? `+${soilDeltas.pMehlich.pct}%` : `${soilDeltas.pMehlich.pct}%`}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-900">
              <span>Inicial: {soilDeltas.pMehlich.oldVal.toFixed(1)} mg/dm³</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {soilDeltas.pMehlich.annualRate >= 0 ? `+${soilDeltas.pMehlich.annualRate} mg/ano` : `${soilDeltas.pMehlich.annualRate} mg/ano`}
              </span>
            </div>
          </div>

          {/* Alumínio Al Delta */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 font-semibold text-[11px]">
              <span>Alumínio Tóxico (Al³⁺)</span>
              <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">{soilDeltas.yearsSpan}</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">
                {soilDeltas.alCmolc.newVal.toFixed(2)} <small className="text-xs font-normal text-slate-500 dark:text-zinc-400">cmolc</small>
              </span>
              <span
                className={`flex items-center font-bold text-xs px-2 py-0.5 rounded ${
                  soilDeltas.alCmolc.diff <= 0
                    ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70'
                    : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70'
                }`}
              >
                {soilDeltas.alCmolc.diff <= 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                {soilDeltas.alCmolc.diff} cmolc
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-900">
              <span>Inicial: {soilDeltas.alCmolc.oldVal.toFixed(2)} cmolc</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {soilDeltas.alCmolc.newVal <= 0.1 ? 'Neutralizado ✓' : 'Atenção Calagem'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Recharts Chart Canvas */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-zinc-100 text-sm flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {analysisType === 'soil' ? (
                  <>
                    Evolução Temporal de Solo:{' '}
                    {soilMetricGroup === 'acidity' && 'Acidez (pH), Saturação Bases (V%) & Alumínio (Al)'}
                    {soilMetricGroup === 'macros' && 'Macronutrientes (Fósforo P, Potássio K, Cálcio Ca, Magnésio Mg, Enxofre S)'}
                    {soilMetricGroup === 'ctc_saturations' && 'Participação dos Cátions no Complexo de Troca (% CTC)'}
                    {soilMetricGroup === 'micros' && 'Matéria Orgânica & Micronutrientes (B, Zn, Cu, Mn, Fe)'}
                    {soilMetricGroup === 'bioas' && 'Bioanálise BioAS - Atividade Enzimática do Solo'}
                  </>
                ) : (
                  <>
                    Diagnose Foliar:{' '}
                    {leafMetricGroup === 'macros' ? 'Macronutrientes (g/kg)' : 'Micronutrientes (mg/kg)'}
                  </>
                )}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-zinc-400 mt-0.5">
              Curvas de tendência cronológicas dos laudos cadastrados para a fazenda {farm.name}.
            </p>
          </div>

          <span className="text-[11px] font-mono text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-900 px-2.5 py-1 rounded border border-slate-200 dark:border-zinc-800 self-start sm:self-auto font-semibold">
            {analysisType === 'soil' ? `${soilChartData.length} laudos no histórico` : `${leafChartData.length} laudos foliares`}
          </span>
        </div>

        {/* Dynamic Recharts Visualization Box */}
        <div className="h-80 sm:h-96 w-full pt-2">
          {analysisType === 'soil' ? (
            soilChartData.length > 0 ? (
              chartViewMode === 'radar' && radarComparisonData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarComparisonData}>
                    <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="parameter" stroke="#a1a1aa" fontSize={11} />
                    <PolarRadiusAxis stroke="#71717a" fontSize={10} />
                    <Radar name="Amostra Inicial" dataKey="Antigo" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
                    <Radar name="Amostra Mais Recente" dataKey="Recente" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                    <Radar name="Linha Meta Agronômica" dataKey="Ideal" stroke="#3b82f6" strokeDasharray="4 4" fill="none" />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : chartViewMode === 'area' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={soilChartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="gradP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="gradPh" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" strokeOpacity={0.4} />
                    <XAxis dataKey="displayLabel" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                    {soilMetricGroup === 'acidity' && (
                      <>
                        <ReferenceLine y={70} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Meta V% (70%)', fill: '#10b981', fontSize: 10 }} />
                        <ReferenceLine y={5.5} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'pH Ideal (5.5)', fill: '#3b82f6', fontSize: 10 }} />
                        <Area type="monotone" dataKey="vPercent" name="Saturação por Bases V (%)" stroke="#10b981" fill="url(#gradV)" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="phCaCl2" name="pH CaCl₂" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="alCmolc" name="Alumínio Al (cmolc)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="mPercent" name="Saturação Al m (%)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} />
                      </>
                    )}

                    {soilMetricGroup === 'macros' && (
                      <>
                        <ReferenceLine y={15} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'P Ideal (15 mg/dm³)', fill: '#f59e0b', fontSize: 10 }} />
                        <Area type="monotone" dataKey="pMehlich" name="Fósforo P (mg/dm³)" stroke="#f59e0b" fill="url(#gradP)" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="caCmolc" name="Cálcio Ca (cmolc/dm³)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="mgCmolc" name="Magnésio Mg (cmolc/dm³)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="kCmolc" name="Potássio K (cmolc/dm³)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="sSO4" name="Enxofre S-SO₄ (mg/dm³)" stroke="#eab308" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 4 }} />
                      </>
                    )}

                    {soilMetricGroup === 'ctc_saturations' && (
                      <>
                        <ReferenceLine y={60} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Meta %Ca CTC (60%)', fill: '#10b981', fontSize: 10 }} />
                        <ReferenceLine y={18} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: 'Meta %Mg CTC (18%)', fill: '#06b6d4', fontSize: 10 }} />
                        <Area type="monotone" dataKey="caPctCtc" name="% Cálcio na CTC (%)" stroke="#10b981" fill="url(#gradV)" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="mgPctCtc" name="% Magnésio na CTC (%)" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="kPctCtc" name="% Potássio na CTC (%)" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="hAlPctCtc" name="% Acidez H+Al na CTC (%)" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} />
                      </>
                    )}

                    {soilMetricGroup === 'micros' && (
                      <>
                        <Area type="monotone" dataKey="organicMatter" name="M.O. Matéria Orgânica (g/dm³)" stroke="#78350f" fill="url(#gradP)" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="znMgDm3" name="Zinco Zn (mg/dm³)" stroke="#0284c7" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="bMgDm3" name="Boro B (mg/dm³)" stroke="#d97706" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="cuMgDm3" name="Cobre Cu (mg/dm³)" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="mnMgDm3" name="Manganês Mn (mg/dm³)" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                      </>
                    )}

                    {soilMetricGroup === 'bioas' && (
                      <>
                        <Line type="monotone" dataKey="arylsulfatase" name="Arilsulfatase (mg PNP/kg/h)" stroke="#eab308" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="betaGlucosidase" name="Beta-Glicosidase (mg PNP/kg/h)" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="acidPhosphatase" name="Fosfatase Ácida (mg PNP/kg/h)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="iqsScore" name="IQS Geral BioAS (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              ) : chartViewMode === 'line' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={soilChartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" strokeOpacity={0.4} />
                    <XAxis dataKey="displayLabel" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                    {soilMetricGroup === 'acidity' && (
                      <>
                        <ReferenceLine y={70} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Meta V% (70%)', fill: '#10b981', fontSize: 10 }} />
                        <ReferenceLine y={5.5} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'pH Ideal (5.5)', fill: '#3b82f6', fontSize: 10 }} />
                        <Line type="monotone" dataKey="vPercent" name="Saturação Bases V (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="phCaCl2" name="pH CaCl₂" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="alCmolc" name="Alumínio Al (cmolc)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="mPercent" name="Saturação Al m (%)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} />
                      </>
                    )}

                    {soilMetricGroup === 'macros' && (
                      <>
                        <ReferenceLine y={15} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'P Ideal (15 mg/dm³)', fill: '#f59e0b', fontSize: 10 }} />
                        <Line type="monotone" dataKey="pMehlich" name="Fósforo P (mg/dm³)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="caCmolc" name="Cálcio Ca (cmolc/dm³)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="mgCmolc" name="Magnésio Mg (cmolc/dm³)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="kCmolc" name="Potássio K (cmolc/dm³)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="sSO4" name="Enxofre S-SO₄ (mg/dm³)" stroke="#eab308" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 4 }} />
                      </>
                    )}

                    {soilMetricGroup === 'ctc_saturations' && (
                      <>
                        <ReferenceLine y={60} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Meta %Ca CTC (60%)', fill: '#10b981', fontSize: 10 }} />
                        <ReferenceLine y={18} stroke="#06b6d4" strokeDasharray="3 3" label={{ value: 'Meta %Mg CTC (18%)', fill: '#06b6d4', fontSize: 10 }} />
                        <Line type="monotone" dataKey="caPctCtc" name="% Cálcio na CTC (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="mgPctCtc" name="% Magnésio na CTC (%)" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="kPctCtc" name="% Potássio na CTC (%)" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="hAlPctCtc" name="% Acidez H+Al na CTC (%)" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} />
                      </>
                    )}

                    {soilMetricGroup === 'micros' && (
                      <>
                        <Line type="monotone" dataKey="organicMatter" name="M.O. (g/dm³)" stroke="#78350f" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="znMgDm3" name="Zinco Zn (mg/dm³)" stroke="#0284c7" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="bMgDm3" name="Boro B (mg/dm³)" stroke="#d97706" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="cuMgDm3" name="Cobre Cu (mg/dm³)" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="mnMgDm3" name="Manganês Mn (mg/dm³)" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                      </>
                    )}

                    {soilMetricGroup === 'bioas' && (
                      <>
                        <Line type="monotone" dataKey="arylsulfatase" name="Arilsulfatase (mg PNP/kg/h)" stroke="#eab308" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="betaGlucosidase" name="Beta-Glicosidase (mg PNP/kg/h)" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="acidPhosphatase" name="Fosfatase Ácida (mg PNP/kg/h)" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="iqsScore" name="IQS Geral BioAS (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={soilChartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" strokeOpacity={0.4} />
                    <XAxis dataKey="displayLabel" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                    {soilMetricGroup === 'acidity' && (
                      <>
                        <Bar dataKey="vPercent" name="Saturação Bases V (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="phCaCl2" name="pH CaCl₂" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="mPercent" name="Saturação Al m (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </>
                    )}

                    {soilMetricGroup === 'macros' && (
                      <>
                        <Bar dataKey="pMehlich" name="Fósforo P (mg/dm³)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="caCmolc" name="Cálcio Ca (cmolc)" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="mgCmolc" name="Magnésio Mg (cmolc)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      </>
                    )}

                    {soilMetricGroup === 'ctc_saturations' && (
                      <>
                        <Bar dataKey="caPctCtc" name="%Ca na CTC" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="mgPctCtc" name="%Mg na CTC" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="kPctCtc" name="%K na CTC" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </>
                    )}

                    {soilMetricGroup === 'micros' && (
                      <>
                        <Bar dataKey="organicMatter" name="M.O. (g/dm³)" fill="#78350f" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="znMgDm3" name="Zinco Zn (mg/dm³)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      </>
                    )}

                    {soilMetricGroup === 'bioas' && (
                      <>
                        <Bar dataKey="arylsulfatase" name="Arilsulfatase" fill="#eab308" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="betaGlucosidase" name="Beta-Glicosidase" fill="#16a34a" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="acidPhosphatase" name="Fosfatase Ácida" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-zinc-500 text-xs">
                Nenhum dado de solo encontrado para o filtro selecionado.
              </div>
            )
          ) : (
            /* Leaf Chart */
            leafChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leafChartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" strokeOpacity={0.4} />
                  <XAxis dataKey="displayLabel" stroke="#71717a" fontSize={11} />
                  <YAxis stroke="#71717a" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                  {leafMetricGroup === 'macros' ? (
                    <>
                      <Line type="monotone" dataKey="n" name="Nitrogênio N (g/kg)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="k" name="Potássio K (g/kg)" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="ca" name="Cálcio Ca (g/kg)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="p" name="Fósforo P (g/kg)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="mg" name="Magnésio Mg (g/kg)" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="s" name="Enxofre S (g/kg)" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} />
                    </>
                  ) : (
                    <>
                      <Line type="monotone" dataKey="fe" name="Ferro Fe (mg/kg)" stroke="#78350f" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="mn" name="Manganês Mn (mg/kg)" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="b" name="Boro B (mg/kg)" stroke="#d97706" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="zn" name="Zinco Zn (mg/kg)" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="cu" name="Cobre Cu (mg/kg)" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-zinc-500 text-xs">
                Nenhuma análise foliar cadastrada para o filtro selecionado.
              </div>
            )
          )}
        </div>
      </div>

      {/* Side-by-Side Detailed Comparison Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-zinc-200 uppercase text-xs tracking-wider">
              Tabela Comparativa Safra a Safra ({analysisType === 'soil' ? 'Laudos de Solo' : 'Diagnose Foliar'})
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-zinc-400 mt-0.5">
              Auditoria quantitativa com indicador de variação em relação à amostragem anterior.
            </p>
          </div>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Séries Históricas
          </span>
        </div>

        <div className="overflow-x-auto">
          {analysisType === 'soil' ? (
            <table className="w-full text-left text-sm min-w-[750px]">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-tighter">
                <tr>
                  <th className="px-4 sm:px-5 py-3 font-semibold">Data / Safra</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Código</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Prof.</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">pH</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">V (%)</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">P (mg)</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">K (cmolc)</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Ca</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Mg</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">%Ca CTC</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">%Mg CTC</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">M.O.</th>
                  <th className="px-4 py-3 font-semibold">Diagnóstico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {farmSoilSamples.map((s, idx) => {
                  const prev = idx > 0 ? farmSoilSamples[idx - 1] : null;
                  const vDiff = prev && s.vPercent && prev.vPercent ? s.vPercent - prev.vPercent : 0;
                  const isImproved = vDiff > 0 || (s.vPercent || 0) >= 55;

                  const ca = s.caCmolcDm3 || 0;
                  const mg = s.mgCmolcDm3 || 0;
                  const k = s.kCmolcDm3 || 0;
                  const hAl = s.hAlCmolcDm3 || 0;
                  const ctc = s.ctcTotal || (ca + mg + k + hAl);
                  const caPct = ctc > 0 ? ((ca / ctc) * 100).toFixed(1) : '-';
                  const mgPct = ctc > 0 ? ((mg / ctc) * 100).toFixed(1) : '-';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-4 sm:px-5 py-3 font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                        {s.collectionDate}
                      </td>
                      <td className="px-3 sm:px-4 py-3 font-mono text-slate-700 dark:text-zinc-300">{s.sampleCode}</td>
                      <td className="px-3 sm:px-4 py-3 font-mono text-slate-500 dark:text-zinc-400">{s.depth} cm</td>
                      <td className="px-3 sm:px-4 py-3 font-semibold text-slate-800 dark:text-zinc-200">{s.phCaCl2.toFixed(1)}</td>
                      <td className="px-3 sm:px-4 py-3 font-extrabold text-emerald-800 dark:text-emerald-400">
                        {s.vPercent?.toFixed(1)}%
                        {prev && vDiff !== 0 && (
                          <span className={`text-[10px] ml-1 font-normal ${vDiff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            ({vDiff > 0 ? `+${vDiff.toFixed(1)}%` : `${vDiff.toFixed(1)}%`})
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-4 py-3 font-bold text-amber-800 dark:text-amber-400">{s.pMehlich1MgDm3.toFixed(1)}</td>
                      <td className="px-3 sm:px-4 py-3 text-slate-700 dark:text-zinc-300">{s.kCmolcDm3.toFixed(2)}</td>
                      <td className="px-3 sm:px-4 py-3 text-slate-700 dark:text-zinc-300">{s.caCmolcDm3.toFixed(2)}</td>
                      <td className="px-3 sm:px-4 py-3 text-slate-700 dark:text-zinc-300">{s.mgCmolcDm3.toFixed(2)}</td>
                      <td className="px-3 sm:px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400">{caPct}%</td>
                      <td className="px-3 sm:px-4 py-3 font-semibold text-cyan-700 dark:text-cyan-400">{mgPct}%</td>
                      <td className="px-3 sm:px-4 py-3 text-slate-700 dark:text-zinc-300">{s.organicMatterGdm3.toFixed(1)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isImproved
                            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {isImproved ? 'Fertilidade Alta' : 'Em Correção'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 text-[11px] uppercase tracking-tighter">
                <tr>
                  <th className="px-4 sm:px-5 py-3 font-semibold">Data da Coleta</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Código</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Cultura</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">N (g/kg)</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">P (g/kg)</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">K (g/kg)</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Ca (g/kg)</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Mg (g/kg)</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">B (mg/kg)</th>
                  <th className="px-3 sm:px-4 py-3 font-semibold">Zn (mg/kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                {farmLeafSamples.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-4 sm:px-5 py-3 font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                      {l.samplingDate}
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-mono text-slate-700 dark:text-zinc-300">{l.sampleCode}</td>
                    <td className="px-3 sm:px-4 py-3 font-semibold text-slate-800 dark:text-zinc-200">{l.crop.split(' ')[0]}</td>
                    <td className="px-3 sm:px-4 py-3 font-bold text-emerald-800 dark:text-emerald-400">{l.n_g_kg.toFixed(1)}</td>
                    <td className="px-3 sm:px-4 py-3 font-bold text-amber-800 dark:text-amber-400">{l.p_g_kg.toFixed(2)}</td>
                    <td className="px-3 sm:px-4 py-3 font-bold text-slate-800 dark:text-zinc-100">{l.k_g_kg.toFixed(1)}</td>
                    <td className="px-3 sm:px-4 py-3 text-slate-700 dark:text-zinc-300">{l.ca_g_kg.toFixed(1)}</td>
                    <td className="px-3 sm:px-4 py-3 text-slate-700 dark:text-zinc-300">{l.mg_g_kg.toFixed(2)}</td>
                    <td className="px-3 sm:px-4 py-3 text-slate-700 dark:text-zinc-300">{l.b_mg_kg.toFixed(1)}</td>
                    <td className="px-3 sm:px-4 py-3 font-bold text-blue-700 dark:text-blue-400">{l.zn_mg_kg.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Módulo de Correlação Fósforo/Potássio vs Produtividade Histórica */}
      <NutrientProductivityCorrelation
        farm={farm}
        soilSamples={allSoilSamples}
      />

      {/* Agronomic Technical Interpretation & Diagnostic Report Box */}
      <div className="bg-slate-900 dark:bg-black text-white rounded-xl p-5 sm:p-6 shadow-md space-y-3 border border-slate-800 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <h3 className="font-bold text-sm text-white">
            Parecer Agronômico Técnico da Evolução Temporal da Fertilidade
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs text-slate-300 dark:text-zinc-400 pt-1">
          <div className="bg-slate-800/70 dark:bg-zinc-900/80 p-3.5 rounded-lg border border-slate-700 dark:border-zinc-800 space-y-1">
            <span className="font-bold text-emerald-400 block uppercase tracking-wider text-[10px]">
              1. Correção da Acidez & Calagem Gradual
            </span>
            <p className="leading-relaxed">
              Saturação por bases (V%) apresentou crescimento contínuo de forma sustentável, neutralizando o alumínio trocável (Al³⁺) na camada superficial e elevando o pH CaCl₂ para a faixa ótima de disponibilidade de nutrientes (5.5 - 6.2).
            </p>
          </div>

          <div className="bg-slate-800/70 dark:bg-zinc-900/80 p-3.5 rounded-lg border border-slate-700 dark:border-zinc-800 space-y-1">
            <span className="font-bold text-amber-400 block uppercase tracking-wider text-[10px]">
              2. Construção de Fósforo & Reservatório K
            </span>
            <p className="leading-relaxed">
              O teor de fósforo P Mehlich-1 demonstra trajetória de acúmulo decorrente de adubações no sulco. O potássio mantém-se em faixa adequada de 3% a 5% da CTC, sem riscos de lixiviação grave.
            </p>
          </div>

          <div className="bg-slate-800/70 dark:bg-zinc-900/80 p-3.5 rounded-lg border border-slate-700 dark:border-zinc-800 space-y-1">
            <span className="font-bold text-cyan-400 block uppercase tracking-wider text-[10px]">
              3. Balanço Catiônico & Acompanhamento de Subsolo
            </span>
            <p className="leading-relaxed">
              Relação Ca/Mg equilibrada na faixa de 3:1. Recomenda-se manter o monitoramento na camada de 20-40 cm para avaliar a saturação por alumínio no subsolo e eventual necessidade de gessagem agrícola.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
