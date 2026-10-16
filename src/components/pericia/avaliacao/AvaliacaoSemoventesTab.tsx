import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Download,
  Check,
  Eye,
  EyeOff,
  Tag,
} from 'lucide-react';
import { PericiaAvaliacaoSemovente, PericiaAvaliacaoImovel } from '../../../types/pericia';
import { createDefaultSemoventes } from '../../../utils/periciaAvaliacaoComponentesUtils';

interface AvaliacaoSemoventesTabProps {
  avaliacao: PericiaAvaliacaoImovel;
  onUpdateAvaliacao: (updated: PericiaAvaliacaoImovel) => void;
  onShowNotification: (msg: string) => void;
}

export const AvaliacaoSemoventesTab: React.FC<AvaliacaoSemoventesTabProps> = ({
  avaliacao,
  onUpdateAvaliacao,
  onShowNotification,
}) => {
  const isEnabled = avaliacao.incluirSemoventes !== false;
  const items: PericiaAvaliacaoSemovente[] = avaliacao.semoventes || [];

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<PericiaAvaliacaoSemovente>>({
    especie: 'Bovino de Corte',
    categoria: 'Matrizes / Vacas Nelore Paridas',
    raca: 'Nelore',
    quantidadeCabecas: 100,
    pesoMedioKgOuArrobas: '450 kg (15 @)',
    valorUnitarioCabecaBrl: 4000,
    valorTotalBrl: 400000,
    finalidadeZootecnica: 'Cria comercial',
    observacoes: '',
    incluirNoLaudo: true,
  });

  const handleFormChange = (fields: Partial<PericiaAvaliacaoSemovente>) => {
    setFormData(prev => {
      const next = { ...prev, ...fields };
      const qtd = Number(next.quantidadeCabecas) || 0;
      const unit = Number(next.valorUnitarioCabecaBrl) || 0;
      return {
        ...next,
        valorTotalBrl: Math.round(qtd * unit),
      };
    });
  };

  const handleToggleMaster = () => {
    const nextState = !isEnabled;
    onUpdateAvaliacao({
      ...avaliacao,
      incluirSemoventes: nextState,
    });
    onShowNotification(
      nextState
        ? 'Componente Semoventes ATIVADO para o laudo.'
        : 'Componente Semoventes DESATIVADO do laudo.'
    );
  };

  const handleLoadDefaults = () => {
    const defaults = createDefaultSemoventes();
    onUpdateAvaliacao({
      ...avaliacao,
      incluirSemoventes: true,
      semoventes: defaults,
    });
    onShowNotification(`${defaults.length} lotes de semoventes carregados!`);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoria?.trim() || !formData.quantidadeCabecas) {
      alert('Informe a categoria e a quantidade de cabeças.');
      return;
    }

    const newItem: PericiaAvaliacaoSemovente = {
      id: `sem-${Date.now()}`,
      especie: formData.especie || 'Bovino',
      categoria: formData.categoria.trim(),
      raca: formData.raca || 'Nelore',
      quantidadeCabecas: Number(formData.quantidadeCabecas) || 1,
      pesoMedioKgOuArrobas: formData.pesoMedioKgOuArrobas || '',
      valorUnitarioCabecaBrl: Number(formData.valorUnitarioCabecaBrl) || 0,
      valorTotalBrl: Number(formData.valorTotalBrl) || 0,
      finalidadeZootecnica: formData.finalidadeZootecnica || '',
      observacoes: formData.observacoes || '',
      incluirNoLaudo: true,
    };

    onUpdateAvaliacao({
      ...avaliacao,
      semoventes: [...items, newItem],
    });
    setShowForm(false);
    onShowNotification(`Lote de semoventes "${newItem.categoria}" cadastrado!`);
  };

  const handleToggleItemInclusao = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, incluirNoLaudo: !item.incluirNoLaudo } : item
    );
    onUpdateAvaliacao({
      ...avaliacao,
      semoventes: updated,
    });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Deseja excluir este lote de semoventes?')) {
      const updated = items.filter(item => item.id !== id);
      onUpdateAvaliacao({
        ...avaliacao,
        semoventes: updated,
      });
      onShowNotification('Lote de semoventes removido.');
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = [
      'Especie',
      'Categoria',
      'Raca',
      'Cabecas',
      'Peso_Medio',
      'Valor_Unitario_Cabeca_BRL',
      'Valor_Total_BRL',
      'Finalidade',
      'Incluir_Laudo',
    ];
    const rows = items.map(s => [
      `"${s.especie}"`,
      `"${s.categoria}"`,
      `"${s.raca}"`,
      s.quantidadeCabecas,
      `"${s.pesoMedioKgOuArrobas || ''}"`,
      s.valorUnitarioCabecaBrl,
      s.valorTotalBrl,
      `"${s.finalidadeZootecnica || ''}"`,
      s.incluirNoLaudo ? 'SIM' : 'NAO',
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'avaliacao_semoventes.csv';
    link.click();
    URL.revokeObjectURL(url);
    onShowNotification('Tabela de Semoventes exportada em CSV.');
  };

  const activeItems = items.filter(s => s.incluirNoLaudo);
  const totalAvaliado = activeItems.reduce((acc, curr) => acc + (curr.valorTotalBrl || 0), 0);
  const totalCabecas = activeItems.reduce((acc, curr) => acc + (curr.quantidadeCabecas || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                5.2.6 Semoventes e Rebanhos da Propriedade
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                NBR 14653-3
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Plantel de gado de corte/leite, matrizes, reprodutores PO, bezerros, equinos de lida e ovinos.
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
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Lote</span>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Valor Total do Rebanho
          </span>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {totalAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {activeItems.length} lotes ativos no laudo
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total de Cabeças
          </span>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-zinc-200 mt-1">
            {totalCabecas.toLocaleString('pt-BR')} cab.
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Censo zootécnico pericial
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Média Ponderada / Cabeça
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {totalCabecas > 0
              ? (totalAvaliado / totalCabecas).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
              : 'R$ 0,00'}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Por animal inventariado
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Base da Cotação
          </span>
          <div className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-2">
            CEPEA / Scot Consultoria
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Cotação regional da arroba / lote
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
              <Plus className="w-4 h-4 text-amber-600" />
              Cadastrar Lote de Semoventes
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
                Espécie *
              </label>
              <select
                value={formData.especie}
                onChange={e => handleFormChange({ especie: e.target.value })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="Bovino de Corte">Bovino de Corte</option>
                <option value="Bovino de Leite">Bovino de Leite</option>
                <option value="Equino">Equino</option>
                <option value="Ovino">Ovino</option>
                <option value="Caprino">Caprino</option>
                <option value="Suíno">Suíno</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Categoria Zootécnica *
              </label>
              <input
                type="text"
                placeholder="Ex: Matrizes Nelore, Bezerros, Novilhas, Touros PO"
                value={formData.categoria || ''}
                onChange={e => handleFormChange({ categoria: e.target.value })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Raça / Cruzamento *
              </label>
              <input
                type="text"
                placeholder="Ex: Nelore, Angus, Girolando, Quarto de Milha"
                value={formData.raca || ''}
                onChange={e => handleFormChange({ raca: e.target.value })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Quantidade de Cabeças *
              </label>
              <input
                type="number"
                placeholder="Ex: 120"
                value={formData.quantidadeCabecas || ''}
                onChange={e => handleFormChange({ quantidadeCabecas: parseInt(e.target.value) || 0 })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Peso Médio / Idade
              </label>
              <input
                type="text"
                placeholder="Ex: 480 kg (16 @), 8 meses"
                value={formData.pesoMedioKgOuArrobas || ''}
                onChange={e => handleFormChange({ pesoMedioKgOuArrobas: e.target.value })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Finalidade Zootécnica
              </label>
              <input
                type="text"
                placeholder="Ex: Cria, Recria, Engorda, Genética PO, Lida"
                value={formData.finalidadeZootecnica || ''}
                onChange={e => handleFormChange({ finalidadeZootecnica: e.target.value })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Valor Unitário por Cabeça (R$) *
              </label>
              <input
                type="number"
                step="50"
                placeholder="Ex: 4200"
                value={formData.valorUnitarioCabecaBrl || ''}
                onChange={e => handleFormChange({ valorUnitarioCabecaBrl: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Valor Total do Lote (R$)
              </label>
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 rounded-xl font-mono font-bold text-amber-800 dark:text-amber-300 text-sm">
                {(formData.valorTotalBrl || 0).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Lote de Semoventes</span>
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-150 dark:border-zinc-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            Inventário do Plantel e Lotes de Semoventes ({items.length})
          </h4>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Tag className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Nenhum lote de semoventes cadastrado. Clique em "Amostras Típicas" para carregar matrizes e reprodutores.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-[11px] font-bold uppercase">
                  <th className="p-3">Categoria & Raça</th>
                  <th className="p-3">Espécie</th>
                  <th className="p-3 text-center">Cabeças</th>
                  <th className="p-3">Peso / Estágio</th>
                  <th className="p-3">Aptidão</th>
                  <th className="p-3 text-right">Unitário (R$/cab)</th>
                  <th className="p-3 text-right">Total (R$)</th>
                  <th className="p-3 text-center">No Laudo</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map(s => (
                  <tr
                    key={s.id}
                    className={`border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors ${
                      !s.incluirNoLaudo ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="p-3">
                      <strong className="block text-slate-900 dark:text-white">
                        {s.categoria}
                      </strong>
                      <span className="text-[11px] text-slate-500">Raça: {s.raca}</span>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-zinc-300">{s.especie}</td>
                    <td className="p-3 text-center font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {s.quantidadeCabecas.toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-zinc-400">
                      {s.pesoMedioKgOuArrobas || '—'}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-zinc-400">
                      {s.finalidadeZootecnica || '—'}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700 dark:text-zinc-300">
                      {s.valorUnitarioCabecaBrl.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-amber-700 dark:text-amber-400 text-sm">
                      {s.valorTotalBrl.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleItemInclusao(s.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          s.incluirNoLaudo
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {s.incluirNoLaudo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(s.id)}
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
                  <td colSpan={2} className="p-3 text-right uppercase text-[10px]">
                    Subtotal Semoventes Ativos:
                  </td>
                  <td className="p-3 text-center font-mono text-slate-900 dark:text-white">
                    {totalCabecas.toLocaleString('pt-BR')} cab.
                  </td>
                  <td colSpan={3} />
                  <td className="p-3 text-right font-mono text-amber-700 dark:text-amber-400 text-base">
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
