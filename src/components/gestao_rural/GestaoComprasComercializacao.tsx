import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, Plus, Sliders, X } from 'lucide-react';
import {
  VendaComercializacaoRecord,
  CompraInsumoRecord,
  FornecedorRural,
  SafraAgragricola,
  ConfigCulturaIntegrada,
  UnidadeComercializacao,
} from '../../types/gestaoRural';
import { UNIDADE_DESCRICOES } from '../../data/cropCommercializationPresets';

interface GestaoComprasComercializacaoProps {
  vendas: VendaComercializacaoRecord[];
  compras: CompraInsumoRecord[];
  fornecedores: FornecedorRural[];
  safras: SafraAgragricola[];
  configCultura?: ConfigCulturaIntegrada;
  onOpenConfigCultura?: () => void;
  onAddVenda: (venda: VendaComercializacaoRecord) => void;
  onAddCompra: (compra: CompraInsumoRecord) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';
const LABEL_CLASS = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

const formatBRL = (v: number) =>
  `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const GestaoComprasComercializacao: React.FC<GestaoComprasComercializacaoProps> = ({
  vendas,
  compras,
  fornecedores,
  safras,
  configCultura,
  onOpenConfigCultura,
  onAddVenda,
  onAddCompra,
}) => {
  const [activeTab, setActiveTab] = useState<'vendas' | 'compras'>('vendas');
  const [showVendaModal, setShowVendaModal] = useState(false);
  const [showCompraModal, setShowCompraModal] = useState(false);

  const activeCultura = configCultura?.cultura || 'Banana';
  const defaultUnit: UnidadeComercializacao = configCultura?.unidadeComercializacaoPrincipal || 'cx';
  const enabledUnits: UnidadeComercializacao[] =
    configCultura?.unidadesHabilitadas && configCultura.unidadesHabilitadas.length > 0
      ? configCultura.unidadesHabilitadas
      : ['cx', 'sc', 'kg', 'ton'];
  const defaultPrice = configCultura?.precoReferenciaUnitarioR$ || 68;

  const [newVenda, setNewVenda] = useState<Partial<VendaComercializacaoRecord>>({
    numeroContrato: `CTR-${String(vendas.length + 1).padStart(3, '0')}`,
    compradorNome: '',
    compradorDocumento: '',
    cultura: activeCultura,
    safraId: safras[0]?.id || '',
    quantidadeSacasOuKg: 100,
    unidade: defaultUnit,
    precoUnitarioR$: defaultPrice,
    valorFreteR$: 0,
    valorComissaoR$: 0,
    classificacaoQualidade: 'Tipo 1 / Padrão',
    dataVenda: new Date().toISOString().split('T')[0],
    dataVencimentoPagamento: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    statusRecebimento: 'pendente',
  });

  const [newCompra, setNewCompra] = useState({
    numeroPedido: `PED-${String(compras.length + 1).padStart(3, '0')}`,
    fornecedorNome: fornecedores[0]?.nomeFantasia || '',
    produtoNome: '',
    quantidade: 1,
    unidade: 'kg',
    precoUnitarioR$: 0,
    condicaoPagamento: '30 dias',
    dataEntregaPrevista: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  useEffect(() => {
    setNewVenda(prev => ({
      ...prev,
      cultura: activeCultura,
      unidade: defaultUnit,
      precoUnitarioR$: defaultPrice,
    }));
  }, [activeCultura, defaultUnit, defaultPrice]);

  useEffect(() => {
    if (!showVendaModal && !showCompraModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowVendaModal(false);
        setShowCompraModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showVendaModal, showCompraModal]);

  const metrics = useMemo(() => {
    const faturamentoLiquido = vendas.reduce((acc, v) => acc + v.receitaLiquidaR$, 0);
    const totalVolume = vendas.reduce((acc, v) => acc + v.quantidadeSacasOuKg, 0);
    const precoMedio = totalVolume > 0 ? vendas.reduce((acc, v) => acc + v.valorBrutoTotalR$, 0) / totalVolume : 0;
    const totalCompras = compras.reduce((acc, c) => acc + c.valorTotalR$, 0);
    return { faturamentoLiquido, totalVolume, precoMedio, totalCompras };
  }, [vendas, compras]);

  const handleSaveVenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenda.compradorNome?.trim()) return;
    const qtd = Number(newVenda.quantidadeSacasOuKg) || 0;
    const preco = Number(newVenda.precoUnitarioR$) || 0;
    const bruto = qtd * preco;
    const frete = Number(newVenda.valorFreteR$) || 0;
    const comissao = Number(newVenda.valorComissaoR$) || 0;
    const safra = safras.find(s => s.id === newVenda.safraId);

    const created: VendaComercializacaoRecord = {
      id: `vnd-${Date.now()}`,
      numeroContrato: newVenda.numeroContrato || `CTR-${String(vendas.length + 1).padStart(3, '0')}`,
      compradorNome: newVenda.compradorNome.trim(),
      compradorDocumento: newVenda.compradorDocumento || '',
      cultura: newVenda.cultura || activeCultura,
      safraId: safra?.id || '',
      safraNome: safra?.nomeSafra || 'Safra Atual',
      quantidadeSacasOuKg: qtd,
      unidade: newVenda.unidade || defaultUnit,
      precoUnitarioR$: preco,
      valorBrutoTotalR$: bruto,
      umidadePct: 14,
      impurezaPct: 1,
      classificacaoQualidade: newVenda.classificacaoQualidade || 'Padrão',
      notaFiscalNumero: '',
      valorFreteR$: frete,
      valorComissaoR$: comissao,
      receitaLiquidaR$: Math.max(0, bruto - frete - comissao),
      dataVenda: newVenda.dataVenda || new Date().toISOString().split('T')[0],
      dataVencimentoPagamento: newVenda.dataVencimentoPagamento || new Date().toISOString().split('T')[0],
      statusRecebimento: newVenda.statusRecebimento || 'pendente',
    };
    onAddVenda(created);
    setShowVendaModal(false);
    setNewVenda(prev => ({
      ...prev,
      numeroContrato: `CTR-${String(vendas.length + 2).padStart(3, '0')}`,
      compradorNome: '',
    }));
  };

  const handleSaveCompra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompra.fornecedorNome.trim() || !newCompra.produtoNome.trim()) return;
    const qtd = Number(newCompra.quantidade) || 0;
    const preco = Number(newCompra.precoUnitarioR$) || 0;
    const subtotal = qtd * preco;

    const created: CompraInsumoRecord = {
      id: `cmp-${Date.now()}`,
      numeroPedido: newCompra.numeroPedido || `PED-${String(compras.length + 1).padStart(3, '0')}`,
      fornecedorId: 'forn-local',
      fornecedorNome: newCompra.fornecedorNome.trim(),
      dataPedido: new Date().toISOString().split('T')[0],
      dataEntregaPrevista: newCompra.dataEntregaPrevista,
      valorTotalR$: subtotal,
      condicaoPagamento: newCompra.condicaoPagamento || '30 dias',
      status: 'aprovado',
      itens: [
        {
          produtoId: `prod-${Date.now()}`,
          produtoNome: newCompra.produtoNome.trim(),
          quantidade: qtd,
          unidade: newCompra.unidade || 'kg',
          precoUnitarioR$: preco,
          subtotalR$: subtotal,
        },
      ],
    };
    onAddCompra(created);
    setShowCompraModal(false);
    setNewCompra(prev => ({
      ...prev,
      numeroPedido: `PED-${String(compras.length + 2).padStart(3, '0')}`,
      produtoNome: '',
      precoUnitarioR$: 0,
    }));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* KPI STRIP */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
        <div className="p-4">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Receita Líquida (Vendas)</span>
          <span className="text-base font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatBRL(metrics.faturamentoLiquido)}
          </span>
        </div>
        <div className="p-4">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Volume Comercializado</span>
          <span className="text-base font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
            {metrics.totalVolume.toLocaleString('pt-BR')} {defaultUnit}
          </span>
        </div>
        <div className="p-4">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Preço Médio / {defaultUnit}</span>
          <span className="text-base font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
            {formatBRL(metrics.precoMedio)}
          </span>
        </div>
        <div className="p-4">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pedidos de Compra</span>
          <span className="text-base font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
            {formatBRL(metrics.totalCompras)}
          </span>
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Compras &amp; Comercialização</span>
            </h2>
            <div className="flex items-center gap-3 border-l border-slate-200 dark:border-zinc-800 pl-4">
              <button
                type="button"
                onClick={() => setActiveTab('vendas')}
                className={`text-xs font-medium cursor-pointer transition-colors ${
                  activeTab === 'vendas'
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                Vendas ({vendas.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('compras')}
                className={`text-xs font-medium cursor-pointer transition-colors ${
                  activeTab === 'compras'
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                Compras ({compras.length})
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenConfigCultura && (
              <button
                type="button"
                onClick={onOpenConfigCultura}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{activeCultura} ({defaultUnit})</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => (activeTab === 'vendas' ? setShowVendaModal(true) : setShowCompraModal(true))}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{activeTab === 'vendas' ? 'Registrar Venda' : 'Novo Pedido'}</span>
            </button>
          </div>
        </div>

        {/* VENDAS TABLE */}
        {activeTab === 'vendas' &&
          (vendas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                    <th className="py-2.5 px-4">Contrato / Data</th>
                    <th className="py-2.5 px-4">Comprador</th>
                    <th className="py-2.5 px-4">Cultura / Safra</th>
                    <th className="py-2.5 px-4 text-right">Volume</th>
                    <th className="py-2.5 px-4 text-right">Unitário</th>
                    <th className="py-2.5 px-4 text-right">Receita Líquida</th>
                    <th className="py-2.5 px-4 text-right">Recebimento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {vendas.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 tabular-nums">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100 font-mono">{v.numeroContrato}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                          {new Date(`${v.dataVenda}T00:00:00`).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-zinc-200 font-medium">{v.compradorNome}</td>
                      <td className="py-3 px-4">
                        <div className="text-slate-900 dark:text-zinc-100">{v.cultura}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500">{v.safraNome}</div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-800 dark:text-zinc-200 tabular-nums whitespace-nowrap">
                        {v.quantidadeSacasOuKg.toLocaleString('pt-BR')} {v.unidade}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-zinc-300 tabular-nums whitespace-nowrap">
                        {formatBRL(v.precoUnitarioR$)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                        {formatBRL(v.receitaLiquidaR$)}
                      </td>
                      <td className="py-3 px-4 text-right capitalize font-medium whitespace-nowrap">
                        <span
                          className={
                            v.statusRecebimento === 'recebido'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }
                        >
                          {v.statusRecebimento}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma venda registrada. Clique em <strong className="font-medium text-slate-700 dark:text-zinc-200">Registrar Venda</strong> para lançar contratos de escoamento.
            </div>
          ))}

        {/* COMPRAS TABLE */}
        {activeTab === 'compras' &&
          (compras.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                    <th className="py-2.5 px-4">Pedido / Data</th>
                    <th className="py-2.5 px-4">Fornecedor</th>
                    <th className="py-2.5 px-4">Itens</th>
                    <th className="py-2.5 px-4">Pagamento</th>
                    <th className="py-2.5 px-4 text-right">Valor Total</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {compras.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 tabular-nums">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100 font-mono">{c.numeroPedido}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                          {new Date(`${c.dataPedido}T00:00:00`).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-zinc-200">{c.fornecedorNome}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                        {c.itens.map(i => `${i.produtoNome} (${i.quantidade} ${i.unidade})`).join(', ')}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-zinc-400">{c.condicaoPagamento}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums whitespace-nowrap">
                        {formatBRL(c.valorTotalR$)}
                      </td>
                      <td className="py-3 px-4 text-right capitalize font-medium text-emerald-700 dark:text-emerald-400">
                        {c.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhum pedido de compra cadastrado. Clique em <strong className="font-medium text-slate-700 dark:text-zinc-200">Novo Pedido</strong> para registrar compras de insumos.
            </div>
          ))}
      </div>

      {/* VENDA MODAL */}
      {showVendaModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setShowVendaModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Registrar Venda / Contrato</h3>
              <button
                type="button"
                onClick={() => setShowVendaModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveVenda} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={LABEL_CLASS}>Nº do Contrato</label>
                <input
                  type="text"
                  value={newVenda.numeroContrato}
                  onChange={e => setNewVenda({ ...newVenda, numeroContrato: e.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Comprador / Trading / Ceasa</label>
                <input
                  type="text"
                  placeholder="Nome do comprador"
                  value={newVenda.compradorNome}
                  onChange={e => setNewVenda({ ...newVenda, compradorNome: e.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Cultura</label>
                <input
                  type="text"
                  value={newVenda.cultura}
                  onChange={e => setNewVenda({ ...newVenda, cultura: e.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Unidade</label>
                <select
                  value={newVenda.unidade}
                  onChange={e => setNewVenda({ ...newVenda, unidade: e.target.value })}
                  className={INPUT_CLASS}
                >
                  {enabledUnits.map(u => (
                    <option key={u} value={u}>
                      {u} — {UNIDADE_DESCRICOES[u]?.nome || u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Quantidade ({newVenda.unidade})</label>
                <input
                  type="number"
                  step="0.1"
                  value={newVenda.quantidadeSacasOuKg}
                  onChange={e => setNewVenda({ ...newVenda, quantidadeSacasOuKg: Number(e.target.value) })}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newVenda.precoUnitarioR$}
                  onChange={e => setNewVenda({ ...newVenda, precoUnitarioR$: Number(e.target.value) })}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Frete (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newVenda.valorFreteR$}
                  onChange={e => setNewVenda({ ...newVenda, valorFreteR$: Number(e.target.value) })}
                  className={`${INPUT_CLASS} tabular-nums`}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Status Recebimento</label>
                <select
                  value={newVenda.statusRecebimento}
                  onChange={e => setNewVenda({ ...newVenda, statusRecebimento: e.target.value as VendaComercializacaoRecord['statusRecebimento'] })}
                  className={INPUT_CLASS}
                >
                  <option value="pendente">Pendente</option>
                  <option value="parcial">Parcial</option>
                  <option value="recebido">Recebido</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowVendaModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPRA MODAL */}
      {showCompraModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setShowCompraModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Novo Pedido de Compra</h3>
              <button
                type="button"
                onClick={() => setShowCompraModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveCompra} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={LABEL_CLASS}>Nº Pedido</label>
                <input
                  type="text"
                  value={newCompra.numeroPedido}
                  onChange={e => setNewCompra({ ...newCompra, numeroPedido: e.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Fornecedor</label>
                <input
                  type="text"
                  placeholder="Nome do fornecedor"
                  value={newCompra.fornecedorNome}
                  onChange={e => setNewCompra({ ...newCompra, fornecedorNome: e.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS}>Produto / Insumo</label>
                <input
                  type="text"
                  placeholder="Ex: Ureia Agrícola ou Semente Certificada"
                  value={newCompra.produtoNome}
                  onChange={e => setNewCompra({ ...newCompra, produtoNome: e.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Quantidade</label>
                <input
                  type="number"
                  step="0.1"
                  value={newCompra.quantidade}
                  onChange={e => setNewCompra({ ...newCompra, quantidade: Number(e.target.value) })}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Preço Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newCompra.precoUnitarioR$}
                  onChange={e => setNewCompra({ ...newCompra, precoUnitarioR$: Number(e.target.value) })}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Unidade</label>
                <input
                  type="text"
                  value={newCompra.unidade}
                  onChange={e => setNewCompra({ ...newCompra, unidade: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Condição de Pagamento</label>
                <input
                  type="text"
                  value={newCompra.condicaoPagamento}
                  onChange={e => setNewCompra({ ...newCompra, condicaoPagamento: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCompraModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
