import React, { useState, useMemo } from 'react';
import {
  Scale,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  Building2,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart2,
  ShieldCheck,
  ChevronRight,
  Eye,
  FileCheck2,
  Share2,
  Layers,
  Sparkles,
  Map,
  Trash2,
  RotateCcw,
  Briefcase,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Pericia, PericiaStatus, TipoPericia } from '../../types/pericia';

interface PericiaDashboardProps {
  pericias: Pericia[];
  onSelectPericia: (pericia: Pericia) => void;
  onOpenNewModal: () => void;
  onOpenEvidenceChain: (pericia: Pericia) => void;
  onOpenReportGenerator: (pericia: Pericia) => void;
  onDeletePericia?: (id: string) => void;
  onLoadDemoPericias?: () => void;
  onClearAllPericias?: () => void;
}

export const STATUS_LABELS: Record<PericiaStatus, { label: string; bg: string; text: string; dotColor: string }> = {
  aberta: { label: 'Aberta', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300', dotColor: 'bg-emerald-500' },
  planejamento: { label: 'Em planejamento', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-800 dark:text-blue-300', dotColor: 'bg-blue-500' },
  aguardando_vistoria: { label: 'Aguardando vistoria', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300', dotColor: 'bg-amber-500' },
  em_analise: { label: 'Em análise', bg: 'bg-orange-100 dark:bg-orange-950/60', text: 'text-orange-800 dark:text-orange-300', dotColor: 'bg-orange-500' },
  em_calculo: { label: 'Em cálculo', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-800 dark:text-purple-300', dotColor: 'bg-purple-500' },
  aguardando_documentacao: { label: 'Aguardando doc.', bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-800 dark:text-rose-300', dotColor: 'bg-rose-500' },
  laudo_elaboracao: { label: 'Laudo em elaboração', bg: 'bg-slate-200 dark:bg-zinc-800', text: 'text-slate-800 dark:text-zinc-200', dotColor: 'bg-zinc-700' },
  concluida: { label: 'Concluída', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300', dotColor: 'bg-emerald-600' },
  arquivada: { label: 'Arquivada', bg: 'bg-slate-100 dark:bg-zinc-900', text: 'text-slate-500 dark:text-zinc-400', dotColor: 'bg-slate-400' },
};

export const TIPO_PERICIA_LABELS: Record<TipoPericia, string> = {
  agronomica: 'Perícia Agronômica',
  agricola: 'Perícia Agrícola',
  ambiental: 'Perícia Ambiental',
  producao: 'Perícia de Produção',
  danos: 'Perícia de Danos',
  perdas: 'Perícia de Perdas',
  maquinas: 'Perícia de Máquinas',
  imovel_rural: 'Perícia de Imóvel Rural',
  benfeitorias: 'Perícia de Benfeitorias',
  seguro_rural: 'Perícia de Seguro Rural',
  judicial: 'Perícia Judicial',
  extrajudicial: 'Perícia Extrajudicial',
  assistencia_tecnica: 'Assistência Técnica',
  vistoria_tecnica: 'Vistoria Técnica',
  outros: 'Outros',
};

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316'];

export const PericiaDashboard: React.FC<PericiaDashboardProps> = ({
  pericias,
  onSelectPericia,
  onOpenNewModal,
  onOpenEvidenceChain,
  onOpenReportGenerator,
  onDeletePericia,
  onLoadDemoPericias,
  onClearAllPericias,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedTipoFilter, setSelectedTipoFilter] = useState<string>('all');

  // Stats Calculations
  const stats = useMemo(() => {
    const emAndamento = pericias.filter(p => !['concluida', 'arquivada'].includes(p.status)).length;
    const aguardandoVistoria = pericias.filter(p => p.status === 'aguardando_vistoria').length;
    const vistoriasRealizadas = pericias.reduce((acc, p) => acc + (p.vistorias?.length || 0), 0);
    const emAnalise = pericias.filter(p => p.status === 'em_analise').length;
    const aguardandoLaudo = pericias.filter(p => ['laudo_elaboracao', 'em_calculo'].includes(p.status)).length;
    const concluidas = pericias.filter(p => p.status === 'concluida').length;
    const encerradas = pericias.filter(p => ['concluida', 'arquivada'].includes(p.status)).length;

    const imoveisUnicos = new Set(pericias.map(p => p.imovelNome)).size;
    const areaTotal = pericias.reduce((acc, p) => acc + (p.objetoDescricao?.areaAfetadaHa || 0), 0);
    const valorTotalDanos = pericias.reduce((acc, p) => acc + (p.calculosDanos?.perdaFinanceiraTotalBrl || 0), 0);

    return {
      emAndamento,
      aguardandoVistoria,
      vistoriasRealizadas,
      emAnalise,
      aguardandoLaudo,
      concluidas,
      encerradas,
      imoveisUnicos,
      areaTotal,
      valorTotalDanos,
    };
  }, [pericias]);

  // Chart Data: By Tipo
  const chartTipoData = useMemo(() => {
    const counts: Record<string, number> = {};
    pericias.forEach(p => {
      const label = TIPO_PERICIA_LABELS[p.tipo] || p.tipo;
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [pericias]);

  // Chart Data: By Cultura
  const chartCulturaData = useMemo(() => {
    const counts: Record<string, number> = {};
    pericias.forEach(p => {
      const cultura = p.objetoDescricao?.cultura || 'Não informada';
      counts[cultura] = (counts[cultura] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, Qtd: value }));
  }, [pericias]);

  // Chart Data: By Municipio
  const chartMunicipioData = useMemo(() => {
    const counts: Record<string, number> = {};
    pericias.forEach(p => {
      const mun = `${p.municipio || 'N/I'} - ${p.uf || ''}`;
      counts[mun] = (counts[mun] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, Perícias: value }));
  }, [pericias]);

  // Chart Data: By Status
  const chartStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    pericias.forEach(p => {
      const st = STATUS_LABELS[p.status]?.label || p.status;
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, Qtd: value }));
  }, [pericias]);

  // Chart Data: Danos por Categoria
  const chartDanosData = useMemo(() => {
    const sums: Record<string, number> = {};
    pericias.forEach(p => {
      const tipo = p.calculosDanos?.tipoDanoPredominante || TIPO_PERICIA_LABELS[p.tipo] || 'Geral';
      const valor = p.calculosDanos?.perdaFinanceiraTotalBrl || 0;
      sums[tipo] = (sums[tipo] || 0) + valor;
    });
    return Object.entries(sums).map(([name, valor]) => ({
      name,
      ValorMilhes: Number((valor / 1000000).toFixed(2)),
      valorFormatado: `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    }));
  }, [pericias]);

  // Filtered List
  const filteredPericias = useMemo(() => {
    return pericias.filter(p => {
      const matchSearch =
        !searchTerm ||
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigoPericia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contratanteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.imovelNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.responsavelTecnico.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = selectedStatusFilter === 'all' || p.status === selectedStatusFilter;
      const matchTipo = selectedTipoFilter === 'all' || p.tipo === selectedTipoFilter;

      return matchSearch && matchStatus && matchTipo;
    });
  }, [pericias, searchTerm, selectedStatusFilter, selectedTipoFilter]);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl">
                <Scale className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Módulo de Perícia Rural & Engenharia Agronômica
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Ambiente profissional para vistorias, cálculo de danos, pareceres técnicos, quesitos e laudos oficiais (CREA/ABNT/NBR)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {pericias.length > 0 && onClearAllPericias && (
              <button
                onClick={onClearAllPericias}
                title="Limpar todos os registros e iniciar em branco"
                className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-950/40 dark:text-zinc-400 dark:hover:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Registros</span>
              </button>
            )}



            <button
              onClick={onOpenNewModal}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Perícia Técnica</span>
            </button>
          </div>
        </div>

        {/* Status Pills Summary */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-[11px]">
          <span className="font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider text-[10px] mr-1">Legenda Status:</span>
          {Object.entries(STATUS_LABELS).map(([key, info]) => (
            <span
              key={key}
              onClick={() => setSelectedStatusFilter(selectedStatusFilter === key ? 'all' : key)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full cursor-pointer transition-all border ${
                selectedStatusFilter === key
                  ? 'ring-2 ring-emerald-500 font-bold shadow-xs'
                  : 'border-slate-200 dark:border-zinc-700 hover:opacity-80'
              } ${info.bg} ${info.text}`}
            >
              <span className={`w-2 h-2 rounded-full ${info.dotColor}`} />
              {info.label}
            </span>
          ))}
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider truncate">Total Perícias</span>
            <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">{pericias.length}</p>
          <span className="text-[10px] text-slate-400 truncate block">{stats.imoveisUnicos} imóveis rurais</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider truncate">Em Andamento</span>
            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">{stats.emAndamento}</p>
          <span className="text-[10px] text-slate-400 truncate block">Processos ativos</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider truncate">Aguard. Vistoria</span>
            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 truncate">{stats.aguardandoVistoria}</p>
          <span className="text-[10px] text-slate-400 truncate block">{stats.vistoriasRealizadas} vistorias feiras</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider truncate">Em Análise / Laudo</span>
            <FileText className="w-4 h-4 text-purple-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 truncate">{stats.emAnalise + stats.aguardandoLaudo}</p>
          <span className="text-[10px] text-slate-400 truncate block">Elaboração pericial</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider truncate">Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 truncate">{stats.concluidas}</p>
          <span className="text-[10px] text-slate-400 truncate block">Laudos emitidos</span>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md space-y-1 min-w-0 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between opacity-90 gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider truncate">Total de Danos</span>
              <DollarSign className="w-4 h-4 shrink-0" />
            </div>
            <p
              className="text-base sm:text-lg xl:text-xl font-black leading-tight tracking-tight truncate mt-1"
              title={`R$ ${stats.valorTotalDanos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            >
              {stats.valorTotalDanos >= 1_000_000
                ? `R$ ${(stats.valorTotalDanos / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} mi`
                : `R$ ${stats.valorTotalDanos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
          </div>
          <span
            className="text-[10px] opacity-80 truncate block pt-1 border-t border-white/20"
            title={`${stats.areaTotal.toLocaleString('pt-BR')} ha periciados`}
          >
            {stats.areaTotal > 0 ? `${stats.areaTotal.toLocaleString('pt-BR')} ha periciados` : '0 ha periciados'}
          </span>
        </div>
      </div>

      {/* Analytics & Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Chart 1: Distribuição por Cultura */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
              Distribuição por Cultura Agrícola
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{chartCulturaData.length} Culturas</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartCulturaData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: any) => [`${value} Perícias`, 'Quantidade']} />
                <Bar dataKey="Qtd" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Distribuição por Município / UF */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              Distribuição por Município / UF
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{chartMunicipioData.length} Municípios</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartMunicipioData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: any) => [`${value} Perícias`, 'Quantidade']} />
                <Bar dataKey="Perícias" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Distribuição por Status */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-purple-600" />
              Distribuição por Status
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">{chartStatusData.length} Status Ativos</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="Qtd"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {chartStatusData.map((_, index) => (
                    <Cell key={`status-cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value} Perícias`, 'Status']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Valoração de Danos Apurados por Categoria */}
        <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Valoração de Danos Apurados por Tipo de Perícia (R$ Milhões)
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Total R$ {stats.valorTotalDanos.toLocaleString('pt-BR')}</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDanosData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: any) => [`R$ ${value} Milhões`, 'Valor Danos']} />
                <Bar dataKey="ValorMilhes" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main List & Table Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs space-y-4">
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Processos e Perícias Cadastradas ({filteredPericias.length})
            </h3>
            <p className="text-xs text-slate-500">Selecione uma perícia para acessar seus 5 submódulos e cadeia de custódia</p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código, contratante, imóvel..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs"
              />
            </div>

            <select
              value={selectedTipoFilter}
              onChange={e => setSelectedTipoFilter(e.target.value)}
              className="p-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs"
            >
              <option value="all">Todos os Tipos</option>
              {Object.entries(TIPO_PERICIA_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50 dark:bg-zinc-800/60 text-slate-500 dark:text-zinc-400 uppercase font-bold text-[10px] border-b border-slate-100 dark:border-zinc-800">
              <tr>
                <th className="p-3.5 pl-5">Código / Perícia</th>
                <th className="p-3.5">Contratante / Imóvel</th>
                <th className="p-3.5">Município/UF</th>
                <th className="p-3.5">Responsável / ART</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Danos Apurados</th>
                <th className="p-3.5 text-center pr-5">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredPericias.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                        {pericias.length === 0 ? 'Nenhuma perícia cadastrada' : 'Nenhuma perícia encontrada'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {pericias.length === 0
                          ? 'Inicie o cadastro da sua primeira perícia técnica, avaliação rural ou vistoria agronômica para uso profissional.'
                          : 'Tente ajustar os filtros ou termos de busca para encontrar o registro desejado.'}
                      </p>
                      {pericias.length === 0 && (
                        <button
                          onClick={onOpenNewModal}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer mt-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Cadastrar Primeira Perícia</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPericias.map(pericia => {
                  const statusInfo = STATUS_LABELS[pericia.status] || STATUS_LABELS.aberta;
                  const tipoLabel = TIPO_PERICIA_LABELS[pericia.tipo] || pericia.tipo;
                  const valorDanos = pericia.calculosDanos?.perdaFinanceiraTotalBrl || 0;

                  return (
                    <tr
                      key={pericia.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectPericia(pericia)}
                    >
                      <td className="p-3.5 pl-5 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {pericia.codigoPericia}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">{tipoLabel}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 transition-colors">
                          {pericia.nome}
                        </h4>
                      </td>

                      <td className="p-3.5 space-y-0.5">
                        <p className="font-semibold text-slate-800 dark:text-zinc-200">{pericia.contratanteNome}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {pericia.imovelNome}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-slate-700 dark:text-zinc-300">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          {pericia.municipio} - {pericia.uf}
                        </span>
                      </td>

                      <td className="p-3.5 space-y-0.5">
                        <p className="font-medium text-slate-800 dark:text-zinc-200">{pericia.responsavelTecnico}</p>
                        <p className="text-[10px] font-mono text-slate-400">{pericia.crea} • {pericia.artNumero}</p>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${statusInfo.bg} ${statusInfo.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {valorDanos > 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            R$ {valorDanos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Em Apuração</span>
                        )}
                      </td>

                      <td className="p-3.5 text-center pr-5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenEvidenceChain(pericia)}
                            title="Ver Cadeia de Custódia & Evidências"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onOpenReportGenerator(pericia)}
                            title="Gerar Laudo Oficial PDF"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <FileCheck2 className="w-4 h-4" />
                          </button>

                          {onDeletePericia && (
                            <button
                              onClick={() => onDeletePericia(pericia.id)}
                              title="Excluir perícia"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onSelectPericia(pericia)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 rounded-lg font-bold text-xs flex items-center gap-0.5 cursor-pointer"
                          >
                            Abrir <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
