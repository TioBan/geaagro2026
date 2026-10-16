import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Filter,
  Plus,
  Layers,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  LineChart as LineChartIcon,
  FlaskConical,
  Bug,
  Sprout,
  Info,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  SoilLabSamplingReport,
  PathogenQuantification,
  STANDARD_PATHOGEN_CATALOG,
} from './SoilDiseasesModule';
import { SoilField, SoilProperty } from '../types/soilDiseases';

interface SoilPathogenEvolutionChartProps {
  labReports: SoilLabSamplingReport[];
  fields: SoilField[];
  properties: SoilProperty[];
  onAddNewReportForField?: (fieldId: string, propertyId: string) => void;
  onSelectReport?: (report: SoilLabSamplingReport) => void;
}

const PATHOGEN_PALETTE = [
  { stroke: '#10B981', fill: '#10B981', bg: 'bg-emerald-500' }, // Emerald
  { stroke: '#F59E0B', fill: '#F59E0B', bg: 'bg-amber-500' },   // Amber
  { stroke: '#EF4444', fill: '#EF4444', bg: 'bg-rose-500' },    // Rose
  { stroke: '#8B5CF6', fill: '#8B5CF6', bg: 'bg-purple-500' },  // Purple
  { stroke: '#06B6D4', fill: '#06B6D4', bg: 'bg-cyan-500' },    // Cyan
  { stroke: '#3B82F6', fill: '#3B82F6', bg: 'bg-blue-500' },    // Blue
  { stroke: '#EC4899', fill: '#EC4899', bg: 'bg-pink-500' },    // Pink
  { stroke: '#84CC16', fill: '#84CC16', bg: 'bg-lime-500' },    // Lime
  { stroke: '#F97316', fill: '#F97316', bg: 'bg-orange-500' },  // Orange
];

