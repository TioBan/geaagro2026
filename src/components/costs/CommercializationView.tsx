import React, { useState, useEffect } from 'react';
import { CommercializationRecord, PropertyCropSeason } from '../../types/costs';
import { DollarSign, Plus, Trash2, X } from 'lucide-react';

interface CommercializationViewProps {
  sales: CommercializationRecord[];
  season: PropertyCropSeason;
  onAddSale: (sale: CommercializationRecord) => void;
  onDeleteSale: (id: string) => void;
  selectedFarmId: string;
}

export const CommercializationView: React.FC<CommercializationViewProps> = ({
  sales,
  season,
  onAddSale,
  onDeleteSale,
  selectedFarmId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [quantityBags, setQuantityBags] = useState<number | ''>('');
  const [pricePerBag, setPricePerBag] = useState<number | ''>('');
  const [freightCost, setFreightCost] = useState<number | ''>(0);
  const [commissionCost, setCommissionCost] = useState<number | ''>(0);
  const [storageCost, setStorageCost] = useState<number | ''>(0);
  const [taxesCost, setTaxesCost] = useState<number | ''>(0);
  const [contractType, setContractType] = useState<CommercializationRecord['contractType']>('Mercado Futuro');

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  const seasonSales = (sales || []).filter((s) => s.seasonId === season.id);

  const openModal = () => {
    setCustomerName('');
    setQuantityBags('');
    setPricePerBag('');
    setFreightCost(0);
    setCommissionCost(0);
    setStorageCost(0);
    setTaxesCost(0);
    setContractType('Mercado Futuro');
    setIsModalOpen(true);
  };

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    const bags = Number(quantityBags) || 0;
    const price = Number(pricePerBag) || 0;
    const gross = bags * price;
    const freight = Number(freightCost) || 0;
    const commission = Number(commissionCost) || 0;
    const storage = Number(storageCost) || 0;
    const taxes = Number(taxesCost) || 0;
    const net = gross - (freight + commission + storage + taxes);

    const newSale: CommercializationRecord = {
      id: `sale-${Date.now()}`,
      seasonId: season.id,
      farmId: selectedFarmId || 'farm-1',
      customerName,
      crop: season.crop,
      quantityBags: bags,
      pricePerBag: price,
      totalGrossRevenue: gross,
      freightCost: freight,
      commissionCost: commission,
      storageCost: storage,
      taxesCost: taxes,
      netRevenueRealized: net,
      contractType,
      date: new Date().toISOString().split('T')[0],
    };

    onAddSale(newSale);
    setIsModalOpen(false);
  };

  const totalGross = seasonSales.reduce((acc, s) => acc + (s.totalGrossRevenue || 0), 0);
  const totalNet = seasonSales.reduce((acc, s) => acc + (s.netRevenueRealized || 0), 0);
  const totalBags = seasonSales.reduce((acc, s) => acc + (s.quantityBags || 0), 0);

  return (
    <div className="space-y-5">
      {/* Unified 3-Metric Strip */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800">
          <div className="p-4">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium block">
              Total Sacas Comercializadas
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-1 block tabular-nums">
              {totalBags.toLocaleString('pt-BR')} sacas
            </span>
          </div>

          <div className="p-4">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium block">
              Receita Bruta Acumulada
            </span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block tabular-nums">
              R$ {totalGross.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="p-4">
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium block">
              Receita Líquida Realizada
            </span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 block tabular-nums">
              R$ {totalNet.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Contratos de Venda &amp; Comercialização
        </h3>

        <button
          type="button"
          onClick={openModal}
          className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Registrar Venda
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50/80 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-200/80 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3.5">Cliente / Comprador</th>
                <th className="py-3 px-3.5">Modalidade</th>
                <th className="py-3 px-3.5 text-center">Sacas</th>
                <th className="py-3 px-3.5 text-right">Preço / Saca</th>
                <th className="py-3 px-3.5 text-right">Receita Bruta</th>
                <th className="py-3 px-3.5 text-right">Deduções</th>
                <th className="py-3 px-3.5 text-right">Receita Líquida</th>
                <th className="py-3 px-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {seasonSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 dark:text-zinc-500">
                    Nenhuma venda registrada para esta safra.
                  </td>
                </tr>
              ) : (
                seasonSales.map((sale) => {
                  const deductions =
                    (sale.freightCost || 0) +
                    (sale.commissionCost || 0) +
                    (sale.storageCost || 0) +
                    (sale.taxesCost || 0);
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-950/40">
                      <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-zinc-100">
                        {sale.customerName}
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 dark:text-zinc-400">{sale.contractType}</td>
                      <td className="py-3 px-3.5 text-center font-medium tabular-nums">
                        {sale.quantityBags.toLocaleString('pt-BR')} sc
                      </td>
                      <td className="py-3 px-3.5 text-right tabular-nums">R$ {sale.pricePerBag.toFixed(2)}</td>
                      <td className="py-3 px-3.5 text-right font-medium text-slate-900 dark:text-zinc-100 tabular-nums">
                        R$ {sale.totalGrossRevenue.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-3.5 text-right text-rose-600 dark:text-rose-400 tabular-nums">
                        -R$ {deductions.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-3.5 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        R$ {sale.netRevenueRealized.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        {confirmDeleteId === sale.id ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteSale(sale.id);
                                setConfirmDeleteId(null);
                              }}
                              className="h-7 px-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium"
                            >
                              Excluir
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="h-7 px-2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[11px]"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(sale.id)}
                            aria-label="Excluir contrato"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal Venda */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-5 border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                Registrar Venda / Contrato Agrícola
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar modal"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Cliente / Trading / Cooperativa
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  placeholder="Ex: Cooperativa Agroindustrial"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Quantidade de Sacas
                  </label>
                  <input
                    type="number"
                    value={quantityBags}
                    onChange={(e) => setQuantityBags(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Preço por Saca (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricePerBag}
                    onChange={(e) => setPricePerBag(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Frete (R$)</label>
                  <input
                    type="number"
                    value={freightCost}
                    onChange={(e) => setFreightCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Impostos &amp; Taxas (R$)
                  </label>
                  <input
                    type="number"
                    value={taxesCost}
                    onChange={(e) => setTaxesCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Comissão (R$)</label>
                  <input
                    type="number"
                    value={commissionCost}
                    onChange={(e) => setCommissionCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Armazenagem (R$)</label>
                  <input
                    type="number"
                    value={storageCost}
                    onChange={(e) => setStorageCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Tipo de Contrato</label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as CommercializationRecord['contractType'])}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                >
                  <option value="Balcão">Venda a Balcão / Spot</option>
                  <option value="Mercado Futuro">Mercado Futuro</option>
                  <option value="Barter">Operação de Barter</option>
                  <option value="Contrato Físico">Contrato Físico a Termo</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Salvar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
