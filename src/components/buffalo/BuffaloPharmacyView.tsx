import React, { useState } from 'react';
import { BuffaloPharmacyItem } from '../../types/buffalo';
import { INITIAL_BUFFALO_PHARMACY } from '../../data/buffaloData';
import {
  Pill,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Search,
  Calendar,
  Clock,
  DollarSign,
  PackageCheck,
  Building
} from 'lucide-react';

interface BuffaloPharmacyViewProps {
  pharmacy: BuffaloPharmacyItem[];
  onUpdatePharmacy: (items: BuffaloPharmacyItem[]) => void;
}

export const BuffaloPharmacyView: React.FC<BuffaloPharmacyViewProps> = ({
  pharmacy,
  onUpdatePharmacy
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = pharmacy.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStockValueBRL = pharmacy.reduce((acc, item) => acc + (item.stockQuantity * item.unitCostBRL), 0);
  const lowStockCount = pharmacy.filter(item => item.stockQuantity <= item.minimumStock).length;

  return (
    <div className="space-y-6">
      {/* Top Banner de Farmácia Veterinária */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total de Medicamentos &amp; Insumos</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{pharmacy.length}</div>
          <span className="text-xs text-teal-600 font-bold">Antibióticos, vacinas e hormônios</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Valor Total do Estoque Farmacêutico</span>
          <div className="text-3xl font-black text-emerald-600">
            R$ {totalStockValueBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-500">Avaliação contábil em tempo real</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Alertas de Estoque Mínimo</span>
          <div className={`text-3xl font-black ${lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-600'}`}>
            {lowStockCount}
          </div>
          <span className="text-xs text-slate-500">
            {lowStockCount > 0 ? 'Itens necessitam de reposição imediata' : 'Nível de estoque seguro'}
          </span>
        </div>
      </div>

      {/* Tabela de Medicamentos */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar medicamento por nome, princípio ativo ou lote..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Produto / Apresentação</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Estoque Atual</th>
                <th className="p-3">Custo Unitário</th>
                <th className="p-3">Carência Leite</th>
                <th className="p-3">Carência Carne</th>
                <th className="p-3">Validade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                    <span className="text-[11px] text-slate-500">Lote: {item.batchNumber} • {item.activeIngredient}</span>
                  </td>
                  <td className="p-3 font-semibold text-teal-600">{item.category}</td>
                  <td className="p-3 font-black">
                    <span className={item.stockQuantity <= item.minimumStock ? 'text-amber-600' : 'text-slate-900 dark:text-white'}>
                      {item.stockQuantity} {item.unit}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-emerald-600">R$ {item.unitCostBRL.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${item.milkWithdrawalDays === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {item.milkWithdrawalDays === 0 ? 'Zero dias' : `${item.milkWithdrawalDays} dias`}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-slate-700 dark:text-zinc-300 font-semibold">{item.meatWithdrawalDays} dias</span>
                  </td>
                  <td className="p-3 font-semibold text-slate-600 dark:text-zinc-400">{item.expirationDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
