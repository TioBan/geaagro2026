import React, { useState } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  Sparkles,
  Download,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { PericiaAvaliacaoDireito, PericiaAvaliacaoImovel } from '../../../types/pericia';
import { createDefaultDireitos } from '../../../utils/periciaAvaliacaoComponentesUtils';

interface AvaliacaoDireitosTabProps {
  avaliacao: PericiaAvaliacaoImovel;
  onUpdateAvaliacao: (updated: PericiaAvaliacaoImovel) => void;
  onShowNotification: (msg: string) => void;
}

export const AvaliacaoDireitosTab: React.FC<AvaliacaoDireitosTabProps> = ({
  avaliacao,
  onUpdateAvaliacao,
  onShowNotification,
}) => {
  const isEnabled = avaliacao.incluirDireitos !== false;
  const items: PericiaAvaliacaoDireito[] = avaliacao.direitos || [];

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<PericiaAvaliacaoDireito>>({
    tipoDireito: 'servidao_passagem',
    denominacao: '',
    titularOuConcessionaria: '',
    documentoRegistro: '',
    prazoVigencia: 'Perpétua',
    naturezaImpacto: 'negativo_gravame_desvalorizacao',
    valorAvaliadoBrl: 150000,
    detalhes: '',
    incluirNoLaudo: true,
  });

  const handleToggleMaster = () => {
    const nextState = !isEnabled;
    onUpdateAvaliacao({
      ...avaliacao,
      incluirDireitos: nextState,
    });
    onShowNotification(
      nextState
        ? 'Componente Direitos e Gravames ATIVADO para o laudo.'
        : 'Componente Direitos e Gravames DESATIVADO do laudo.'
    );
  };

  const handleLoadDefaults = () => {
    const defaults = createDefaultDireitos();
    onUpdateAvaliacao({
      ...avaliacao,
      incluirDireitos: true,
      direitos: defaults,
    });
    onShowNotification(`${defaults.length} direitos e gravames carregados!`);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.denominacao?.trim() || !formData.titularOuConcessionaria?.trim()) {
      alert('Informe a denominação do direito e o titular/concessionária.');
      return;
    }

    const newItem: PericiaAvaliacaoDireito = {
      id: `dir-${Date.now()}`,
      tipoDireito: formData.tipoDireito || 'servidao_passagem',
      denominacao: formData.denominacao.trim(),
      titularOuConcessionaria: formData.titularOuConcessionaria.trim(),
      documentoRegistro: formData.documentoRegistro || '',
      prazoVigencia: formData.prazoVigencia || '',
      naturezaImpacto: formData.naturezaImpacto || 'negativo_gravame_desvalorizacao',
      valorAvaliadoBrl: Number(formData.valorAvaliadoBrl) || 0,
      detalhes: formData.detalhes || '',
      incluirNoLaudo: true,
    };

    onUpdateAvaliacao({
      ...avaliacao,
      direitos: [...items, newItem],
    });
    setShowForm(false);
    onShowNotification(`Direito/Gravame "${newItem.denominacao}" cadastrado!`);
  };

  const handleToggleItemInclusao = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, incluirNoLaudo: !item.incluirNoLaudo } : item
    );
    onUpdateAvaliacao({
      ...avaliacao,
      direitos: updated,
    });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Deseja excluir este direito/gravame da avaliação?')) {
      const updated = items.filter(item => item.id !== id);
      onUpdateAvaliacao({
        ...avaliacao,
        direitos: updated,
      });
      onShowNotification('Direito/gravame removido.');
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = [
      'Tipo_Direito',
      'Denominacao',
      'Titular_Concessionaria',
      'Documento_Registro',
      'Prazo_Vigencia',
      'Natureza_Impacto',
      'Valor_Avaliado_BRL',
      'Incluir_Laudo',
    ];
    const rows = items.map(d => [
      `"${d.tipoDireito}"`,
      `"${d.denominacao.replace(/"/g, '""')}"`,
      `"${d.titularOuConcessionaria.replace(/"/g, '""')}"`,
      `"${d.documentoRegistro || ''}"`,
      `"${d.prazoVigencia || ''}"`,
      `"${d.naturezaImpacto}"`,
      d.valorAvaliadoBrl,
      d.incluirNoLaudo ? 'SIM' : 'NAO',
    ]);
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'avaliacao_direitos_gravames.csv';
    link.click();
    URL.revokeObjectURL(url);
    onShowNotification('Tabela de Direitos exportada em CSV.');
  };

  const activeItems = items.filter(d => d.incluirNoLaudo);
  let totalPositivo = 0;
  let totalNegativo = 0;
  activeItems.forEach(d => {
    if (d.naturezaImpacto === 'positivo_valorizacao') totalPositivo += d.valorAvaliadoBrl || 0;
    if (d.naturezaImpacto === 'negativo_gravame_desvalorizacao') totalNegativo += d.valorAvaliadoBrl || 0;
  });
  const saldoLiquido = totalPositivo - totalNegativo;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                5.2.9 Direitos, Servidões e Gravames Incidentes
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                NBR 14653-3
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Servidões administrativas de linhas de transmissão/minerodutos, contratos vigentes de arrendamento, concessões de lavra e gravames reais.
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
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Direito</span>
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
            Saldo Líquido dos Direitos
          </span>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              saldoLiquido >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {saldoLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Impacto líquido na avaliação
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Direitos Ativos (Soma)
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            +{totalPositivo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Arrendamentos e rendas
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-rose-600 block tracking-wider flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Gravames e Servidões (Abate)
          </span>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
            -{totalNegativo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Desvalorização por servidões
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Cadastrado
          </span>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-zinc-200 mt-1">
            {activeItems.length} registros
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Averbados na matrícula
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
              <Plus className="w-4 h-4 text-purple-600" />
              Cadastrar Direito ou Gravame
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
                Tipo de Direito / Ônus *
              </label>
              <select
                value={formData.tipoDireito}
                onChange={e => setFormData(prev => ({ ...prev, tipoDireito: e.target.value as any }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="servidao_passagem">Servidão de Passagem (Linha Elétrica / Duto)</option>
                <option value="contrato_arrendamento">Contrato de Arrendamento Rural Ativo</option>
                <option value="parceria_agricola">Parceria Agrícola / Meação</option>
                <option value="direito_minerario">Direito Minerário (ANM / Lavra)</option>
                <option value="outorga_hidrica">Outorga Hídrica Transmissível</option>
                <option value="posse_pacifica">Posse Mansa e Pacífica</option>
                <option value="comodato">Comodato Rural</option>
                <option value="outro">Outro Direito / Gravame</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Denominação e Identificação *
              </label>
              <input
                type="text"
                placeholder="Ex: Faixa de Servidão de Linha de Transmissão 500 kV, Contrato de Arrendamento Safra..."
                value={formData.denominacao || ''}
                onChange={e => setFormData(prev => ({ ...prev, denominacao: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Titular / Concessionária *
              </label>
              <input
                type="text"
                placeholder="Ex: Transmissora de Energia S.A., Arrendatário..."
                value={formData.titularOuConcessionaria || ''}
                onChange={e => setFormData(prev => ({ ...prev, titularOuConcessionaria: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Documento / Registro Cartorial
              </label>
              <input
                type="text"
                placeholder="Ex: Matrícula 14.820 / AV-08, Processo ANM..."
                value={formData.documentoRegistro || ''}
                onChange={e => setFormData(prev => ({ ...prev, documentoRegistro: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Prazo / Vigência
              </label>
              <input
                type="text"
                placeholder="Ex: Perpétua, 5 anos, Até safra 2028/29"
                value={formData.prazoVigencia || ''}
                onChange={e => setFormData(prev => ({ ...prev, prazoVigencia: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Natureza do Impacto Econômico *
              </label>
              <select
                value={formData.naturezaImpacto}
                onChange={e => setFormData(prev => ({ ...prev, naturezaImpacto: e.target.value as any }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
              >
                <option value="negativo_gravame_desvalorizacao">
                  Gravame / Desvalorização (Reduz o valor do imóvel)
                </option>
                <option value="positivo_valorizacao">
                  Direito Ativo / Renda (Agrega valor ao imóvel)
                </option>
                <option value="neutro_informativo">
                  Neutro / Informativo (Sem impacto financeiro direto)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Valor Avaliado / Indenizatório (R$) *
              </label>
              <input
                type="number"
                placeholder="Ex: 185000"
                value={formData.valorAvaliadoBrl || ''}
                onChange={e => setFormData(prev => ({ ...prev, valorAvaliadoBrl: parseFloat(e.target.value) || 0 }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-purple-700 dark:text-purple-400"
                required
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-slate-600 dark:text-zinc-300 font-semibold mb-1">
                Detalhes Técnicos e Fundamentação do Impacto
              </label>
              <input
                type="text"
                placeholder="Ex: Faixa de restrição de 45m de largura com impedimento de cultivo mecanizado ou instalação de pivô central..."
                value={formData.detalhes || ''}
                onChange={e => setFormData(prev => ({ ...prev, detalhes: e.target.value }))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Direito / Gravame</span>
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-150 dark:border-zinc-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            Direitos, Servidões e Gravames Registrados ({items.length})
          </h4>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <Scale className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Nenhum direito ou gravame cadastrado. Clique em "Amostras Típicas" para carregar servidões administrativas e contratos de arrendamento.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 text-[11px] font-bold uppercase">
                  <th className="p-3">Direito / Denominação</th>
                  <th className="p-3">Titular / Beneficiário</th>
                  <th className="p-3">Registro / Matrícula</th>
                  <th className="p-3">Vigência</th>
                  <th className="p-3">Impacto</th>
                  <th className="p-3 text-right">Valor Apurado (R$)</th>
                  <th className="p-3 text-center">No Laudo</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map(d => (
                  <tr
                    key={d.id}
                    className={`border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors ${
                      !d.incluirNoLaudo ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="p-3 max-w-xs">
                      <strong className="block text-slate-900 dark:text-white">
                        {d.denominacao}
                      </strong>
                      {d.detalhes && (
                        <span className="text-[10px] text-slate-400 line-clamp-1">
                          {d.detalhes}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-zinc-300">
                      {d.titularOuConcessionaria}
                    </td>
                    <td className="p-3 font-mono text-slate-600 dark:text-zinc-400">
                      {d.documentoRegistro || '—'}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-zinc-400">
                      {d.prazoVigencia || '—'}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          d.naturezaImpacto === 'positivo_valorizacao'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : d.naturezaImpacto === 'negativo_gravame_desvalorizacao'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        {d.naturezaImpacto === 'positivo_valorizacao'
                          ? '+ Agrega Valor'
                          : d.naturezaImpacto === 'negativo_gravame_desvalorizacao'
                          ? '- Gravame (Ônus)'
                          : 'Informativo'}
                      </span>
                    </td>
                    <td
                      className={`p-3 text-right font-mono font-bold text-sm ${
                        d.naturezaImpacto === 'positivo_valorizacao'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : d.naturezaImpacto === 'negativo_gravame_desvalorizacao'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {d.naturezaImpacto === 'negativo_gravame_desvalorizacao' ? '-' : '+'}
                      {d.valorAvaliadoBrl.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleItemInclusao(d.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          d.incluirNoLaudo
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {d.incluirNoLaudo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(d.id)}
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
                    Saldo Líquido de Direitos e Gravames:
                  </td>
                  <td
                    className={`p-3 text-right font-mono text-base ${
                      saldoLiquido >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {saldoLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
