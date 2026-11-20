import React, { useMemo } from 'react';
import {
  PropriedadeRuralAvaliacao,
  ImovelComparativoMercado,
  BenfeitoriaItem,
  AvaliacaoCompletaImovel,
  VistoriaTecnica
} from '../../types/avaliacaoImoveis';
import {
  Building2,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Props {
  propriedade: PropriedadeRuralAvaliacao;
  comparativos: ImovelComparativoMercado[];
  benfeitorias: BenfeitoriaItem[];
  avaliacao: AvaliacaoCompletaImovel;
  vistoria: VistoriaTecnica;
  onNavigateTab: (tab: string) => void;
}

const COLORS = ['#10b981', '#0ea5e9', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

export const AvaliacaoDashboardView: React.FC<Props> = ({
  propriedade,
  comparativos,
  benfeitorias,
  avaliacao,
  vistoria,
  onNavigateTab
}) => {
  const comparativosPorMunicipio = useMemo(() => {
    const map = new Map<string, { total: number; somaPreco: number }>();
    comparativos.forEach((c) => {
      const key = c.municipio || 'Não informado';
      const cur = map.get(key) || { total: 0, somaPreco: 0 };
      map.set(key, {
        total: cur.total + 1,
        somaPreco: cur.somaPreco + c.precoPorHectareR$
      });
    });
    return Array.from(map.entries()).map(([municipio, data]) => ({
      municipio,
      quantidade: data.total,
      precoMedioHa: Math.round(data.somaPreco / data.total)
    }));
  }, [comparativos]);

  const dadosUsoSolo = useMemo(() => {
    const t = propriedade.territorial;
    return [
      { name: 'Lavouras', value: t.areaLavourasHa },
      { name: 'Pastagens', value: t.areaPastagensHa },
      { name: 'Reserva Legal', value: t.areaReservaLegalHa },
      { name: 'APP Preservada', value: t.areaAppHa },
      { name: 'Infraestrutura', value: t.areaInfraestruturaHa }
    ].filter((item) => item.value > 0);
  }, [propriedade]);

  const valorPorHa = Math.round(avaliacao.valorFinalImovelR$ / (propriedade.areaTotalHa || 1));
  const amostrasIncluidas = comparativos.filter((c) => c.statusInclusao === 'incluido').length;

  return (
    <div className="space-y-5">
      {/* Resumo Executivo + Faixa de KPIs Unificada */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60">
                NBR 14653-3:2019
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                {avaliacao.grauFundamentacao} · {avaliacao.grauPrecisao}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                {avaliacao.codigoLaudo}
              </span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100 truncate">
              {propriedade.nome || 'Imóvel sem denominação'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {propriedade.municipio || 'Município não informado'}
                {propriedade.estado ? ` - ${propriedade.estado}` : ''}
              </span>
              <span>·</span>
              <span className="tabular-nums font-medium text-slate-700 dark:text-zinc-300">
                {propriedade.areaTotalHa.toLocaleString('pt-BR')} ha
              </span>
              {propriedade.proprietarioNome && (
                <>
                  <span>·</span>
                  <span>{propriedade.proprietarioNome}</span>
                </>
              )}
            </p>
          </div>

          <div className="bg-slate-50/80 dark:bg-zinc-950/70 rounded-lg px-4 py-3 border border-slate-200/80 dark:border-zinc-800 lg:min-w-[270px] shrink-0">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-medium">
              Valor de Mercado Concluído
            </p>
            <p className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400 mt-0.5">
              R$ {avaliacao.valorFinalImovelR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mt-2 pt-2 border-t border-slate-200/70 dark:border-zinc-800">
              <span>Unitário Global</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                R$ {valorPorHa.toLocaleString('pt-BR')}/ha
              </span>
            </div>
          </div>
        </div>

        {/* Faixa de KPIs Principais (Hairline Strip) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-slate-200/80 dark:border-zinc-800 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Amostras de Mercado
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xl font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1.5">
              {comparativos.length}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">amostras</span>
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium tabular-nums">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {amostrasIncluidas} homogeneizadas ativas
            </p>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Benfeitorias (R-H)
              </span>
              <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <p className="text-xl font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1.5">
              R$ {(avaliacao.valorTotalBenfeitoriasR$ / 1_000_000).toFixed(2)}M
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 tabular-nums">
              {benfeitorias.length} construções e instalações
            </p>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Vistoria em Campo
              </span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-xl font-semibold text-slate-900 dark:text-zinc-100 mt-1.5">
              {vistoria.dataVistoria ? 'Registrada' : 'Pendente'}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-1 tabular-nums">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
              {vistoria.dataVistoria || 'Sem data'} · {vistoria.pontosInteresse.length} waypoints GPS
            </p>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Índice IPR GeaAgro
              </span>
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <p className="text-xl font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1.5">
              {avaliacao.indicadores.iprScore}{' '}
              <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">/ 100</span>
            </p>
            <p className="text-xs text-violet-600 dark:text-violet-400 mt-1 font-medium">
              {avaliacao.indicadores.iprClassificacao} Potencial Produtivo
            </p>
          </div>
        </div>
      </div>

      {/* Gráficos Analíticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Preço Médio por Hectare na Região
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Amostras de mercado catalogadas por município (R$/ha)
              </p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          </div>

          <div className="h-60">
            {comparativosPorMunicipio.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                  Nenhuma amostra comparativa cadastrada
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('pesquisa_mercado')}
                  className="mt-2 h-8 px-3 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition-colors"
                >
                  Adicionar amostras de mercado
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparativosPorMunicipio} margin={{ top: 8, right: 8, left: 0, bottom: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                  <XAxis dataKey="municipio" stroke="#64748b" fontSize={11} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(val: number) => [`R$ ${val.toLocaleString('pt-BR')}/ha`, 'Preço Médio']}
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      color: '#f4f4f5',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="precoMedioHa" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Distribuição Territorial do Imóvel
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Zoneamento de uso do solo cadastrado (hectares)
              </p>
            </div>
            <Layers className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
          </div>

          <div className="h-60 flex items-center justify-center">
            {dadosUsoSolo.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                  Zoneamento de áreas ainda não preenchido
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('propriedade')}
                  className="mt-2 h-8 px-3 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition-colors"
                >
                  Informar uso do solo
                </button>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosUsoSolo}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={84}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {dadosUsoSolo.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`${val.toLocaleString('pt-BR')} ha`, 'Área']}
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      color: '#f4f4f5',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Acessos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onNavigateTab('pesquisa_mercado')}
          className="p-4 text-left rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-emerald-500/70 dark:hover:border-emerald-600/70 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Pesquisa de Mercado
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Consultar imóveis comparativos, aplicar homogeneização e gerenciar amostras da região.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('benfeitorias')}
          className="p-4 text-left rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-emerald-500/70 dark:hover:border-emerald-600/70 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Ross-Heidecke Benfeitorias
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Auditar construções, pivôs e instalações com fórmula matemática de depreciação.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('laudo_emissao')}
          className="p-4 text-left rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-emerald-500/70 dark:hover:border-emerald-600/70 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Emissão de Laudo PDF
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Gerar relatório completo de avaliação rural formatado e auditável em PDF.
          </p>
        </button>
      </div>
    </div>
  );
};
