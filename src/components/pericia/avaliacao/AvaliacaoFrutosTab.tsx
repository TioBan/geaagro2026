import React, { useState } from 'react';
import {
  Sprout,
  Plus,
  Trash2,
  Sparkles,
  Download,
  Check,
  Eye,
  EyeOff,
  Percent,
} from 'lucide-react';
import { PericiaAvaliacaoFruto, PericiaAvaliacaoImovel } from '../../../types/pericia';
import { createDefaultFrutos } from '../../../utils/periciaAvaliacaoComponentesUtils';

interface AvaliacaoFrutosTabProps {
  avaliacao: PericiaAvaliacaoImovel;
  onUpdateAvaliacao: (updated: PericiaAvaliacaoImovel) => void;
  onShowNotification: (msg: string) => void;
}

export const AvaliacaoFrutosTab: React.FC<AvaliacaoFrutosTabProps> = ({
  avaliacao,
  onUpdateAvaliacao,
  onShowNotification,
}) => {
  const isEnabled = avaliacao.incluirFrutos !== false;
  const items: PericiaAvaliacaoFruto[] = avaliacao.frutos || [];

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<PericiaAvaliacaoFruto>>({
    cultura: 'Soja em Grãos (Safra de Verão)',
    areaCultivadaHa: 300,
    estagioVegetativo: 'R5.2 (Enchimento de grãos - 80 DAE)',
    produtividadeEsperada: '65 sacas de 60 kg / ha',
    metodoAvaliacao: 'custo_investido_invertido',
    custoInvestidoAteDataBrl: 1950000,
    valorEsperadoColheitaBrl: 2500000,
    valorAvaliadoBrl: 2150000,
    observacoes: '',
    incluirNoLaudo: true,
  });

  const handleToggleMaster = () => {
    const nextState = !isEnabled;
    onUpdateAvaliacao({
      ...avaliacao,
      incluirFrutos: nextState,
    });
    onShowNotification(
      nextState
        ? 'Componente Frutos (Safras Pendentes) ATIVADO para o laudo.'
        : 'Componente Frutos DESATIVADO do laudo.'
    );
  };

  const handleLoadDefaults = () => {
    const defaults = createDefaultFrutos();
    onUpdateAvaliacao({
      ...avaliacao,
      incluirFrutos: true,
      frutos: defaults,
    });
    onShowNotification(`${defaults.length} lavouras/safras pendentes carregadas!`);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cultura?.trim() || !formData.areaCultivadaHa) {
      alert('Informe a cultura e a área cultivada em hectares.');
      return;
    }

    const newItem: PericiaAvaliacaoFruto = {
      id: `fruto-${Date.now()}`,
      cultura: formData.cultura.trim(),
      areaCultivadaHa: Number(formData.areaCultivadaHa) || 0,
      estagioVegetativo: formData.estagioVegetativo || '',
      produtividadeEsperada: formData.produtividadeEsperada || '',
      metodoAvaliacao: formData.metodoAvaliacao || 'custo_investido_invertido',
      custoInvestidoAteDataBrl: formData.custoInvestidoAteDataBrl ? Number(formData.custoInvestidoAteDataBrl) : undefined,
      valorEsperadoColheitaBrl: formData.valorEsperadoColheitaBrl ? Number(formData.valorEsperadoColheitaBrl) : undefined,
      valorAvaliadoBrl: Number(formData.valorAvaliadoBrl) || 0,
      observacoes: formData.observacoes || '',
      incluirNoLaudo: true,
    };

    onUpdateAvaliacao({
      ...avaliacao,
      frutos: [...items, newItem],
    });
    setShowForm(false);
    onShowNotification(`Safra/Cultura "${newItem.cultura}" cadastrada!`);
  };

  const handleToggleItemInclusao = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, incluirNoLaudo: !item.incluirNoLaudo } : item
    );
    onUpdateAvaliacao({
      ...avaliacao,
      frutos: updated,
    });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Deseja excluir esta cultura da avaliação?')) {
      const updated = items.filter(item => item.id !== id);
      onUpdateAvaliacao({
        ...avaliacao,
        frutos: updated,
      });
      onShowNotification('Cultura pendente removida.');
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = [
      'Cultura',
      'Area_ha',
      'Estagio_Vegetativo',
      'Produtividade_Esperada',
      'Metodo_Avaliacao',
      'Custo_Investido_BRL',
      'Valor_Esperado_BRL',
      'Valor_Avaliado_BRL',
      'Incluir_Laudo',
    ];
    const rows = items.map(f => [
      `"${f.cultura}"`,
      f.areaCultivadaHa,
      `"${f.estagioVegetativo}"`,
      `"${f.produtividadeEsperada}"`,
      `"${f.metodoAvaliacao}"`,
      f.custoInvestidoAteDataBrl || '',
      f.valorEsperadoColheitaBrl || '',
      f.valorAvaliadoBrl,
      f.incluirNoLaudo ? 'SIM' : 'NAO',
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'avaliacao_frutos_safras.csv';
    link.click();
    URL.revokeObjectURL(url);
    onShowNotification('Tabela de Frutos exportada em CSV.');
  };

  const activeItems = items.filter(f => f.incluirNoLaudo);
  const totalAvaliado = activeItems.reduce((acc, curr) => acc + (curr.valorAvaliadoBrl || 0), 0);
  const totalAreaHa = activeItems.reduce((acc, curr) => acc + (curr.areaCultivadaHa || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-lime-100 dark:bg-lime-950/60 text-lime-700 dark:text-lime-400 flex items-center justify-center font-bold">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                5.2.8 Frutos e Safras Pendentes (Lavouras Temporárias)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-300">
                NBR 14653-3
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Lavouras temporárias em desenvolvimento na data da perícia (soja, milho safrinha, algodão, cana) avaliadas por custo invertido ou renda futura esperada.
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
            className="px-3.5 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Cultura</span>
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
            Total dos Frutos Pendentes
          </span>
          <div className="text-xl font-bold font-mono text-lime-600 dark:text-lime-400 mt-1">
            {totalAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {activeItems.length} safras inventariadas
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Área Cultivada em Campo
          </span>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-zinc-200 mt-1">
            {totalAreaHa.toLocaleString('pt-BR')} ha
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Área com cultura em pé
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Valor Médio por Hectare
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {totalAreaHa > 0
              ? (totalAvaliado / totalAreaHa).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
              : 'R$ 0,00'}
            <span className="text-xs font-normal text-slate-400">/ha</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Custo invertido / valor presente
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Metodologia NBR 14653-3
          </span>
          <div className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-2">
            Custo Invertido & Renda
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Item 7.3 da norma de avaliação rural
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
              <Plus className="w-4 h-4 text-lime-600" />
              Cadastrar Cultura Pendente (Frutos)
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
                Cultura Agrícola *
              </label>
              <input
                type="text"
                placeholder="Ex: Soja Grão, Milho Safrinha, Algodão, Cana"
                value={formData.cultura || ''}
                onChange={e => setFormData(prev => ({ ...prev, cultura: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Área Cultivada (ha) *
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Ex: 350"
                value={formData.areaCultivadaHa || ''}
                onChange={e => setFormData(prev => ({ ...prev, areaCultivadaHa: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Estágio Vegetativo / Fenológico
              </label>
              <input
                type="text"
                placeholder="Ex: R5.2 Enchimento de grãos, V6, Maturação"
                value={formData.estagioVegetativo || ''}
                onChange={e => setFormData(prev => ({ ...prev, estagioVegetativo: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Produtividade Esperada
              </label>
              <input
                type="text"
                placeholder="Ex: 68 sc/ha, 110 sc/ha, 85 ton/ha"
                value={formData.produtividadeEsperada || ''}
                onChange={e => setFormData(prev => ({ ...prev, produtividadeEsperada: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Método de Avaliação
              </label>
              <select
                value={formData.metodoAvaliacao}
                onChange={e => setFormData(prev => ({ ...prev, metodoAvaliacao: e.target.value as any }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="custo_investido_invertido">Método do Custo Invertido (Gastos Aplicados)</option>
                <option value="fluxo_renda_descontada">Método da Renda (Receita Futura Descontada)</option>
                <option value="mercado_antecipado">Mercado Antecipado de Balcão</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Custo Investido até a Data (R$)
              </label>
              <input
                type="number"
                placeholder="Ex: 1800000"
                value={formData.custoInvestidoAteDataBrl || ''}
                onChange={e => setFormData(prev => ({ ...prev, custoInvestidoAteDataBrl: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Valor Esperado na Colheita (R$)
              </label>
              <input
                type="number"
                placeholder="Ex: 2600000"
                value={formData.valorEsperadoColheitaBrl || ''}
                onChange={e => setFormData(prev => ({ ...prev, valorEsperadoColheitaBrl: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Valor Pericial Apurado (R$) *
              </label>
              <input
                type="number"
                placeholder="Ex: 2100000"
                value={formData.valorAvaliadoBrl || ''}
                onChange={e => setFormData(prev => ({ ...prev, valorAvaliadoBrl: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-lime-700 dark:text-lime-400"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Cultura</span>
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-150 dark:border-zinc-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            Lavouras e Safras Pendentes em Campo ({items.length})
          </h4>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Sprout className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma safra pendente cadastrada. Clique em "Amostras Típicas" para carregar lavouras de soja ou milho safrinha.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-[11px] font-bold uppercase">
                  <th className="p-3">Cultura</th>
                  <th className="p-3 text-center">Área (ha)</th>
                  <th className="p-3">Estágio Fenológico</th>
                  <th className="p-3">Produtividade Esperada</th>
                  <th className="p-3">Método Adotado</th>
                  <th className="p-3 text-right">Valor Avaliado (R$)</th>
                  <th className="p-3 text-center">No Laudo</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map(f => (
                  <tr
                    key={f.id}
                    className={`border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors ${
                      !f.incluirNoLaudo ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">
                      {f.cultura}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-slate-800 dark:text-zinc-200">
                      {f.areaCultivadaHa.toLocaleString('pt-BR')} ha
                    </td>
                    <td className="p-3 text-slate-600 dark:text-zinc-400">
                      {f.estagioVegetativo || '—'}
                    </td>
                    <td className="p-3 font-mono text-slate-700 dark:text-zinc-300">
                      {f.produtividadeEsperada || '—'}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {f.metodoAvaliacao === 'custo_investido_invertido' ? 'Custo Invertido' : 'Renda Descontada'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-lime-700 dark:text-lime-400 text-sm">
                      {f.valorAvaliadoBrl.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleItemInclusao(f.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          f.incluirNoLaudo
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {f.incluirNoLaudo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(f.id)}
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
                  <td className="p-3 text-right uppercase text-[10px]">Total Cultivado:</td>
                  <td className="p-3 text-center font-mono text-slate-900 dark:text-white">
                    {totalAreaHa.toLocaleString('pt-BR')} ha
                  </td>
                  <td colSpan={3} className="p-3 text-right uppercase text-[10px]">
                    Subtotal Frutos Pendentes Ativos:
                  </td>
                  <td className="p-3 text-right font-mono text-lime-700 dark:text-lime-400 text-base">
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
