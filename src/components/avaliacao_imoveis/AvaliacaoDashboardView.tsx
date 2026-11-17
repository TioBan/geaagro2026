import React from 'react';
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

const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

export const AvaliacaoDashboardView: React.FC<Props> = ({
  propriedade,
  comparativos,
  benfeitorias,
  avaliacao,
  vistoria,
  onNavigateTab
}) => {
  // Gráfico de comparativos por município
  const comparativosPorMunicipio = React.useMemo(() => {
    const map = new Map<string, { total: number; somaPreco: number }>();
    comparativos.forEach((c) => {
      const cur = map.get(c.municipio) || { total: 0, somaPreco: 0 };
      map.set(c.municipio, {
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

  // Gráfico de distribuição do uso do solo
  const dadosUsoSolo = React.useMemo(() => {
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

  return (
    <div className="space-y-6">
      {/* Banner de Destaque da Avaliação Ativa */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-xl border border-emerald-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                NBR 14653-3:2019
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {avaliacao.grauFundamentacao} • {avaliacao.grauPrecisao}
              </span>
              <span className="text-xs text-slate-400">Laudo: {avaliacao.codigoLaudo}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {propriedade.nome}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              {propriedade.municipio} - {propriedade.estado} • {propriedade.areaTotalHa.toLocaleString('pt-BR')} ha • {propriedade.proprietarioNome}
            </p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-emerald-500/30 min-w-[280px]">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Valor de Mercado Concluído</p>
            <p className="text-2xl lg:text-3xl font-extrabold text-emerald-400 mt-1">
              R$ {avaliacao.valorFinalImovelR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-300 mt-2 pt-2 border-t border-slate-700/60">
              <span>Unitário Global:</span>
              <span className="font-semibold text-white">R$ {valorPorHa.toLocaleString('pt-BR')}/ha</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de KPIs Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amostras de Mercado</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {comparativos.length} <span className="text-sm font-normal text-slate-500">amostras</span>
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {comparativos.filter((c) => c.statusInclusao === 'incluido').length} homogeneizadas ativas
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Benfeitorias Reprodutivas</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            R$ {(avaliacao.valorTotalBenfeitoriasR$ / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {benfeitorias.length} construções & instalações (Ross-Heidecke)
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status da Vistoria</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            Concluída
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {vistoria.dataVistoria} • {vistoria.pontosInteresse.length} waypoints GPS
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Índice IPR GeaAgro</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {avaliacao.indicadores.iprScore} <span className="text-sm font-normal text-slate-500">/ 100</span>
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-semibold">
            {avaliacao.indicadores.iprClassificacao} Potencial Produtivo
          </p>
        </div>
      </div>

      {/* Gráficos Interativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Valores por Hectare por Município */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Preço Médio por Hectare na Região</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Amostras de mercado catalogadas por município (R$/ha)</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativosPorMunicipio} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="municipio" stroke="#64748b" fontSize={11} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: number) => [`R$ ${val.toLocaleString('pt-BR')}/ha`, 'Preço Médio']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="precoMedioHa" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico 2: Distribuição do Uso do Solo */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Distribuição Territorial do Imóvel</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Zoneamento de uso do solo cadastrado (hectares)</p>
            </div>
            <Layers className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosUsoSolo}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {dadosUsoSolo.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val.toLocaleString('pt-BR')} ha`, 'Área']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ações Rápidas de Navegação no Módulo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigateTab('pesquisa_mercado')}
          className="p-4 text-left rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Pesquisa de Mercado
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Consultar imóveis comparativos, aplicar homogeneização e gerenciar amostras da região.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('benfeitorias')}
          className="p-4 text-left rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Ross-Heidecke Benfeitorias
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Auditar construções, pivôs e instalações com fórmula matemática de depreciação.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('laudo_emissao')}
          className="p-4 text-left rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Emissão de Laudo PDF
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gerar relatório completo de avaliação rural formatado e auditável em PDF.
          </p>
        </button>
      </div>
    </div>
  );
};