export const SoilPathogenEvolutionChart: React.FC<SoilPathogenEvolutionChartProps> = ({
  labReports,
  fields,
  properties,
  onAddNewReportForField,
  onSelectReport,
}) => {
  // Available Talhões: from registered fields or unique field names from reports
  const availableFieldOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; propertyId: string; propertyName: string; reportCount: number }>();

    // 1. Add from fields list
    fields.forEach((f) => {
      const prop = properties.find((p) => p.id === f.propertyId);
      map.set(f.id, {
        id: f.id,
        name: f.name || f.code,
        propertyId: f.propertyId,
        propertyName: prop?.farmName || 'Propriedade',
        reportCount: 0,
      });
    });

    // 2. Count reports and add any custom fields from reports
    labReports.forEach((r) => {
      const existing = map.get(r.fieldId);
      if (existing) {
        existing.reportCount += 1;
      } else {
        map.set(r.fieldId || r.fieldName, {
          id: r.fieldId || r.fieldName,
          name: r.fieldName || 'Talhão sem nome',
          propertyId: r.propertyId,
          propertyName: r.propertyName || 'Propriedade',
          reportCount: 1,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.reportCount - a.reportCount);
  }, [fields, properties, labReports]);

  // Selected Field
  const [selectedFieldId, setSelectedFieldId] = useState<string>(() => {
    // Default to field with most reports or first field
    const fieldWithReports = availableFieldOptions.find((f) => f.reportCount > 0);
    return fieldWithReports?.id || availableFieldOptions[0]?.id || '';
  });

  // If selectedFieldId became invalid, reset
  useEffect(() => {
    if (!selectedFieldId && availableFieldOptions.length > 0) {
      const fieldWithReports = availableFieldOptions.find((f) => f.reportCount > 0);
      setSelectedFieldId(fieldWithReports?.id || availableFieldOptions[0].id);
    }
  }, [availableFieldOptions, selectedFieldId]);

  // Filter & Chart controls
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [selectedCategory, setSelectedCategory] = useState<'TODOS' | 'Nematoide' | 'Fungo' | 'Bactéria'>('TODOS');
  const [activePathogenKeys, setActivePathogenKeys] = useState<string[]>([]);
  const [showThresholdGuides, setShowThresholdGuides] = useState<boolean>(true);

  // Current field details
  const currentFieldInfo = useMemo(() => {
    return availableFieldOptions.find((f) => f.id === selectedFieldId);
  }, [availableFieldOptions, selectedFieldId]);

  // Reports for selected field, sorted chronologically
  const fieldReports = useMemo(() => {
    if (!selectedFieldId) return [];
    return labReports
      .filter((r) => r.fieldId === selectedFieldId || r.fieldName === currentFieldInfo?.name)
      .sort((a, b) => new Date(a.sampleDate || a.reportDate).getTime() - new Date(b.sampleDate || b.reportDate).getTime());
  }, [labReports, selectedFieldId, currentFieldInfo]);

  // All distinct pathogens detected in this field
  const distinctPathogensInField = useMemo(() => {
    const map = new Map<string, { name: string; commonName: string; category: string; unit: string; catalogId?: string }>();
    fieldReports.forEach((r) => {
      r.pathogens.forEach((p) => {
        if (!map.has(p.pathogenName)) {
          map.set(p.pathogenName, {
            name: p.pathogenName,
            commonName: p.commonName,
            category: p.category,
            unit: p.unit,
            catalogId: p.catalogId,
          });
        }
      });
    });
    return Array.from(map.values());
  }, [fieldReports]);

  // Filter pathogens by category
  const filteredPathogens = useMemo(() => {
    if (selectedCategory === 'TODOS') return distinctPathogensInField;
    return distinctPathogensInField.filter((p) => p.category === selectedCategory);
  }, [distinctPathogensInField, selectedCategory]);

  // Active pathogens to plot
  const visiblePathogens = useMemo(() => {
    if (activePathogenKeys.length === 0) return filteredPathogens;
    return filteredPathogens.filter((p) => activePathogenKeys.includes(p.name));
  }, [filteredPathogens, activePathogenKeys]);

  // Prepare chronological series data for Recharts
  const chartData = useMemo(() => {
    return fieldReports.map((report, idx) => {
      const dateObj = new Date(report.sampleDate || report.reportDate);
      const formattedDate = dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
      });

      const entry: Record<string, any> = {
        id: report.id,
        protocol: report.labProtocol,
        labName: report.labName,
        date: report.sampleDate || report.reportDate,
        formattedDate: `${formattedDate} (${report.crop || 'Coleta'})`,
        shortDate: formattedDate,
        crop: report.crop,
        cultivar: report.cultivar,
        overallRisk: report.overallRiskLevel,
        reportRef: report,
      };

      // Populate each pathogen's value detected
      report.pathogens.forEach((p) => {
        entry[p.pathogenName] = p.valueDetected;
        entry[`${p.pathogenName}__unit`] = p.unit;
        entry[`${p.pathogenName}__risk`] = p.riskLevel;
        entry[`${p.pathogenName}__low`] = p.thresholdLow;
        entry[`${p.pathogenName}__high`] = p.thresholdHigh;
        entry[`${p.pathogenName}__common`] = p.commonName;
      });

      return entry;
    });
  }, [fieldReports]);

  // Comparative & Trend Insights
  const comparativeInsights = useMemo(() => {
    if (fieldReports.length === 0) return null;

    const firstReport = fieldReports[0];
    const latestReport = fieldReports[fieldReports.length - 1];

    const pathogenDeltas = distinctPathogensInField.map((p) => {
      const firstOcc = firstReport.pathogens.find((item) => item.pathogenName === p.name);
      const latestOcc = latestReport.pathogens.find((item) => item.pathogenName === p.name);

      const firstVal = firstOcc?.valueDetected ?? null;
      const latestVal = latestOcc?.valueDetected ?? null;

      let pctChange: number | null = null;
      if (firstVal !== null && latestVal !== null && firstVal > 0) {
        pctChange = Math.round(((latestVal - firstVal) / firstVal) * 100);
      }

      // Max value across all samples
      let maxVal = 0;
      let maxDate = '';
      fieldReports.forEach((r) => {
        const found = r.pathogens.find((item) => item.pathogenName === p.name);
        if (found && found.valueDetected > maxVal) {
          maxVal = found.valueDetected;
          maxDate = r.sampleDate;
        }
      });

      return {
        ...p,
        firstVal,
        latestVal,
        latestRisk: latestOcc?.riskLevel || 'Baixo',
        pctChange,
        maxVal,
        maxDate,
      };
    });

    const isSuppressionTrending = pathogenDeltas.some((d) => d.pctChange !== null && d.pctChange < -15);
    const isExpandingTrending = pathogenDeltas.some((d) => d.pctChange !== null && d.pctChange > 20);

    return {
      totalSamples: fieldReports.length,
      firstDate: firstReport.sampleDate,
      latestDate: latestReport.sampleDate,
      pathogenDeltas,
      isSuppressionTrending,
      isExpandingTrending,
      latestOverallRisk: latestReport.overallRiskLevel,
    };
  }, [fieldReports, distinctPathogensInField]);

  // Catalog item for threshold reference line if single pathogen is focused
  const focusedSinglePathogen = useMemo(() => {
    if (visiblePathogens.length === 1) {
      const p = visiblePathogens[0];
      const catalog = STANDARD_PATHOGEN_CATALOG.find(
        (c) => c.pathogenName.toLowerCase() === p.name.toLowerCase() || c.id === p.catalogId
      );
      return {
        ...p,
        catalog,
      };
    }
    return null;
  }, [visiblePathogens]);

  const togglePathogenSelection = (name: string) => {
    setActivePathogenKeys((prev) => {
      if (prev.length === 0) {
        // If clicking when all were selected by default, select only this one or invert
        return distinctPathogensInField.map((p) => p.name).filter((n) => n !== name);
      }
      if (prev.includes(name)) {
        const next = prev.filter((k) => k !== name);
        return next;
      }
      return [...prev, name];
    });
  };

  const handleSelectAllPathogens = () => {
    setActivePathogenKeys([]);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Title & Field Selector Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <TrendingUp className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-zinc-100">
                Evolução Comparativa de Patógenos no Solo
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Acompanhamento temporal e curva de infestação de fitopatógenos e nematoides por talhão amostrado.
              </p>
            </div>
          </div>
        </div>

        {/* Talhão Dropdown & Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-700">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 pl-2 shrink-0">Talhão:</span>
            <select
              value={selectedFieldId}
              onChange={(e) => {
                setSelectedFieldId(e.target.value);
                setActivePathogenKeys([]);
              }}
              className="bg-white dark:bg-zinc-900 text-xs font-extrabold text-slate-900 dark:text-zinc-100 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-xs truncate"
            >
              {availableFieldOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name} ({opt.reportCount} {opt.reportCount === 1 ? 'laudo' : 'laudos'})
                </option>
              ))}
            </select>
          </div>

          {onAddNewReportForField && (
            <button
              type="button"
              onClick={() => {
                if (currentFieldInfo) {
                  onAddNewReportForField(currentFieldInfo.id, currentFieldInfo.propertyId);
                }
              }}
              className="bg-[#2D5A27] hover:bg-[#23481f] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 shrink-0"
              title="Anexar nova análise ou coleta para este talhão"
            >
              <Plus className="w-4 h-4" /> Nova Coleta p/ Talhão
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {fieldReports.length === 0 ? (
        /* Empty State for Selected Field */
        <div className="border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-10 text-center space-y-3 bg-slate-50/40 dark:bg-zinc-850/30">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/50 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
            <FlaskConical className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-zinc-200">
            Nenhum laudo laboratorial registrado para o talhão &ldquo;{currentFieldInfo?.name || 'selecionado'}&rdquo;
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Para visualizar a curva temporal e comparação de níveis de nematoides e fungos, anexe os laudos das amostras coletadas nesta área ao longo das safras.
          </p>
          {onAddNewReportForField && currentFieldInfo && (
            <button
              type="button"
              onClick={() => onAddNewReportForField(currentFieldInfo.id, currentFieldInfo.propertyId)}
              className="mt-2 bg-[#2D5A27] hover:bg-[#23481f] text-white text-xs font-bold px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" /> Anexar Primeiro Laudo para este Talhão
            </button>
          )}
        </div>
      ) : (
        /* Has Reports: Chart & Analysis */
        <div className="space-y-6">
          {/* Controls Bar: Category Filter, View Mode, Pathogen Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-zinc-850/60 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1">Categoria:</span>
              {(['TODOS', 'Nematoide', 'Fungo', 'Bactéria'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-300 shadow-2xs border border-emerald-300 dark:border-emerald-700'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  {cat === 'TODOS' ? 'Todos os Tipos' : cat === 'Nematoide' ? 'Nematoides' : cat === 'Fungo' ? 'Fungos' : 'Bactérias'}
                </button>
              ))}
            </div>

            {/* Chart Type Toggle & Threshold Reference Switch */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-700">
                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                    chartType === 'line'
                      ? 'bg-[#2D5A27] text-white shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                  title="Gráfico de Linha (Evolução Temporal)"
                >
                  <LineChartIcon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Linha</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                    chartType === 'bar'
                      ? 'bg-[#2D5A27] text-white shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                  title="Gráfico de Barras Comparativas"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Barras</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('area')}
                  className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                    chartType === 'area'
                      ? 'bg-[#2D5A27] text-white shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                  title="Gráfico de Área"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Área</span>
                </button>
              </div>

              {focusedSinglePathogen && (
                <button
                  type="button"
                  onClick={() => setShowThresholdGuides(!showThresholdGuides)}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                    showThresholdGuides
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-zinc-900 text-slate-500 border-slate-200 dark:border-zinc-700'
                  }`}
                  title="Exibir faixas de corte de risco no gráfico"
                >
                  <SlidersHorizontal className="w-3 h-3" /> Limiares de Dano
                </button>
              )}
            </div>
          </div>

          {/* Pathogen Selection Badges (interactive legend) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-emerald-600" />
                Patógenos Presentes no Histórico deste Talhão ({filteredPathogens.length}):
              </span>
              {activePathogenKeys.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAllPathogens}
                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Mostrar Todos
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {filteredPathogens.map((pathogen, idx) => {
                const color = PATHOGEN_PALETTE[idx % PATHOGEN_PALETTE.length];
                const isSelected =
                  activePathogenKeys.length === 0 || activePathogenKeys.includes(pathogen.name);

                // Find latest detected value for quick indicator
                const latestVal =
                  fieldReports[fieldReports.length - 1]?.pathogens.find(
                    (p) => p.pathogenName === pathogen.name
                  )?.valueDetected;

                return (
                  <button
                    key={pathogen.name}
                    type="button"
                    onClick={() => togglePathogenSelection(pathogen.name)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700 shadow-2xs text-slate-800 dark:text-zinc-100'
                        : 'bg-slate-100/60 dark:bg-zinc-800/40 border-transparent text-slate-400 opacity-60'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color.stroke }}
                    />
                    <span className="italic">{pathogen.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({pathogen.commonName})</span>
                    {latestVal !== undefined && (
                      <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono font-bold text-slate-700 dark:text-zinc-300">
                        {latestVal.toLocaleString('pt-BR')} {pathogen.unit.split(' ')[0]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recharts Canvas */}
          <div className="bg-slate-50/50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5">
            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={chartData} margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                    <XAxis
                      dataKey="shortDate"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} dx={-5} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '11px' }} />
                    {visiblePathogens.map((pathogen, idx) => {
                      const color = PATHOGEN_PALETTE[idx % PATHOGEN_PALETTE.length];
                      return (
                        <Bar
                          key={pathogen.name}
                          dataKey={pathogen.name}
                          name={`${pathogen.name} (${pathogen.unit})`}
                          fill={color.stroke}
                          radius={[6, 6, 0, 0]}
                        />
                      );
                    })}
                  </BarChart>
                ) : chartType === 'area' ? (
                  <AreaChart data={chartData} margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
                    <defs>
                      {visiblePathogens.map((pathogen, idx) => {
                        const color = PATHOGEN_PALETTE[idx % PATHOGEN_PALETTE.length];
                        return (
                          <linearGradient
                            key={`grad-${pathogen.name}`}
                            id={`grad-${pathogen.name}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="5%" stopColor={color.stroke} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={color.stroke} stopOpacity={0.0} />
                          </linearGradient>
                        );
                      })}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                    <XAxis
                      dataKey="shortDate"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} dx={-5} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '11px' }} />
                    {visiblePathogens.map((pathogen, idx) => {
                      const color = PATHOGEN_PALETTE[idx % PATHOGEN_PALETTE.length];
                      return (
                        <Area
                          key={pathogen.name}
                          type="monotone"
                          dataKey={pathogen.name}
                          name={`${pathogen.name} (${pathogen.unit})`}
                          stroke={color.stroke}
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill={`url(#grad-${pathogen.name})`}
                        />
                      );
                    })}
                  </AreaChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 15, right: 25, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                    <XAxis
                      dataKey="shortDate"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} dx={-5} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '11px' }} />

                    {/* Threshold Reference Lines if single pathogen is focused */}
                    {focusedSinglePathogen && showThresholdGuides && (
                      <>
                        {focusedSinglePathogen.catalog?.thresholdHigh && (
                          <ReferenceLine
                            y={focusedSinglePathogen.catalog.thresholdHigh}
                            stroke="#ef4444"
                            strokeDasharray="4 4"
                            strokeWidth={1.5}
                            label={{
                              value: `Nível Crítico (> ${focusedSinglePathogen.catalog.thresholdHigh})`,
                              fill: '#ef4444',
                              fontSize: 10,
                              position: 'top',
                            }}
                          />
                        )}
                        {focusedSinglePathogen.catalog?.thresholdLow && (
                          <ReferenceLine
                            y={focusedSinglePathogen.catalog.thresholdLow}
                            stroke="#10b981"
                            strokeDasharray="4 4"
                            strokeWidth={1.5}
                            label={{
                              value: `Nível Baixo (< ${focusedSinglePathogen.catalog.thresholdLow})`,
                              fill: '#10b981',
                              fontSize: 10,
                              position: 'bottom',
                            }}
                          />
                        )}
                      </>
                    )}

                    {visiblePathogens.map((pathogen, idx) => {
                      const color = PATHOGEN_PALETTE[idx % PATHOGEN_PALETTE.length];
                      return (
                        <Line
                          key={pathogen.name}
                          type="monotone"
                          dataKey={pathogen.name}
                          name={`${pathogen.name} (${pathogen.unit})`}
                          stroke={color.stroke}
                          strokeWidth={2.5}
                          dot={{ r: 5, fill: color.stroke, stroke: '#ffffff', strokeWidth: 1.5 }}
                          activeDot={{ r: 7, strokeWidth: 2 }}
                        />
                      );
                    })}
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* If only 1 report exists for this field */}
            {fieldReports.length === 1 && (
              <div className="mt-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Amostragem Inicial:</strong> Há apenas 1 laudo registrado para este talhão (amostra de{' '}
                  {new Date(fieldReports[0].sampleDate).toLocaleDateString('pt-BR')}). Conforme novas coletas forem anexadas, o gráfico apresentará a curva de evolução e a taxa de supressão ou avanço dos patógenos.
                </span>
              </div>
            )}
          </div>

          {/* Comparative Summary & Agronomic Dynamics Cards */}
          {comparativeInsights && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dynamic Status Card */}
              <div className="bg-slate-50 dark:bg-zinc-850/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                    Dinâmica Populacional
                  </span>
                  {comparativeInsights.isSuppressionTrending ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <TrendingDown className="w-3 h-3" /> Em Supressão
                    </span>
                  ) : comparativeInsights.isExpandingTrending ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                      <TrendingUp className="w-3 h-3" /> Pressão Elevada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-700 dark:text-zinc-300 bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                      <Activity className="w-3 h-3" /> Estável / Monitorar
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                    Histórico amostral: <strong>{comparativeInsights.totalSamples} coletas</strong>
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Período: {new Date(comparativeInsights.firstDate).toLocaleDateString('pt-BR')} até{' '}
                    {new Date(comparativeInsights.latestDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Pathogen Delta Highlights */}
              <div className="bg-slate-50 dark:bg-zinc-850/50 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-2 md:col-span-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                  Variação Entre a Primeira e a Última Amostragem (Δ %)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {comparativeInsights.pathogenDeltas.slice(0, 4).map((d) => {
                    const isDown = d.pctChange !== null && d.pctChange < 0;
                    const isUp = d.pctChange !== null && d.pctChange > 0;

                    return (
                      <div
                        key={d.name}
                        className="bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                      >
                        <div className="truncate pr-2">
                          <span className="font-bold text-slate-800 dark:text-zinc-200 italic block truncate">
                            {d.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Inicial: {d.firstVal ?? '—'} → Atual: {d.latestVal ?? '—'} {d.unit.split(' ')[0]}
                          </span>
                        </div>

                        <div className="shrink-0 text-right">
                          {d.pctChange !== null ? (
                            <span
                              className={`text-xs font-black inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md ${
                                isDown
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : isUp
                                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                              }`}
                            >
                              {isDown ? (
                                <ArrowDownRight className="w-3 h-3" />
                              ) : isUp ? (
                                <ArrowUpRight className="w-3 h-3" />
                              ) : null}
                              {d.pctChange > 0 ? `+${d.pctChange}%` : `${d.pctChange}%`}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Única coleta</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Quick Timeline Samples Strip */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Linha do Tempo das Coletas Realizadas ({fieldReports.length}):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {fieldReports.map((report, idx) => (
                <div
                  key={report.id}
                  onClick={() => onSelectReport && onSelectReport(report)}
                  className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-700 rounded-2xl p-3.5 space-y-2 transition cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      #{idx + 1} • {report.labProtocol}
                    </span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                        report.overallRiskLevel === 'Crítico' || report.overallRiskLevel === 'Alto'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {report.overallRiskLevel}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-100 block">
                      {new Date(report.sampleDate).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {report.crop} {report.cultivar ? `(${report.cultivar})` : ''} • {report.labName}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-bold group-hover:underline">
                    <span>{report.pathogens.length} patógenos</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Tooltip Component for Recharts
interface CustomChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomChartTooltip: React.FC<CustomChartTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const dataPoint = payload[0]?.payload;
  if (!dataPoint) return null;

  return (
    <div className="bg-slate-900/95 text-white backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-xl max-w-sm text-xs space-y-2.5 z-50">
      <div className="border-b border-slate-700 pb-2">
        <div className="flex items-center justify-between gap-2">
          <span className="font-extrabold text-emerald-400 text-xs">{dataPoint.protocol}</span>
          <span
            className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
              dataPoint.overallRisk === 'Crítico' || dataPoint.overallRisk === 'Alto'
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}
          >
            Risco: {dataPoint.overallRisk}
          </span>
        </div>
        <p className="text-[11px] text-slate-300 mt-0.5">
          Data: {new Date(dataPoint.date).toLocaleDateString('pt-BR')} • {dataPoint.crop} {dataPoint.cultivar ? `(${dataPoint.cultivar})` : ''}
        </p>
        <p className="text-[10px] text-slate-400">{dataPoint.labName}</p>
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Patógenos Quantificados:
        </span>
        {payload.map((item: any, idx: number) => {
          const pathogenName = item.dataKey;
          const value = item.value;
          const unit = dataPoint[`${pathogenName}__unit`] || '';
          const risk = dataPoint[`${pathogenName}__risk`] || 'Baixo';
          const common = dataPoint[`${pathogenName}__common`] || '';

          return (
            <div key={idx} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color || item.fill }} />
                <span className="italic font-medium text-slate-200 truncate">{pathogenName}</span>
                {common && <span className="text-[10px] text-slate-400 truncate">({common})</span>}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-mono font-bold text-emerald-300">
                  {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
                </span>
                <span className="text-[10px] text-slate-400">{unit}</span>
                <span
                  className={`text-[9px] font-bold px-1 rounded ${
                    risk === 'Crítico'
                      ? 'bg-rose-900 text-rose-200'
                      : risk === 'Alto'
                      ? 'bg-orange-900 text-orange-200'
                      : risk === 'Médio'
                      ? 'bg-amber-900 text-amber-200'
                      : 'bg-emerald-900 text-emerald-200'
                  }`}
                >
                  {risk}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
