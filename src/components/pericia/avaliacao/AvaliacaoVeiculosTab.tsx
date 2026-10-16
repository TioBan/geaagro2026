import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Trash2,
  Sparkles,
  Download,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PericiaAvaliacaoVeiculo, PericiaAvaliacaoImovel } from '../../../types/pericia';
import { createDefaultVeiculos } from '../../../utils/periciaAvaliacaoComponentesUtils';

interface AvaliacaoVeiculosTabProps {
  avaliacao: PericiaAvaliacaoImovel;
  onUpdateAvaliacao: (updated: PericiaAvaliacaoImovel) => void;
  onShowNotification: (msg: string) => void;
}

export const AvaliacaoVeiculosTab: React.FC<AvaliacaoVeiculosTabProps> = ({
  avaliacao,
  onUpdateAvaliacao,
  onShowNotification,
}) => {
  const isEnabled = avaliacao.incluirVeiculos !== false;
  const items: PericiaAvaliacaoVeiculo[] = avaliacao.veiculos || [];

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<PericiaAvaliacaoVeiculo>>({
    tipo: 'Camionete 4x4',
    marca: 'Toyota',
    modelo: 'Hilux CD 4x4 Diesel',
    anoModelo: '2022/2023',
    placaOuChassi: '',
    combustivel: 'Diesel S10',
    quilometragemOuEstado: '70.000 km',
    referenciaFipeBrl: 230000,
    valorAvaliadoBrl: 220000,
    observacoes: '',
    incluirNoLaudo: true,
  });

  const handleToggleMaster = () => {
    const nextState = !isEnabled;
    onUpdateAvaliacao({
      ...avaliacao,
      incluirVeiculos: nextState,
    });
    onShowNotification(
      nextState
        ? 'Componente Veículos ATIVADO para o laudo.'
        : 'Componente Veículos DESATIVADO do laudo.'
    );
  };

  const handleLoadDefaults = () => {
    const defaults = createDefaultVeiculos();
    onUpdateAvaliacao({
      ...avaliacao,
      incluirVeiculos: true,
      veiculos: defaults,
    });
    onShowNotification(`${defaults.length} veículos carregados!`);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.modelo?.trim() || !formData.marca?.trim()) {
      alert('Informe a marca e o modelo do veículo.');
      return;
    }

    const newItem: PericiaAvaliacaoVeiculo = {
      id: `veic-${Date.now()}`,
      tipo: formData.tipo || 'Utilitário',
      marca: formData.marca.trim(),
      modelo: formData.modelo.trim(),
      anoModelo: formData.anoModelo || '2022/2023',
      placaOuChassi: formData.placaOuChassi || '',
      combustivel: formData.combustivel || 'Diesel',
      quilometragemOuEstado: formData.quilometragemOuEstado || '',
      referenciaFipeBrl: formData.referenciaFipeBrl ? Number(formData.referenciaFipeBrl) : undefined,
      valorAvaliadoBrl: Number(formData.valorAvaliadoBrl) || 0,
      observacoes: formData.observacoes || '',
      incluirNoLaudo: true,
    };

    onUpdateAvaliacao({
      ...avaliacao,
      veiculos: [...items, newItem],
    });
    setShowForm(false);
    onShowNotification(`Veículo "${newItem.marca} ${newItem.modelo}" cadastrado!`);
  };

  const handleToggleItemInclusao = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, incluirNoLaudo: !item.incluirNoLaudo } : item
    );
    onUpdateAvaliacao({
      ...avaliacao,
      veiculos: updated,
    });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Deseja excluir este veículo da avaliação?')) {
      const updated = items.filter(item => item.id !== id);
      onUpdateAvaliacao({
        ...avaliacao,
        veiculos: updated,
      });
      onShowNotification('Veículo removido.');
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = [
      'Tipo',
      'Marca',
      'Modelo',
      'Ano_Modelo',
      'Placa',
      'Combustivel',
      'Quilometragem_Estado',
      'Fipe_BRL',
      'Valor_Avaliado_BRL',
      'Incluir_Laudo',
    ];
    const rows = items.map(v => [
      `"${v.tipo}"`,
      `"${v.marca}"`,
      `"${v.modelo}"`,
      `"${v.anoModelo}"`,
      `"${v.placaOuChassi || ''}"`,
      `"${v.combustivel || ''}"`,
      `"${v.quilometragemOuEstado || ''}"`,
      v.referenciaFipeBrl || '',
      v.valorAvaliadoBrl,
      v.incluirNoLaudo ? 'SIM' : 'NAO',
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'avaliacao_veiculos.csv';
    link.click();
    URL.revokeObjectURL(url);
    onShowNotification('Tabela de Veículos exportada em CSV.');
  };

  const activeItems = items.filter(v => v.incluirNoLaudo);
  const totalAvaliado = activeItems.reduce((acc, curr) => acc + (curr.valorAvaliadoBrl || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                5.2.5 Veículos e Frota Operacional do Imóvel
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                NBR 14653-3
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Caminhões de escoamento, caminhonetes 4x4, utilitários, carretas agrícolas e motocicletas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleToggleMaster}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isEnabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
            }`}
          >
            {isEnabled ? <Check className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>{isEnabled ? 'Incluído no Laudo Oficial' : 'Oculto / Não Incluído'}</span>
          </button>

          <button
            type="button"
            onClick={handleLoadDefaults}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Amostras Típicas</span>
          </button>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Veículo</span>
          </button>

          {items.length > 0 && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Exportar CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total da Frota Avaliada
          </span>
          <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
            {totalAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {activeItems.length} veículos ativos no laudo
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Valor Médio por Unidade
          </span>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-zinc-200 mt-1">
            {activeItems.length > 0
              ? (totalAvaliado / activeItems.length).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
              : 'R$ 0,00'}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Média da frota operacional
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Parâmetro Mercadológico
          </span>
          <div className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-2">
            Tabela FIPE & Vistoria Física
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Ajuste pelo estado de conservação
          </span>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleAddItem}
          className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl p-5 space-y-4 text-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-indigo-600" />
              Cadastrar Veículo
            </h4>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Tipo de Veículo *
              </label>
              <select
                value={formData.tipo}
                onChange={e => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="Camionete 4x4">Camionete 4x4</option>
                <option value="Caminhão Graneleiro / Boiadeiro">Caminhão Graneleiro / Boiadeiro</option>
                <option value="Utilitário de Campo">Utilitário de Campo</option>
                <option value="Motocicleta de Lida">Motocicleta de Lida</option>
                <option value="Carreta Agrícola">Carreta Agrícola / Reboque</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Marca *
              </label>
              <input
                type="text"
                placeholder="Ex: Toyota, Volvo, Fiat, Honda, Scania"
                value={formData.marca || ''}
                onChange={e => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Modelo e Versão *
              </label>
              <input
                type="text"
                placeholder="Ex: Hilux SRX 2.8 4x4, FH 540 6x4, Strada 1.4"
                value={formData.modelo || ''}
                onChange={e => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Ano de Fabricação / Modelo *
              </label>
              <input
                type="text"
                placeholder="Ex: 2022/2023"
                value={formData.anoModelo || ''}
                onChange={e => setFormData(prev => ({ ...prev, anoModelo: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Placa ou Chassi
              </label>
              <input
                type="text"
                placeholder="Ex: BRA-2E19"
                value={formData.placaOuChassi || ''}
                onChange={e => setFormData(prev => ({ ...prev, placaOuChassi: e.target.value.toUpperCase() }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Quilometragem / Estado de Uso
              </label>
              <input
                type="text"
                placeholder="Ex: 75.000 km, Bom estado"
                value={formData.quilometragemOuEstado || ''}
                onChange={e => setFormData(prev => ({ ...prev, quilometragemOuEstado: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Valor Referência FIPE (R$)
              </label>
              <input
                type="number"
                placeholder="Ex: 235000"
                value={formData.referenciaFipeBrl || ''}
                onChange={e => setFormData(prev => ({ ...prev, referenciaFipeBrl: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Valor Pericial Adotado (R$) *
              </label>
              <input
                type="number"
                placeholder="Ex: 228000"
                value={formData.valorAvaliadoBrl || ''}
                onChange={e => setFormData(prev => ({ ...prev, valorAvaliadoBrl: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-indigo-700 dark:text-indigo-400"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Veículo</span>
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-150 dark:border-zinc-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            Frota e Veículos Cadastrados ({items.length})
          </h4>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Truck className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Nenhum veículo cadastrado. Clique em "Amostras Típicas" para carregar caminhões e camionetes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-[11px] font-bold uppercase">
                  <th className="p-3">Veículo</th>
                  <th className="p-3">Marca & Modelo</th>
                  <th className="p-3 text-center">Ano/Modelo</th>
                  <th className="p-3 text-center">Placa</th>
                  <th className="p-3">Km / Estado</th>
                  <th className="p-3 text-right">Ref. FIPE (R$)</th>
                  <th className="p-3 text-right">Valor Avaliado (R$)</th>
                  <th className="p-3 text-center">No Laudo</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map(v => (
                  <tr
                    key={v.id}
                    className={`border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors ${
                      !v.incluirNoLaudo ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-800 dark:text-zinc-200">
                      {v.tipo}
                    </td>
                    <td className="p-3">
                      <strong className="block text-slate-900 dark:text-white">
                        {v.marca} {v.modelo}
                      </strong>
                      {v.observacoes && (
                        <span className="text-[10px] text-slate-400 line-clamp-1">
                          {v.observacoes}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono">{v.anoModelo}</td>
                    <td className="p-3 text-center font-mono font-bold text-slate-700 dark:text-zinc-300">
                      {v.placaOuChassi || '—'}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-zinc-400">
                      {v.quilometragemOuEstado || '—'}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-500">
                      {v.referenciaFipeBrl
                        ? v.referenciaFipeBrl.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })
                        : '—'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-indigo-700 dark:text-indigo-400 text-sm">
                      {v.valorAvaliadoBrl.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleItemInclusao(v.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          v.incluirNoLaudo
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {v.incluirNoLaudo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(v.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-all cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 dark:bg-zinc-800/90 font-bold text-slate-900 dark:text-white border-t border-slate-300 dark:border-zinc-700">
                  <td colSpan={6} className="p-3 text-right uppercase text-[10px]">
                    Subtotal Veículos Ativos:
                  </td>
                  <td className="p-3 text-right font-mono text-indigo-700 dark:text-indigo-400 text-base">
                    {totalAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
