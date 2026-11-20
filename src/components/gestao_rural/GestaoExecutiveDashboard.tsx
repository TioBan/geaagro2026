import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  AlertTriangle,
  Wrench,
  CalendarClock,
  ArrowRight,
  Tractor,
} from 'lucide-react';
import {
  PropriedadeRural,
  TalhaoRural,
  SafraAgragricola,
  ContaFinanceiraRecord,
  ItemEstoqueRural,
  MaquinaImplementoRecord,
  FuncionarioRuralRecord,
  OperacaoCampoRecord,
  ConfigCulturaIntegrada,
} from '../../types/gestaoRural';

interface GestaoExecutiveDashboardProps {
  propriedade: PropriedadeRural;
  talhoes: TalhaoRural[];
  safras: SafraAgragricola[];
  financeiro: ContaFinanceiraRecord[];
  estoque: ItemEstoqueRural[];
  maquinas: MaquinaImplementoRecord[];
  funcionarios: FuncionarioRuralRecord[];
  operacoes: OperacaoCampoRecord[];
  configCultura?: ConfigCulturaIntegrada;
  onOpenConfigCultura?: () => void;
  onNavigateTab: (tab: string) => void;
}

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const formatCompactBRL = (val: number) => {
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}R$ ${(abs / 1_000).toFixed(1)}k`;
  return `${sign}R$ ${abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const GestaoExecutiveDashboard: React.FC<GestaoExecutiveDashboardProps> = ({
  talhoes,
  safras,
  financeiro,
  estoque,
  maquinas,
  funcionarios,
  operacoes,
  configCultura,
  onNavigateTab,
}) => {
  const unidadePrincipal = configCultura?.unidadeComercializacaoPrincipal || 'sc';

  const metrics = useMemo(() => {
    const areaPlantada = safras.reduce((acc, s) => acc + (s.areaHa || 0), 0);
    const totalReceita = financeiro
      .filter(f => f.tipo === 'receita')
      .reduce((acc, f) => acc + f.valorR$, 0);
    const totalDespesa = financeiro
      .filter(f => f.tipo === 'despesa')
      .reduce((acc, f) => acc + f.valorR$, 0);
    const lucroLiquido = totalReceita - totalDespesa;
    const custoPorHa = areaPlantada > 0 ? totalDespesa / areaPlantada : 0;
    const roi = totalDespesa > 0 ? (lucroLiquido / totalDespesa) * 100 : 0;
    const margemLucro = totalReceita > 0 ? (lucroLiquido / totalReceita) * 100 : 0;

    const estoqueAlerta = estoque.filter(e => e.statusAlerta !== 'normal');
    const maquinasManutencao = maquinas.filter(m => m.status === 'em_manutencao');
    const contasAtrasadas = financeiro.filter(f => f.status === 'atrasado');
    const contasPendentesPagar = financeiro.filter(
      f => f.tipo === 'despesa' && (f.status === 'pendente' || f.status === 'atrasado')
    );

    const safrasColhidas = safras.filter(s => s.status === 'colhida' && (s.produtividadeRealizadaSacasHa || 0) > 0);
    const mediaProdutividade =
      safrasColhidas.length > 0
        ? safrasColhidas.reduce((acc, s) => acc + (s.produtividadeRealizadaSacasHa || 0), 0) / safrasColhidas.length
        : 0;

    return {
      areaPlantada,
      totalReceita,
      totalDespesa,
      lucroLiquido,
      custoPorHa,
      roi,
      margemLucro,
      estoqueAlerta,
      maquinasManutencao,
      contasAtrasadas,
      contasPendentesPagar,
      mediaProdutividade,
    };
  }, [safras, financeiro, estoque, maquinas]);

  const fluxoCaixaMensal = useMemo(() => {
    const map = new Map<number, { mes: string; receita: number; despesa: number; saldo: number }>();
    financeiro.forEach(item => {
      const dateStr = item.dataPagamentoRecebimento || item.dataVencimento;
      if (!dateStr) return;
      const d = new Date(`${dateStr}T00:00:00`);
      if (Number.isNaN(d.getTime())) return;
      const mIdx = d.getMonth();
      const entry = map.get(mIdx) || { mes: MONTH_LABELS[mIdx], receita: 0, despesa: 0, saldo: 0 };
      if (item.tipo === 'receita') entry.receita += item.valorR$;
      else entry.despesa += item.valorR$;
      entry.saldo = entry.receita - entry.despesa;
      map.set(mIdx, entry);
    });
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, val]) => val);
  }, [financeiro]);

  const custosPorCategoria = useMemo(() => {
    const grouped: Record<string, number> = {};
    financeiro
      .filter(f => f.tipo === 'despesa')
      .forEach(f => {
        grouped[f.categoria] = (grouped[f.categoria] || 0) + f.valorR$;
      });
    return Object.entries(grouped)
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6);
  }, [financeiro]);

  const produtividadePorTalhao = useMemo(() => {
    return safras.slice(0, 6).map(s => ({
      nome: s.talhaoNome.length > 14 ? `${s.talhaoNome.slice(0, 14)}…` : s.talhaoNome,
      meta: s.metaProdutividadeSacasHa || 0,
      realizada: s.produtividadeRealizadaSacasHa || 0,
    }));
  }, [safras]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* PRIMARY KPI STRIP (SINGLE ELEVATION HAIRLINE GRID) */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
        <div className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Área Plantada</span>
          <div className="text-lg font-semibold text-slate-900 dark:text-zinc-50 tabular-nums">
            {metrics.areaPlantada.toLocaleString('pt-BR')} ha
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums block">
            {talhoes.length} talhão(ões) · {safras.length} safra(s)
          </span>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Receita Total</span>
          <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatCompactBRL(metrics.totalReceita)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums block">
            Margem {metrics.margemLucro.toFixed(1)}%
          </span>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Despesas</span>
          <div className="text-lg font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
            {formatCompactBRL(metrics.totalDespesa)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums block">
            {metrics.custoPorHa > 0 ? `R$ ${metrics.custoPorHa.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/ha` : 'Sem área base'}
          </span>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Lucro Líquido</span>
          <div
            className={`text-lg font-semibold tabular-nums ${
              metrics.lucroLiquido >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCompactBRL(metrics.lucroLiquido)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums block">
            ROI {metrics.roi.toFixed(1)}%
          </span>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Produtividade</span>
          <div className="text-lg font-semibold text-slate-900 dark:text-zinc-50 tabular-nums">
            {metrics.mediaProdutividade > 0 ? `${metrics.mediaProdutividade.toFixed(1)} ${unidadePrincipal}/ha` : '—'}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
            Média safras colhidas
          </span>
        </div>

        <div className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Operação &amp; Equipe</span>
          <div className="text-lg font-semibold text-slate-900 dark:text-zinc-50 tabular-nums">
            {maquinas.length} máq. · {funcionarios.length} colab.
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums block">
            {operacoes.length} apontamento(s)
          </span>
        </div>
      </div>

      {/* OPERATIONAL ALERTS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onNavigateTab('estoque')}
          className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-amber-400/70 dark:hover:border-amber-600/60 rounded-xl p-4 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Alertas de Estoque</div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate tabular-nums">
                {metrics.estoqueAlerta.length > 0
                  ? `${metrics.estoqueAlerta.length} item(ns) no mínimo ou vencendo`
                  : `${estoque.length} insumo(s) em nível regular`}
              </div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('maquinas_rh')}
          className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-sky-400/70 dark:hover:border-sky-600/60 rounded-xl p-4 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Wrench className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Frota &amp; Manutenção</div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate tabular-nums">
                {metrics.maquinasManutencao.length > 0
                  ? `${metrics.maquinasManutencao.length} máquina(s) em manutenção`
                  : `${maquinas.length} ativo(s) disponível(is)`}
              </div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('financeiro')}
          className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 hover:border-rose-400/70 dark:hover:border-rose-600/60 rounded-xl p-4 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <CalendarClock className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">Contas a Pagar</div>
              <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate tabular-nums">
                {metrics.contasAtrasadas.length > 0
                  ? `${metrics.contasAtrasadas.length} título(s) vencido(s)`
                  : `${metrics.contasPendentesPagar.length} pagamento(s) pendente(s)`}
              </div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* FLUXO DE CAIXA */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Fluxo de Caixa Mensal</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Receitas e despesas agrupadas por mês</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('financeiro')}
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Abrir ERP
            </button>
          </div>

          {fluxoCaixaMensal.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fluxoCaixaMensal} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: any) => [`R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="receita" name="Receitas" stroke="#10b981" fill="#10b981" fillOpacity={0.14} strokeWidth={2} />
                  <Area type="monotone" dataKey="despesa" name="Despesas" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Nenhum lançamento financeiro registrado para compor o fluxo mensal.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('financeiro')}
                className="mt-2.5 h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
              >
                Lançar no Financeiro
              </button>
            </div>
          )}
        </div>

        {/* CUSTOS POR CATEGORIA */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Despesas por Categoria</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Principais centros de custo registrados</p>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {custosPorCategoria.length} categoria(s)
            </span>
          </div>

          {custosPorCategoria.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={custosPorCategoria} layout="vertical" margin={{ top: 4, right: 16, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="categoria" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={96} />
                  <Tooltip
                    formatter={(value: any) => [`R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Despesa']}
                    contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="valor" name="Despesa" fill="#059669" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Cadastre despesas no Financeiro Rural para visualizar a composição de custos.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ROW: PRODUTIVIDADE & OPERAÇÕES RECENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PRODUTIVIDADE META VS REALIZADA */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Produtividade por Talhão</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Meta vs. realizado ({unidadePrincipal}/ha)</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('planejamento')}
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Ver Safras
            </button>
          </div>

          {produtividadePorTalhao.length > 0 ? (
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={produtividadePorTalhao} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="nome" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="meta" name={`Meta (${unidadePrincipal}/ha)`} fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="realizada" name={`Realizada (${unidadePrincipal}/ha)`} fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Nenhuma safra cadastrada para comparar produtividade.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('planejamento')}
                className="mt-2.5 h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium cursor-pointer"
              >
                Planejar Safra
              </button>
            </div>
          )}
        </div>

        {/* ÚLTIMAS OPERAÇÕES DE CAMPO */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Operações Recentes</h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Últimos apontamentos do caderno de campo</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('operacoes')}
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Ver todas
            </button>
          </div>

          {operacoes.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 flex-1">
              {operacoes.slice(0, 5).map(op => (
                <div key={op.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Tractor className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 dark:text-zinc-100 truncate">
                        {op.tipoOperacao} · <span className="text-slate-500 dark:text-zinc-400 font-normal">{op.talhaoNome}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate tabular-nums">
                        {op.areaAplicadaHa} ha{op.produtoUtilizado ? ` · ${op.produtoUtilizado}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 tabular-nums">
                    <div className="font-semibold text-slate-900 dark:text-zinc-100">
                      R$ {op.custoTotalOperacaoR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                      {new Date(op.dataHoraInicio).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 min-h-40 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg p-4">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Nenhuma operação de campo registrada ainda.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('operacoes')}
                className="mt-2.5 h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
              >
                Lançar Operação
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
