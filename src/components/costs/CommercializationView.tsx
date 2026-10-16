import React, { useState } from 'react';
import { CommercializationRecord, PropertyCropSeason } from '../../types/costs';
import { Plus, DollarSign, TrendingUp, Truck, FileCheck, Trash2, Check, X } from 'lucide-react';

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

  const [customerName, setCustomerName] = useState('');
  const [quantityBags, setQuantityBags] = useState<number | ''>('');
  const [pricePerBag, setPricePerBag] = useState<number | ''>('');
  const [freightCost, setFreightCost] = useState<number | ''>(0);
  const [commissionCost, setCommissionCost] = useState<number | ''>(0);
  const [storageCost, setStorageCost] = useState<number | ''>(0);
  const [taxesCost, setTaxesCost] = useState<number | ''>(0);
  const [contractType, setContractType] = useState<any>('Mercado Futuro');

  const seasonSales = (sales || []).filter(s => s.seasonId === season.id);

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();
    const gross = Number(quantityBags) * Number(pricePerBag);
    const net = gross - (Number(freightCost) + Number(commissionCost) + Number(storageCost) + Number(taxesCost));

    const newSale: CommercializationRecord = {
      id: `sale-${Date.now()}`,
      seasonId: season.id,
      farmId: selectedFarmId || 'farm-1',
      customerName,
      crop: season.crop,
      quantityBags: Number(quantityBags),
      pricePerBag: Number(pricePerBag),
      totalGrossRevenue: gross,
      freightCost: Number(freightCost),
      commissionCost: Number(commissionCost),
      storageCost: Number(storageCost),
      taxesCost: Number(taxesCost),
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
    <div className="space-y-6">
      {/* Upper summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Total Sacas Comercializadas</span>
          <span className="text-2xl font-black text-slate-900 dark:text-zinc-100">{totalBags.toLocaleString('pt-BR')} sacas</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Receita Bruta Acumulada</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">R$ {totalGross.toLocaleString('pt-BR')}</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Receita Líquida Realizada</span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">R$ {totalNet.toLocaleString('pt-BR')}</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Contratos de Venda & Comercialização
        </h3>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Registrar Venda / Contrato
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Cliente / Comprador</th>
                <th className="p-3.5">Modalidade</th>
                <th className="p-3.5 text-center">Sacas</th>
                <th className="p-3.5 text-right">Preço / Saca</th>
                <th className="p-3.5 text-right">Receita Bruta</th>
                <th className="p-3.5 text-right">Deduções (Frete/Impostos)</th>
                <th className="p-3.5 text-right">Receita Líquida</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {seasonSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 italic">
                    Nenhuma venda registrada para esta safra.
                  </td>
                </tr>
              ) : (
                seasonSales.map((sale) => {
                  const deductions = (sale.freightCost || 0) + (sale.commissionCost || 0) + (sale.storageCost || 0) + (sale.taxesCost || 0);
                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-zinc-100">{sale.customerName}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded font-medium">
                          {sale.contractType}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold">{sale.quantityBags.toLocaleString('pt-BR')} sc</td>
                      <td className="p-3.5 text-right font-medium">R$ {sale.pricePerBag.toFixed(2)}</td>
                      <td className="p-3.5 text-right font-bold text-slate-900 dark:text-zinc-100">
                        R$ {sale.totalGrossRevenue.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-3.5 text-right text-rose-600 dark:text-rose-400 font-medium">
                        - R$ {deductions.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                        R$ {sale.netRevenueRealized.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-3.5 text-center">
                        <button onClick={() => onDeleteSale(sale.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 dark:border-zinc-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-4">Registrar Venda / Contrato Agrícola</h3>
            <form onSubmit={handleCreateSale} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Cliente / Tradings / Cooperativa</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Quantidade de Sacas</label>
                  <input
                    type="number"
                    value={quantityBags}
                    onChange={(e) => setQuantityBags(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Preço por Saca (R$)</label>
                  <input
                    type="number"
                    value={pricePerBag}
                    onChange={(e) => setPricePerBag(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Custo de Frete (R$)</label>
                  <input
                    type="number"
                    value={freightCost}
                    onChange={(e) => setFreightCost(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Impostos & Taxas (R$)</label>
                  <input
                    type="number"
                    value={taxesCost}
                    onChange={(e) => setTaxesCost(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Tipo de Contrato</label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                >
                  <option value="Balcão">Venda a Balcão / Spot</option>
                  <option value="Mercado Futuro">Mercado Futuro</option>
                  <option value="Barter">Operação de Barter</option>
                  <option value="Contrato Físico">Contrato Físico a Termo</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">Salvar Venda</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
