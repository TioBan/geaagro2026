import React, { useState } from 'react';
import {
  Building,
  Plus,
  Trash2,
  Sparkles,
  Download,
  Info,
  CheckCircle2,
  AlertTriangle,
  Home,
  Layers,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { PericiaAvaliacaoBenfeitoria, PericiaAvaliacaoImovel } from '../../../types/pericia';
import { createDefaultBenfeitorias } from '../../../utils/periciaAvaliacaoComponentesUtils';

interface AvaliacaoBenfeitoriasTabProps {
  avaliacao: PericiaAvaliacaoImovel;
  onUpdateAvaliacao: (updated: PericiaAvaliacaoImovel) => void;
  onShowNotification: (msg: string) => void;
}

export const AvaliacaoBenfeitoriasTab: React.FC<AvaliacaoBenfeitoriasTabProps> = ({
  avaliacao,
  onUpdateAvaliacao,
  onShowNotification,
}) => {
  const isEnabled = avaliacao.incluirBenfeitorias !== false;
  const items: PericiaAvaliacaoBenfeitoria[] = avaliacao.benfeitorias || [];

  // New item form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<PericiaAvaliacaoBenfeitoria>>({
    tipo: 'nao_reprodutiva',
    categoria: 'Edificações / Casas / Galpões',
    descricao: '',
    quantidade: 100,
    unidade: 'm²',
    padraoConstrutivo: 'Médio',
    idadeAnos: 5,
    vidaUtilAnos: 50,
    estadoConservacao: 'bom',
    custoNovoUnitarioBrl: 1500,
    fatorDepreciacao: 0.85,
    valorDepreciadoBrl: 127500,
    observacoes: '',
    incluirNoLaudo: true,
  });

  // Calculate depreciation dynamically on form change
  const handleFormChange = (fields: Partial<PericiaAvaliacaoBenfeitoria>) => {
    setFormData(prev => {
      const next = { ...prev, ...fields };
      const qtd = Number(next.quantidade) || 0;
      const custoNovo = Number(next.custoNovoUnitarioBrl) || 0;
      const fator = next.fatorDepreciacao !== undefined ? Number(next.fatorDepreciacao) : 0.85;
      const totalNovo = qtd * custoNovo;
      const depreciado = Math.round(totalNovo * fator);
      return {
        ...next,
        valorDepreciadoBrl: depreciado,
      };
    });
  };

  const handleToggleMaster = () => {
    const nextState = !isEnabled;
    onUpdateAvaliacao({
      ...avaliacao,
      incluirBenfeitorias: nextState,
    });
    onShowNotification(
      nextState
        ? 'Componente Benfeitorias ATIVADO para o laudo pericial.'
        : 'Componente Benfeitorias DESATIVADO do laudo pericial.'
    );
  };

  const handleLoadDefaults = () => {
    const defaults = createDefaultBenfeitorias();
    onUpdateAvaliacao({
      ...avaliacao,
      incluirBenfeitorias: true,
      benfeitorias: defaults,
    });
    onShowNotification(`${defaults.length} benfeitorias típicas carregadas com sucesso!`);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricao?.trim()) {
      alert('Informe a descrição da benfeitoria.');
      return;
    }

    const newItem: PericiaAvaliacaoBenfeitoria = {
      id: `benf-${Date.now()}`,
      tipo: formData.tipo || 'nao_reprodutiva',
      categoria: formData.categoria || 'Geral',
      descricao: formData.descricao.trim(),
      quantidade: Number(formData.quantidade) || 1,
      unidade: formData.unidade || 'unidade',
      padraoConstrutivo: formData.padraoConstrutivo || 'Médio',
      idadeAnos: formData.idadeAnos ? Number(formData.idadeAnos) : undefined,
      vidaUtilAnos: formData.vidaUtilAnos ? Number(formData.vidaUtilAnos) : undefined,
      estadoConservacao: formData.estadoConservacao || 'bom',
      custoNovoUnitarioBrl: Number(formData.custoNovoUnitarioBrl) || 0,
      fatorDepreciacao: formData.fatorDepreciacao ? Number(formData.fatorDepreciacao) : 0.85,
      valorDepreciadoBrl: Number(formData.valorDepreciadoBrl) || 0,
      observacoes: formData.observacoes || '',
      incluirNoLaudo: true,
    };

    onUpdateAvaliacao({
      ...avaliacao,
      benfeitorias: [...items, newItem],
    });
    setShowForm(false);
    onShowNotification(`Benfeitoria "${newItem.descricao}" cadastrada com sucesso!`);
  };

  const handleToggleItemInclusao = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, incluirNoLaudo: !item.incluirNoLaudo } : item
    );
    onUpdateAvaliacao({
      ...avaliacao,
      benfeitorias: updated,
    });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Deseja excluir esta benfeitoria da avaliação?')) {
      const updated = items.filter(item => item.id !== id);
      onUpdateAvaliacao({
        ...avaliacao,
        benfeitorias: updated,
      });
      onShowNotification('Benfeitoria removida.');
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = [
      'Tipo',
      'Categoria',
      'Descricao',
      'Quantidade',
      'Unidade',
      'Padrao',
      'Idade_Anos',
      'Estado',
      'Custo_Novo_Unitario_BRL',
      'Fator_Depreciacao',
      'Valor_Depreciado_BRL',
      'Incluir_Laudo',
    ];
    const rows = items.map(b => [
      `"${b.tipo}"`,
      `"${b.categoria}"`,
      `"${b.descricao.replace(/"/g, '""')}"`,
      b.quantidade,
      `"${b.unidade}"`,
      `"${b.padraoConstrutivo || ''}"`,
      b.idadeAnos || '',
      `"${b.estadoConservacao || ''}"`,
      b.custoNovoUnitarioBrl,
      b.fatorDepreciacao || '',
      b.valorDepreciadoBrl,
      b.incluirNoLaudo ? 'SIM' : 'NAO',
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'avaliacao_benfeitorias.csv';
    link.click();
    URL.revokeObjectURL(url);
    onShowNotification('Tabela de Benfeitorias exportada em CSV.');
  };

  // Metrics
  const activeItems = items.filter(b => b.incluirNoLaudo);
  const totalDepreciado = activeItems.reduce((acc, curr) => acc + (curr.valorDepreciadoBrl || 0), 0);
  const totalCustoNovo = activeItems.reduce(
    (acc, curr) => acc + (curr.quantidade * curr.custoNovoUnitarioBrl || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Toggle */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                5.2.3 Inventário e Valoração de Benfeitorias
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                NBR 14653-3
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Edificações, galpões, instalações zootécnicas, cercas, poços e pastagens formadas (Método do Custo de Reedição Depreciado - Ross-Heidecke).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Master Toggle Button */}
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
            <span>{isEnabled ? 'Incluído no Laudo Oficial' : 'Oculto / Não Incluído no Laudo'}</span>
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
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Benfeitoria</span>
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
            Total Depreciado (Valor Atual)
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {totalDepreciado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {activeItems.length} benfeitorias ativas
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Custo de Reedição Novo (CRN)
          </span>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-zinc-200 mt-1">
            {totalCustoNovo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Valor de reposição a novo
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Fator Médio de Depreciação
          </span>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {totalCustoNovo > 0 ? `${((totalDepreciado / totalCustoNovo) * 100).toFixed(1)}%` : '—'}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Estado e idade aparente
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Classificação NBR
          </span>
          <div className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-2">
            Reprodutivas & Não-Reprodutivas
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Art. 7º NBR 14653-3
          </span>
        </div>
      </div>

      {/* Add Item Form */}
      {showForm && (
        <form
          onSubmit={handleAddItem}
          className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl p-5 space-y-4 text-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Cadastrar Nova Benfeitoria
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
                Tipo de Benfeitoria *
              </label>
              <select
                value={formData.tipo}
                onChange={e => handleFormChange({ tipo: e.target.value as any })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="nao_reprodutiva">Não-Reprodutiva (Edificações / Obras / Instalações)</option>
                <option value="reprodutiva">Reprodutiva (Culturas Perenes / Pastagens Formadas)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Categoria *
              </label>
              <input
                type="text"
                placeholder="Ex: Casa Sede, Galpão, Curral, Silo, Cerca"
                value={formData.categoria || ''}
                onChange={e => handleFormChange({ categoria: e.target.value })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Dimensão / Quantidade *
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Ex: 350"
                value={formData.quantidade ?? ''}
                onChange={e => handleFormChange({ quantidade: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Unidade de Medida *
              </label>
              <select
                value={formData.unidade}
                onChange={e => handleFormChange({ unidade: e.target.value })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="m²">m² (Área Construída)</option>
                <option value="m linear">m linear (Cercas / Drenos)</option>
                <option value="unidade">unidade (Poço / Caixa / Silo)</option>
                <option value="ha">ha (Pastagem / Floresta)</option>
                <option value="km">km (Rede Elétrica / Estrada)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Descrição Detalhada e Especificações Construtivas *
              </label>
              <input
                type="text"
                placeholder="Ex: Alvenaria estrutural, piso cerâmico, cobertura metálica, forro de gesso..."
                value={formData.descricao || ''}
                onChange={e => handleFormChange({ descricao: e.target.value })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Padrão Construtivo
              </label>
              <select
                value={formData.padraoConstrutivo}
                onChange={e => handleFormChange({ padraoConstrutivo: e.target.value })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="Provisório">Provisório</option>
                <option value="Rústico">Rústico</option>
                <option value="Econômico">Econômico</option>
                <option value="Médio">Médio</option>
                <option value="Superior">Superior</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Estado de Conservação
              </label>
              <select
                value={formData.estadoConservacao}
                onChange={e => handleFormChange({ estadoConservacao: e.target.value as any })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="novo">Novo (100%)</option>
                <option value="bom">Bom / Muito Bem Conservado</option>
                <option value="regular">Regular / Reparos Simples</option>
                <option value="reparos_importantes">Reparos Importantes</option>
                <option value="sem_valor">Sem Valor Econômico Residual</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Custo de Reedição Novo Unitário (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Ex: 2200"
                value={formData.custoNovoUnitarioBrl ?? ''}
                onChange={e => handleFormChange({ custoNovoUnitarioBrl: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Fator Depreciação Residual (k)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                placeholder="Ex: 0.85"
                value={formData.fatorDepreciacao ?? 0.85}
                onChange={e => handleFormChange({ fatorDepreciacao: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Valor Depreciado Calculado (R$)
              </label>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                {(formData.valorDepreciadoBrl || 0).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Benfeitoria</span>
            </button>
          </div>
        </form>
      )}

      {/* Table of Items */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-150 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Relação de Benfeitorias Cadastradas ({items.length})
            </h4>
            <span className="text-[11px] text-slate-500">
              Método de custo de reprodução/reedição deduzida a depreciação física
            </span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Building className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma benfeitoria cadastrada. Clique em "Amostras Típicas" para carregar itens representativos ou cadastre manualmente.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-[11px] font-bold uppercase">
                  <th className="p-3">Categoria & Descrição</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Qtd / Dimensão</th>
                  <th className="p-3">Padrão / Estado</th>
                  <th className="p-3 text-right">Custo Novo (R$)</th>
                  <th className="p-3 text-center">Fator Deprec.</th>
                  <th className="p-3 text-right">Valor Atual (R$)</th>
                  <th className="p-3 text-center">No Laudo</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map(b => (
                  <tr
                    key={b.id}
                    className={`border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors ${
                      !b.incluirNoLaudo ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="p-3 max-w-xs">
                      <strong className="block text-slate-900 dark:text-white font-semibold">
                        {b.categoria}
                      </strong>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                        {b.descricao}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          b.tipo === 'reprodutiva'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {b.tipo === 'reprodutiva' ? 'Reprodutiva' : 'Não-Reprodutiva'}
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      {b.quantidade.toLocaleString('pt-BR')} {b.unidade}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                        {b.padraoConstrutivo || 'Médio'}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {b.estadoConservacao || 'bom'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-600 dark:text-zinc-400">
                      {(b.quantidade * b.custoNovoUnitarioBrl).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-amber-600">
                      {b.fatorDepreciacao ? `${Math.round(b.fatorDepreciacao * 100)}%` : '—'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {b.valorDepreciadoBrl.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleItemInclusao(b.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          b.incluirNoLaudo
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                        title={b.incluirNoLaudo ? 'Incluído no laudo' : 'Oculto do laudo'}
                      >
                        {b.incluirNoLaudo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(b.id)}
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
                  <td colSpan={4} className="p-3 text-right uppercase text-[10px]">
                    Subtotal de Benfeitorias Ativas:
                  </td>
                  <td className="p-3 text-right font-mono text-slate-600 dark:text-zinc-400">
                    {totalCustoNovo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-3 text-center font-mono text-amber-600">
                    {totalCustoNovo > 0 ? `${((totalDepreciado / totalCustoNovo) * 100).toFixed(1)}%` : '—'}
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400 text-base">
                    {totalDepreciado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
