import React, { useState, useMemo } from 'react';
import {
  Scale,
  Plus,
  Search,
  MapPin,
  ChevronRight,
  FileCheck2,
  Share2,
  Trash2,
  Check,
  X,
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
  aberta: { label: 'Aberta', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', dotColor: 'bg-emerald-500' },
  planejamento: { label: 'Em planejamento', bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-400', dotColor: 'bg-sky-500' },
  aguardando_vistoria: { label: 'Aguardando vistoria', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', dotColor: 'bg-amber-500' },
  em_analise: { label: 'Em análise', bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', dotColor: 'bg-orange-500' },
  em_calculo: { label: 'Em cálculo', bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-400', dotColor: 'bg-violet-500' },
  aguardando_documentacao: { label: 'Aguardando doc.', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', dotColor: 'bg-rose-500' },
  laudo_elaboracao: { label: 'Laudo em elaboração', bg: 'bg-slate-100 dark:bg-zinc-800', text: 'text-slate-700 dark:text-zinc-300', dotColor: 'bg-slate-500' },
  concluida: { label: 'Concluída', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', dotColor: 'bg-emerald-600' },
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

const CHART_COLORS = ['#10b981', '#0ea5e9', '#f59e0b', '#8b5cf6', '#f43f5e', '#14b8a6'];

export const PericiaDashboard: React.FC<PericiaDashboardProps> = ({
  pericias,
  onSelectPericia,
  onOpenNewModal,
  onOpenEvidenceChain,
  onOpenReportGenerator,
  onDeletePericia,
  onClearAllPericias,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedTipoFilter, setSelectedTipoFilter] = useState<string>('all');
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const emAndamento = pericias.filter(p => !['concluida', 'arquivada'].includes(p.status)).length;
    const aguardandoVistoria = pericias.filter(p => p.status === 'aguardando_vistoria').length;
    const vistoriasRealizadas = pericias.reduce((acc, p) => acc + (p.vistorias?.length || 0), 0);
    const emAnalise = pericias.filter(p => p.status === 'em_analise').length;
    const aguardandoLaudo = pericias.filter(p => ['laudo_elaboracao', 'em_calculo'].includes(p.status)).length;
    const concluidas = pericias.filter(p => p.status === 'concluida').length;
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
      imoveisUnicos,
      areaTotal,
      valorTotalDanos,
    };
  }, [pericias]);

  const chartCulturaData = useMemo(() => {
    const counts: Record<string, number> = {};
    pericias.forEach(p => {
      const cultura = p.objetoDescricao?.cultura || 'Não informada';
      counts[cultura] = (counts[cultura] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, Qtd: value }));
  }, [pericias]);

  const chartStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    pericias.forEach(p => {
      const st = STATUS_LABELS[p.status]?.label || p.status;
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, Qtd: value }));
  }, [pericias]);

  const chartDanosData = useMemo(() => {
    const sums: Record<string, number> = {};
    pericias.forEach(p => {
      const tipo = p.calculosDanos?.tipoDanoPredominante || TIPO_PERICIA_LABELS[p.tipo] || 'Geral';
      const valor = p.calculosDanos?.perdaFinanceiraTotalBrl || 0;
      sums[tipo] = (sums[tipo] || 0) + valor;
    });
    return Object.entries(sums)
      .filter(([, valor]) => valor > 0)
      .map(([name, valor]) => ({
        name,
        valorMil: Number((valor / 1000).toFixed(1)),
      }));
  }, [pericias]);

  const filteredPericias = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return pericias.filter(p => {
      const matchSearch =
        !q ||
        p.nome.toLowerCase().includes(q) ||
        p.codigoPericia.toLowerCase().includes(q) ||
        p.contratanteNome.toLowerCase().includes(q) ||
        p.imovelNome.toLowerCase().includes(q) ||
        p.municipio.toLowerCase().includes(q) ||
        p.responsavelTecnico.toLowerCase().includes(q);

      const matchStatus = selectedStatusFilter === 'all' || p.status === selectedStatusFilter;
      const matchTipo = selectedTipoFilter === 'all' || p.tipo === selectedTipoFilter;

      return matchSearch && matchStatus && matchTipo;
    });
  }, [pericias, searchTerm, selectedStatusFilter, selectedTipoFilter]);

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Perícias &amp; Laudos Técnicos (CREA / ABNT NBR 14.653)
          </div>
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-50 mt-0.5">
            Perícia Rural &amp; Engenharia Agronômica
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Vistorias presenciais, avaliação de imóveis, cálculo de danos, quesitos e emissão de laudos oficiais
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {pericias.length > 0 && onClearAllPericias && (
            !confirmClearAll ? (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white hover:border-rose-300 hover:text-rose-600 dark:bg-zinc-900 dark:hover:border-rose-800 dark:hover:text-rose-400 text-slate-500 dark:text-zinc-400 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Limpar todos os registros"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-xs">
                <span className="text-rose-700 dark:text-rose-300 font-medium">Zerar lista?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClearAllPericias();
                    setConfirmClearAll(false);
                  }}
                  className="h-6 px-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  Sim
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="h-6 px-2 rounded-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  Não
                </button>
              </div>
            )
          )}

          <button
            type="button"
            onClick={onOpenNewModal}
            className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Perícia</span>
          </button>
        </div>
      </div>

      {/* UNIFIED HAIRLINE KPI STRIP */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
        <div className="p-4 space-y-0.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Total Perícias</span>
          <span className="text-lg font-semibold text-slate-900 dark:text-zinc-50 tabular-nums block">{pericias.length}</span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">{stats.imoveisUnicos} imóvel(is)</span>
        </div>

        <div className="p-4 space-y-0.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Em Andamento</span>
          <span className="text-lg font-semibold text-slate-900 dark:text-zinc-50 tabular-nums block">{stats.emAndamento}</span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">Processos ativos</span>
        </div>

        <div className="p-4 space-y-0.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Aguard. Vistoria</span>
          <span className="text-lg font-semibold text-amber-700 dark:text-amber-400 tabular-nums block">{stats.aguardandoVistoria}</span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">{stats.vistoriasRealizadas} vistoria(s) feitas</span>
        </div>

        <div className="p-4 space-y-0.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Análise / Laudo</span>
          <span className="text-lg font-semibold text-slate-900 dark:text-zinc-50 tabular-nums block">
            {stats.emAnalise + stats.aguardandoLaudo}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">Em elaboração</span>
        </div>

        <div className="p-4 space-y-0.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Concluídas</span>
          <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums block">{stats.concluidas}</span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">Laudos emitidos</span>
        </div>

        <div className="p-4 space-y-0.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Danos Apurados</span>
          <span
            className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums block truncate"
            title={`R$ ${stats.valorTotalDanos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          >
            {stats.valorTotalDanos >= 1_000_000
              ? `R$ ${(stats.valorTotalDanos / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`
              : `R$ ${stats.valorTotalDanos.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
            {stats.areaTotal.toLocaleString('pt-BR')} ha periciados
          </span>
        </div>
      </div>

      {/* ANALYTICS CHARTS (ONLY WHEN THERE ARE REGISTERED PERÍCIAS) */}
      {pericias.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Perícias por Cultura</h3>
              <span className="text-[11px] text-slate-400 tabular-nums">{chartCulturaData.length} cultura(s)</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartCulturaData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: any) => [`${value} perícia(s)`, 'Total']} />
                  <Bar dataKey="Qtd" fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Distribuição por Status</h3>
              <span className="text-[11px] text-slate-400 tabular-nums">{chartStatusData.length} status</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={64}
                    paddingAngle={2}
                    dataKey="Qtd"
                  >
                    {chartStatusData.map((_, index) => (
                      <Cell key={`status-cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} perícia(s)`, 'Status']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Valoração de Danos (R$ mil)</h3>
              <span className="text-[11px] text-slate-400 tabular-nums">
                R$ {stats.valorTotalDanos.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </span>
            </div>
            {chartDanosData.length > 0 ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDanosData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => [`R$ ${value} mil`, 'Danos']} />
                    <Bar dataKey="valorMil" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400 dark:text-zinc-500 border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg">
                Sem danos valorados ainda
              </div>
            )}
          </div>
        </div>
      )}

      {/* PERÍCIAS TABLE */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Processos e Perícias ({filteredPericias.length})
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Clique em uma linha para abrir os submódulos de vistoria, análise, cálculos e laudo
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar código, imóvel, contratante..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="h-8 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-700 dark:text-zinc-200 focus:outline-none"
            >
              <option value="all">Todos os status</option>
              {Object.entries(STATUS_LABELS).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.label}
                </option>
              ))}
            </select>

            <select
              value={selectedTipoFilter}
              onChange={e => setSelectedTipoFilter(e.target.value)}
              className="h-8 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-700 dark:text-zinc-200 focus:outline-none"
            >
              <option value="all">Todos os tipos</option>
              {Object.entries(TIPO_PERICIA_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                <th className="py-2.5 px-4">Código / Perícia</th>
                <th className="py-2.5 px-4">Contratante / Imóvel</th>
                <th className="py-2.5 px-4">Localidade</th>
                <th className="py-2.5 px-4">RT / ART</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Danos</th>
                <th className="py-2.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredPericias.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center">
                    <div className="max-w-sm mx-auto space-y-2.5">
                      <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                      <div className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                        {pericias.length === 0 ? 'Nenhuma perícia cadastrada' : 'Nenhuma perícia encontrada'}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {pericias.length === 0
                          ? 'Inicie um novo processo pericial para registrar vistorias, cálculos e laudos técnicos.'
                          : 'Ajuste os filtros ou termo de busca para localizar um processo.'}
                      </p>
                      {pericias.length === 0 && (
                        <button
                          type="button"
                          onClick={onOpenNewModal}
                          className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
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
                      onClick={() => onSelectPericia(pericia)}
                      className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1">
                          {pericia.nome}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <span className="font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                            {pericia.codigoPericia}
                          </span>
                          <span>·</span>
                          <span>{tipoLabel}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 dark:text-zinc-200">{pericia.contratanteNome}</div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">{pericia.imovelNome}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-zinc-300 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          {pericia.municipio} - {pericia.uf}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-slate-800 dark:text-zinc-200">{pericia.responsavelTecnico}</div>
                        <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                          {pericia.crea}
                          {pericia.artNumero ? ` · ${pericia.artNumero}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`font-medium ${statusInfo.text}`}>{statusInfo.label}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-semibold tabular-nums whitespace-nowrap">
                        {valorDanos > 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-400">
                            R$ {valorDanos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-zinc-500 font-normal">Em apuração</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        {confirmDeleteId === pericia.id && onDeletePericia ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                onDeletePericia(pericia.id);
                                setConfirmDeleteId(null);
                              }}
                              className="h-7 px-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium cursor-pointer"
                            >
                              Excluir
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-[11px] font-medium cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenEvidenceChain(pericia)}
                              title="Cadeia de Custódia"
                              className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onOpenReportGenerator(pericia)}
                              title="Gerar Laudo PDF"
                              className="p-1.5 rounded-md text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                            >
                              <FileCheck2 className="w-3.5 h-3.5" />
                            </button>
                            {onDeletePericia && (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(pericia.id)}
                                title="Excluir perícia"
                                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onSelectPericia(pericia)}
                              className="h-7 px-2 rounded-md text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-medium inline-flex items-center gap-0.5 cursor-pointer"
                            >
                              <span>Abrir</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
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
