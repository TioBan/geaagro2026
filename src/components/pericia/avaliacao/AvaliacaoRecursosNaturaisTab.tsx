import React, { useState } from 'react';
import {
  Trees,
  Plus,
  Trash2,
  Sparkles,
  Download,
  Check,
  Eye,
  EyeOff,
  Droplets,
} from 'lucide-react';
import { PericiaAvaliacaoRecursoNatural, PericiaAvaliacaoImovel } from '../../../types/pericia';
import { createDefaultRecursosNaturais } from '../../../utils/periciaAvaliacaoComponentesUtils';

interface AvaliacaoRecursosNaturaisTabProps {
  avaliacao: PericiaAvaliacaoImovel;
  onUpdateAvaliacao: (updated: PericiaAvaliacaoImovel) => void;
  onShowNotification: (msg: string) => void;
}

export const AvaliacaoRecursosNaturaisTab: React.FC<AvaliacaoRecursosNaturaisTabProps> = ({
  avaliacao,
  onUpdateAvaliacao,
  onShowNotification,
}) => {
  const isEnabled = avaliacao.incluirRecursosNaturais !== false;
  const items: PericiaAvaliacaoRecursoNatural[] = avaliacao.recursosNaturais || [];

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<PericiaAvaliacaoRecursoNatural>>({
    tipoRecurso: 'Excedente de Reserva Legal (CRA / Servidão Ambiental)',
    descricaoLocalizacao: '',
    volumeOuAreaEstimada: '',
    situacaoLicenciamento: 'Inscrito no CAR / Regularizado',
    valorUnitarioBrl: 5000,
    valorTotalAvaliadoBrl: 500000,
    observacoes: '',
    incluirNoLaudo: true,
  });

  const handleToggleMaster = () => {
    const nextState = !isEnabled;
    onUpdateAvaliacao({
      ...avaliacao,
      incluirRecursosNaturais: nextState,
    });
    onShowNotification(
      nextState
        ? 'Componente Recursos Naturais ATIVADO para o laudo.'
        : 'Componente Recursos Naturais DESATIVADO do laudo.'
    );
  };

  const handleLoadDefaults = () => {
    const defaults = createDefaultRecursosNaturais();
    onUpdateAvaliacao({
      ...avaliacao,
      incluirRecursosNaturais: true,
      recursosNaturais: defaults,
    });
    onShowNotification(`${defaults.length} recursos naturais carregados!`);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.descricaoLocalizacao?.trim() || !formData.tipoRecurso) {
      alert('Informe o tipo de recurso e a descrição/localização.');
      return;
    }

    const newItem: PericiaAvaliacaoRecursoNatural = {
      id: `rec-${Date.now()}`,
      tipoRecurso: formData.tipoRecurso || 'Excedente de Reserva Legal',
      descricaoLocalizacao: formData.descricaoLocalizacao.trim(),
      volumeOuAreaEstimada: formData.volumeOuAreaEstimada || '',
      situacaoLicenciamento: formData.situacaoLicenciamento || '',
      valorUnitarioBrl: formData.valorUnitarioBrl ? Number(formData.valorUnitarioBrl) : undefined,
      valorTotalAvaliadoBrl: Number(formData.valorTotalAvaliadoBrl) || 0,
      observacoes: formData.observacoes || '',
      incluirNoLaudo: true,
    };

    onUpdateAvaliacao({
      ...avaliacao,
      recursosNaturais: [...items, newItem],
    });
    setShowForm(false);
    onShowNotification(`Recurso Natural "${newItem.tipoRecurso}" cadastrado!`);
  };

  const handleToggleItemInclusao = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, incluirNoLaudo: !item.incluirNoLaudo } : item
    );
    onUpdateAvaliacao({
      ...avaliacao,
      recursosNaturais: updated,
    });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Deseja excluir este recurso natural da avaliação?')) {
      const updated = items.filter(item => item.id !== id);
      onUpdateAvaliacao({
        ...avaliacao,
        recursosNaturais: updated,
      });
      onShowNotification('Recurso natural removido.');
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = [
      'Tipo_Recurso',
      'Descricao_Localizacao',
      'Volume_Area',
      'Situacao_Licenciamento',
      'Valor_Unitario_BRL',
      'Valor_Total_BRL',
      'Incluir_Laudo',
    ];
    const rows = items.map(r => [
      `"${r.tipoRecurso}"`,
      `"${r.descricaoLocalizacao.replace(/"/g, '""')}"`,
      `"${r.volumeOuAreaEstimada}"`,
      `"${r.situacaoLicenciamento || ''}"`,
      r.valorUnitarioBrl || '',
      r.valorTotalAvaliadoBrl,
      r.incluirNoLaudo ? 'SIM' : 'NAO',
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'avaliacao_recursos_naturais.csv';
    link.click();
    URL.revokeObjectURL(url);
    onShowNotification('Tabela de Recursos Naturais exportada em CSV.');
  };

  const activeItems = items.filter(r => r.incluirNoLaudo);
  const totalAvaliado = activeItems.reduce((acc, curr) => acc + (curr.valorTotalAvaliadoBrl || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Trees className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                5.2.7 Recursos Naturais e Potencialidades Ambientais
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                NBR 14653-3
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Excedente de Reserva Legal (CRA/Carbono), outorgas hídricas substanciais, florestas manejadas e jazidas minerais.
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
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Recurso</span>
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
            Valor Econômico dos Recursos
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {totalAvaliado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {activeItems.length} recursos inventariados
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Enquadramento Legal
          </span>
          <div className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-2">
            Código Florestal & Lei das Águas
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Lei Federal 12.651/12 e Lei 9.433/97
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Segurança Jurídica
          </span>
          <div className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-2">
            Condicionado a Licença / Outorga
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Vínculo registral no CAR e órgãos estaduais
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
              <Plus className="w-4 h-4 text-emerald-600" />
              Cadastrar Recurso Natural
            </h4>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Tipo de Recurso Natural *
              </label>
              <select
                value={formData.tipoRecurso}
                onChange={e => setFormData(prev => ({ ...prev, tipoRecurso: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="Excedente de Reserva Legal (CRA / Servidão Ambiental)">
                  Excedente de Reserva Legal (CRA / Servidão Ambiental)
                </option>
                <option value="Outorga de Captação Hídrica (Irrigação / Agroindústria)">
                  Outorga de Captação Hídrica (Irrigação / Agroindústria)
                </option>
                <option value="Jazida Mineral (Cascalho / Areia / Argila Licenciada)">
                  Jazida Mineral (Cascalho / Areia / Argila Licenciada)
                </option>
                <option value="Madeira Comercial em Pé / Manejo Florestal Sustentável">
                  Madeira Comercial em Pé / Manejo Florestal Sustentável
                </option>
                <option value="Créditos de Carbono / Pagamento por Serviços Ambientais (PSA)">
                  Créditos de Carbono / Pagamento por Serviços Ambientais (PSA)
                </option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Descrição e Localização no Imóvel *
              </label>
              <input
                type="text"
                placeholder="Ex: Maciço florestal preservado de Cerrado que excede o mínimo legal de 20%, nos talhões 12 e 14..."
                value={formData.descricaoLocalizacao || ''}
                onChange={e => setFormData(prev => ({ ...prev, descricaoLocalizacao: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Volume Cubado ou Área Estimada
              </label>
              <input
                type="text"
                placeholder="Ex: 145 hectares, 28.000 m³, 180 m³/h"
                value={formData.volumeOuAreaEstimada || ''}
                onChange={e => setFormData(prev => ({ ...prev, volumeOuAreaEstimada: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Situação do Licenciamento / Regularidade
              </label>
              <input
                type="text"
                placeholder="Ex: Inscrito no CAR, Portaria de Outorga ANA/Estadual, Licença de Operação"
                value={formData.situacaoLicenciamento || ''}
                onChange={e => setFormData(prev => ({ ...prev, situacaoLicenciamento: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Valor Total Avaliado (R$) *
              </label>
              <input
                type="number"
                placeholder="Ex: 550000"
                value={formData.valorTotalAvaliadoBrl || ''}
                onChange={e => setFormData(prev => ({ ...prev, valorTotalAvaliadoBrl: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-emerald-700 dark:text-emerald-400"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Recurso Natural</span>
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-150 dark:border-zinc-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            Relação de Recursos Naturais e Potencialidades ({items.length})
          </h4>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Trees className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Nenhum recurso natural cadastrado. Clique em "Amostras Típicas" para carregar excedente de reserva legal e outorgas hídricas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-[11px] font-bold uppercase">
                  <th className="p-3">Tipo de Recurso</th>
                  <th className="p-3">Descrição & Localização</th>
                  <th className="p-3">Volume / Área</th>
                  <th className="p-3">Licenciamento / Regularidade</th>
                  <th className="p-3 text-right">Valor Avaliado (R$)</th>
                  <th className="p-3 text-center">No Laudo</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map(r => (
                  <tr
                    key={r.id}
                    className={`border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors ${
                      !r.incluirNoLaudo ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-800 dark:text-zinc-200">
                      {r.tipoRecurso}
                    </td>
                    <td className="p-3 max-w-sm">
                      <p className="text-slate-900 dark:text-white font-medium line-clamp-2">
                        {r.descricaoLocalizacao}
                      </p>
                      {r.observacoes && (
                        <span className="text-[10px] text-slate-400 line-clamp-1">
                          {r.observacoes}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-700 dark:text-zinc-300">
                      {r.volumeOuAreaEstimada || '—'}
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {r.situacaoLicenciamento || 'Regular'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {r.valorTotalAvaliadoBrl.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleItemInclusao(r.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          r.incluirNoLaudo
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {r.incluirNoLaudo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(r.id)}
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
                    Subtotal Recursos Naturais Ativos:
                  </td>
                  <td className="p-3 text-right font-mono text-emerald-700 dark:text-emerald-400 text-base">
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
