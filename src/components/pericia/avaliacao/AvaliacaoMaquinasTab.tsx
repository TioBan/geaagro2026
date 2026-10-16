import React, { useState } from 'react';
import {
  Tractor,
  Plus,
  Trash2,
  Sparkles,
  Download,
  CheckCircle2,
  Check,
  Eye,
  EyeOff,
  Wrench,
} from 'lucide-react';
import { PericiaAvaliacaoMaquinaEquipamento, PericiaAvaliacaoImovel } from '../../../types/pericia';
import { createDefaultMaquinasEquipamentos } from '../../../utils/periciaAvaliacaoComponentesUtils';

interface AvaliacaoMaquinasTabProps {
  avaliacao: PericiaAvaliacaoImovel;
  onUpdateAvaliacao: (updated: PericiaAvaliacaoImovel) => void;
  onShowNotification: (msg: string) => void;
}

export const AvaliacaoMaquinasTab: React.FC<AvaliacaoMaquinasTabProps> = ({
  avaliacao,
  onUpdateAvaliacao,
  onShowNotification,
}) => {
  const isEnabled = avaliacao.incluirMaquinasEquipamentos !== false;
  const items: PericiaAvaliacaoMaquinaEquipamento[] = avaliacao.maquinasEquipamentos || [];

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<PericiaAvaliacaoMaquinaEquipamento>>({
    tipo: 'Trator de Pneus',
    marca: 'John Deere',
    modelo: '',
    anoFabricacao: new Date().getFullYear() - 3,
    potenciaCapacidade: '',
    horimetroOuUso: '',
    estadoConservacao: 'bom',
    valorNovoBrl: 800000,
    valorAtualMercadoBrl: 580000,
    observacoes: '',
    incluirNoLaudo: true,
  });

  const handleToggleMaster = () => {
    const nextState = !isEnabled;
    onUpdateAvaliacao({
      ...avaliacao,
      incluirMaquinasEquipamentos: nextState,
    });
    onShowNotification(
      nextState
        ? 'Componente Máquinas e Equipamentos ATIVADO para o laudo.'
        : 'Componente Máquinas e Equipamentos DESATIVADO do laudo.'
    );
  };

  const handleLoadDefaults = () => {
    const defaults = createDefaultMaquinasEquipamentos();
    onUpdateAvaliacao({
      ...avaliacao,
      incluirMaquinasEquipamentos: true,
      maquinasEquipamentos: defaults,
    });
    onShowNotification(`${defaults.length} máquinas e equipamentos carregados!`);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.modelo?.trim() || !formData.marca?.trim()) {
      alert('Informe a marca e o modelo da máquina/equipamento.');
      return;
    }

    const newItem: PericiaAvaliacaoMaquinaEquipamento = {
      id: `maq-${Date.now()}`,
      tipo: formData.tipo || 'Trator de Pneus',
      marca: formData.marca.trim(),
      modelo: formData.modelo.trim(),
      anoFabricacao: Number(formData.anoFabricacao) || new Date().getFullYear(),
      potenciaCapacidade: formData.potenciaCapacidade || '',
      horimetroOuUso: formData.horimetroOuUso || '',
      estadoConservacao: formData.estadoConservacao || 'bom',
      valorNovoBrl: Number(formData.valorNovoBrl) || 0,
      valorAtualMercadoBrl: Number(formData.valorAtualMercadoBrl) || 0,
      observacoes: formData.observacoes || '',
      incluirNoLaudo: true,
    };

    onUpdateAvaliacao({
      ...avaliacao,
      maquinasEquipamentos: [...items, newItem],
    });
    setShowForm(false);
    onShowNotification(`Máquina "${newItem.marca} ${newItem.modelo}" cadastrada!`);
  };

  const handleToggleItemInclusao = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, incluirNoLaudo: !item.incluirNoLaudo } : item
    );
    onUpdateAvaliacao({
      ...avaliacao,
      maquinasEquipamentos: updated,
    });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Deseja excluir este equipamento da avaliação?')) {
      const updated = items.filter(item => item.id !== id);
      onUpdateAvaliacao({
        ...avaliacao,
        maquinasEquipamentos: updated,
      });
      onShowNotification('Equipamento removido.');
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = [
      'Tipo',
      'Marca',
      'Modelo',
      'Ano',
      'Potencia_Capacidade',
      'Horimetro_Uso',
      'Estado',
      'Valor_Novo_BRL',
      'Valor_Mercado_BRL',
      'Incluir_Laudo',
    ];
    const rows = items.map(m => [
      `"${m.tipo}"`,
      `"${m.marca}"`,
      `"${m.modelo}"`,
      m.anoFabricacao,
      `"${m.potenciaCapacidade || ''}"`,
      `"${m.horimetroOuUso || ''}"`,
      `"${m.estadoConservacao}"`,
      m.valorNovoBrl,
      m.valorAtualMercadoBrl,
      m.incluirNoLaudo ? 'SIM' : 'NAO',
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'avaliacao_maquinas_equipamentos.csv';
    link.click();
    URL.revokeObjectURL(url);
    onShowNotification('Tabela de Máquinas exportada em CSV.');
  };

  const activeItems = items.filter(m => m.incluirNoLaudo);
  const totalMercado = activeItems.reduce((acc, curr) => acc + (curr.valorAtualMercadoBrl || 0), 0);
  const totalNovo = activeItems.reduce((acc, curr) => acc + (curr.valorNovoBrl || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                5.2.4 Máquinas, Equipamentos e Utilitários Agrícolas
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                NBR 14653-3
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Tratores, colheitadeiras, pivôs de irrigação, plantadeiras, implementos e conjuntos motobomba.
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
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Máquina</span>
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
            Valor Atual de Mercado
          </span>
          <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
            {totalMercado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {activeItems.length} máquinas ativas
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Valor de Novo Equivalente
          </span>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-zinc-200 mt-1">
            {totalNovo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Reposição a preço zero-km
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Índice Residual Médio
          </span>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {totalNovo > 0 ? `${((totalMercado / totalNovo) * 100).toFixed(1)}%` : '—'}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Retenção de valor patrimonial
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Critério Pericial
          </span>
          <div className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-2">
            Pesquisa de Mercado & Horímetro
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Tabelas FIPE Agro e Revendas
          </span>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <form
          onSubmit={handleAddItem}
          className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl p-5 space-y-4 text-xs animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 pb-2">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-blue-600" />
              Cadastrar Máquina / Equipamento Agrícola
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
                Tipo de Equipamento *
              </label>
              <select
                value={formData.tipo}
                onChange={e => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="Trator de Pneus">Trator de Pneus</option>
                <option value="Colheitadeira de Grãos">Colheitadeira de Grãos</option>
                <option value="Pulverizador Autopropelido">Pulverizador Autopropelido</option>
                <option value="Plantadeira / Semeadeira">Plantadeira / Semeadeira</option>
                <option value="Pivô Central de Irrigação">Pivô Central de Irrigação</option>
                <option value="Implemento / Grade / Subsolador">Implemento / Grade / Subsolador</option>
                <option value="Gerador / Conjunto Motobomba">Gerador / Conjunto Motobomba</option>
                <option value="Outro Equipamento">Outro Equipamento</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Marca / Fabricante *
              </label>
              <input
                type="text"
                placeholder="Ex: John Deere, Case IH, Massey Ferguson, Jacto, New Holland"
                value={formData.marca || ''}
                onChange={e => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Modelo *
              </label>
              <input
                type="text"
                placeholder="Ex: 7230J, Axial-Flow 7250, Uniport 3030"
                value={formData.modelo || ''}
                onChange={e => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Ano de Fabricação *
              </label>
              <input
                type="number"
                placeholder="Ex: 2021"
                value={formData.anoFabricacao || ''}
                onChange={e => setFormData(prev => ({ ...prev, anoFabricacao: parseInt(e.target.value) || 2020 }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Potência / Capacidade Operacional
              </label>
              <input
                type="text"
                placeholder="Ex: 230 cv, 35 pés, 3.000 L, 75 ha irrigados"
                value={formData.potenciaCapacidade || ''}
                onChange={e => setFormData(prev => ({ ...prev, potenciaCapacidade: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Horímetro / Estado de Uso
              </label>
              <input
                type="text"
                placeholder="Ex: 2.850 horas, Pouco uso"
                value={formData.horimetroOuUso || ''}
                onChange={e => setFormData(prev => ({ ...prev, horimetroOuUso: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Estado de Conservação
              </label>
              <select
                value={formData.estadoConservacao}
                onChange={e => setFormData(prev => ({ ...prev, estadoConservacao: e.target.value as any }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="excelente">Excelente (Como novo / Pouco uso)</option>
                <option value="bom">Bom (Operação normal / Manutenção em dia)</option>
                <option value="regular">Regular (Desgaste evidente / Requer reparos)</option>
                <option value="sucateado">Sucateado / Inoperante</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Valor Atual de Mercado (R$) *
              </label>
              <input
                type="number"
                step="1000"
                placeholder="Ex: 750000"
                value={formData.valorAtualMercadoBrl || ''}
                onChange={e => setFormData(prev => ({ ...prev, valorAtualMercadoBrl: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-blue-700 dark:text-blue-400"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Máquina</span>
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-150 dark:border-zinc-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            Parque de Máquinas e Equipamentos ({items.length})
          </h4>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Tractor className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma máquina cadastrada. Clique em "Amostras Típicas" para carregar tratores e colheitadeiras representativos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-[11px] font-bold uppercase">
                  <th className="p-3">Equipamento</th>
                  <th className="p-3">Marca & Modelo</th>
                  <th className="p-3 text-center">Ano</th>
                  <th className="p-3">Potência / Capacidade</th>
                  <th className="p-3">Horímetro / Conservação</th>
                  <th className="p-3 text-right">Valor Mercado (R$)</th>
                  <th className="p-3 text-center">No Laudo</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map(m => (
                  <tr
                    key={m.id}
                    className={`border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors ${
                      !m.incluirNoLaudo ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-800 dark:text-zinc-200">
                      {m.tipo}
                    </td>
                    <td className="p-3">
                      <strong className="block text-slate-900 dark:text-white">
                        {m.marca} {m.modelo}
                      </strong>
                      {m.observacoes && (
                        <span className="text-[10px] text-slate-400 line-clamp-1">
                          {m.observacoes}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center font-mono">{m.anoFabricacao}</td>
                    <td className="p-3 text-slate-600 dark:text-zinc-400">
                      {m.potenciaCapacidade || '—'}
                    </td>
                    <td className="p-3">
                      <span className="font-mono block text-slate-700 dark:text-zinc-300">
                        {m.horimetroOuUso || '—'}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {m.estadoConservacao}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-blue-700 dark:text-blue-400 text-sm">
                      {m.valorAtualMercadoBrl.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleItemInclusao(m.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          m.incluirNoLaudo
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                        title={m.incluirNoLaudo ? 'Incluído no laudo' : 'Oculto'}
                      >
                        {m.incluirNoLaudo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(m.id)}
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
                  <td colSpan={5} className="p-3 text-right uppercase text-[10px]">
                    Subtotal Máquinas & Equipamentos Ativos:
                  </td>
                  <td className="p-3 text-right font-mono text-blue-700 dark:text-blue-400 text-base">
                    {totalMercado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
