import React, { useState } from 'react';
import {
  DollarSign,
  Building2,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Wheat,
  TrendingUp,
  Tag,
  Search,
} from 'lucide-react';
import { VendaComercializacaoRecord, CompraInsumoRecord, FornecedorRural, SafraAgragricola } from '../../types/gestaoRural';

interface GestaoComprasComercializacaoProps {
  vendas: VendaComercializacaoRecord[];
  compras: CompraInsumoRecord[];
  fornecedores: FornecedorRural[];
  safras: SafraAgragricola[];
  onAddVenda: (venda: VendaComercializacaoRecord) => void;
  onAddCompra: (compra: CompraInsumoRecord) => void;
}

export const GestaoComprasComercializacao: React.FC<GestaoComprasComercializacaoProps> = ({
  vendas,
  compras,
  fornecedores,
  safras,
  onAddVenda,
  onAddCompra,
}) => {
  const [activeTab, setActiveTab] = useState<'vendas' | 'compras' | 'fornecedores'>('vendas');
  const [showAddVendaModal, setShowAddVendaModal] = useState(false);

  const [newVenda, setNewVenda] = useState<Partial<VendaComercializacaoRecord>>({
    compradorNome: 'Cargill Agrícola S.A.',
    compradorDocumento: '60.498.706/0001-57',
    cultura: 'Soja',
    safraId: safras[0]?.id || '',
    quantidadeSacasOuKg: 1000,
    unidade: 'sc',
    precoUnitarioR$: 140.0,
    umidadePct: 13.5,
    impurezaPct: 1.0,
    classificacaoQualidade: 'Tipo 1 Exportação',
    notaFiscalNumero: 'NF-e 002.100',
    valorFreteR$: 2500,
    valorComissaoR$: 0,
    statusRecebimento: 'recebido',
  });

  const handleSaveVenda = (e: React.FormEvent) => {
    e.preventDefault();
    const safra = safras.find(s => s.id === newVenda.safraId) || safras[0];
    const qtd = Number(newVenda.quantidadeSacasOuKg) || 0;
    const preco = Number(newVenda.precoUnitarioR$) || 0;
    const bruto = qtd * preco;
    const frete = Number(newVenda.valorFreteR$) || 0;
    const comissao = Number(newVenda.valorComissaoR$) || 0;
    const liquido = bruto - frete - comissao;

    const created: VendaComercializacaoRecord = {
      id: `vend-${Date.now()}`,
      numeroContrato: `CTR-${Date.now().toString().slice(-4)}`,
      compradorNome: newVenda.compradorNome || 'Comprador',
      compradorDocumento: newVenda.compradorDocumento || '00.000.000/0001-00',
      cultura: newVenda.cultura || 'Soja',
      safraId: safra?.id || 'safra-01',
      safraNome: safra?.nomeSafra || 'Safra Verão',
      quantidadeSacasOuKg: qtd,
      unidade: newVenda.unidade || 'sc',
      precoUnitarioR$: preco,
      valorBrutoTotalR$: bruto,
      umidadePct: Number(newVenda.umidadePct) || 13.5,
      impurezaPct: Number(newVenda.impurezaPct) || 1.0,
      classificacaoQualidade: newVenda.classificacaoQualidade || 'Padrão',
      notaFiscalNumero: newVenda.notaFiscalNumero || 'NF-e 000',
      valorFreteR$: frete,
      valorComissaoR$: comissao,
      receitaLiquidaR$: liquido,
      dataVenda: new Date().toISOString().split('T')[0],
      dataVencimentoPagamento: new Date().toISOString().split('T')[0],
      statusRecebimento: 'recebido',
    };

    onAddVenda(created);
    setShowAddVendaModal(false);
  };

  const totalComercializadoBruto = vendas.reduce((acc, v) => acc + v.valorBrutoTotalR$, 0);
  const totalComercializadoLiquido = vendas.reduce((acc, v) => acc + v.receitaLiquidaR$, 0);

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider">
            <DollarSign className="w-4 h-4" />
            Módulo 7 • Comercialização de Safras, Vendas & Contratos
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Comercialização Agrícola, Descontos & Receita Líquida
          </h2>
          <p className="text-slate-500">
            Contratos futuros, venda de grãos, cálculo de frete, comissões, classificação e notas fiscais
          </p>
        </div>

        <button
          onClick={() => setShowAddVendaModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Venda de Produção</span>
        </button>
      </div>

      {/* SUMMARY BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Faturamento Bruto
          </span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block">
            R$ {totalComercializadoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-slate-500">{vendas.length} Contratos de Venda</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Receita Líquida Apurada
          </span>
          <span className="text-lg font-black text-blue-600 dark:text-blue-400 block">
            R$ {totalComercializadoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">Líquido de Frete e Descontos</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Volume Comercializado
          </span>
          <span className="text-lg font-black text-purple-600 dark:text-purple-400 block">
            {vendas.reduce((acc, v) => acc + v.quantidadeSacasOuKg, 0).toLocaleString('pt-BR')} sc
          </span>
          <span className="text-[10px] text-slate-500">Soja / Milho / HF</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-1 shadow-2xs">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Preço Médio Praticado
          </span>
          <span className="text-lg font-black text-amber-600 dark:text-amber-400 block">
            R$ 138,50 / sc
          </span>
          <span className="text-[10px] text-emerald-600 font-bold">+R$ 8,50 acima do custo</span>
        </div>
      </div>

      {/* TABLE OF SALES */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
        <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3">
          <Wheat className="w-4 h-4 text-emerald-600" />
          Contratos e Histórico de Vendas da Safra ({vendas.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold">
                <th className="p-3">Contrato / NF</th>
                <th className="p-3">Comprador</th>
                <th className="p-3">Cultura / Safra</th>
                <th className="p-3 text-right">Volume</th>
                <th className="p-3 text-right">Preço / Unid</th>
                <th className="p-3 text-right">Bruto (R$)</th>
                <th className="p-3 text-right">Líquido (R$)</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {vendas.map(v => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                  <td className="p-3">
                    <span className="font-mono font-bold block text-slate-900 dark:text-white">
                      {v.numeroContrato}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{v.notaFiscalNumero}</span>
                  </td>
                  <td className="p-3 font-bold text-slate-800 dark:text-zinc-100">
                    {v.compradorNome}
                    <span className="text-[10px] text-slate-400 font-normal block">
                      Doc: {v.compradorDocumento}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="font-bold block text-emerald-600">{v.cultura}</span>
                    <span className="text-[10px] text-slate-500 block">{v.safraNome}</span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold">
                    {v.quantidadeSacasOuKg.toLocaleString('pt-BR')} {v.unidade}
                  </td>
                  <td className="p-3 text-right font-mono">
                    R$ {v.precoUnitarioR$.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold">
                    R$ {v.valorBrutoTotalR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-right font-black font-mono text-emerald-600 dark:text-emerald-400">
                    R$ {v.receitaLiquidaR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      {v.statusRecebimento}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD VENDA MODAL */}
      {showAddVendaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-lg w-full space-y-4">
            <h3 className="font-black text-base border-b pb-2">Registrar Venda de Produção</h3>

            <form onSubmit={handleSaveVenda} className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold">Comprador</label>
                <input
                  type="text"
                  value={newVenda.compradorNome}
                  onChange={e => setNewVenda({ ...newVenda, compradorNome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  required
                />
              </div>

              <div>
                <label className="block font-bold">Cultura</label>
                <input
                  type="text"
                  value={newVenda.cultura}
                  onChange={e => setNewVenda({ ...newVenda, cultura: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  required
                />
              </div>

              <div>
                <label className="block font-bold">Quantidade (sc)</label>
                <input
                  type="number"
                  value={newVenda.quantidadeSacasOuKg}
                  onChange={e =>
                    setNewVenda({ ...newVenda, quantidadeSacasOuKg: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  required
                />
              </div>

              <div>
                <label className="block font-bold">Preço Saca (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newVenda.precoUnitarioR$}
                  onChange={e =>
                    setNewVenda({ ...newVenda, precoUnitarioR$: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                  required
                />
              </div>

              <div className="col-span-2 flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddVendaModal(false)}
                  className="px-4 py-2 bg-slate-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                >
                  Confirmar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
