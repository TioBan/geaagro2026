import React, { useState } from 'react';
import { AreaDegradadaItem, ItemCustoRecuperacao } from '../../types/recupera';
import { useTimedFlag } from './useTimedFlag';
import {
  DollarSign,
  Plus,
  Trash2,
  Save,
  CheckCircle2
} from 'lucide-react';

interface Props {
  areaAtiva: AreaDegradadaItem;
  custos: ItemCustoRecuperacao[];
  onSalvarCustos: (custosAtualizados: ItemCustoRecuperacao[]) => void;
}

export const RecuperaCustosView: React.FC<Props> = ({
  areaAtiva,
  custos,
  onSalvarCustos
}) => {
  const custosDaArea = custos.filter(c => c.areaId === areaAtiva.id);
  const [salvo, dispararSalvo] = useTimedFlag(3000);

  const [novoDescricao, setNovoDescricao] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<ItemCustoRecuperacao['categoria']>('insumos');
  const [novaQuantidade, setNovaQuantidade] = useState<number>(1);
  const [novaUnidade, setNovaUnidade] = useState('tonelada');
  const [novoValorUnitario, setNovoValorUnitario] = useState<number>(190);
  const [novoValorRealizado, setNovoValorRealizado] = useState<number>(0);

  const totalPrevisto = custosDaArea.reduce((acc, c) => acc + (c.valorTotalPrevistoR$ || 0), 0);
  const totalRealizado = custosDaArea.reduce((acc, c) => acc + (c.valorTotalRealizadoR$ || 0), 0);
  const custoPorHa = areaAtiva.areaHa > 0 ? totalPrevisto / areaAtiva.areaHa : 0;

  const handleAdicionarCusto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoDescricao.trim()) return;

    const totalItem = novaQuantidade * novoValorUnitario;
    const novo: ItemCustoRecuperacao = {
      id: `custo-${Date.now()}`,
      areaId: areaAtiva.id,
      projetoId: `proj-${areaAtiva.id}`,
      categoria: novaCategoria,
      descricao: novoDescricao.trim(),
      unidade: novaUnidade,
      quantidade: novaQuantidade,
      valorUnitarioR$: novoValorUnitario,
      valorTotalPrevistoR$: totalItem,
      valorTotalRealizadoR$: novoValorRealizado || totalItem,
      dataLancamento: new Date().toISOString().split('T')[0],
      statusPagamento: novoValorRealizado > 0 ? 'realizado' : 'pendente'
    };

    onSalvarCustos([...custos, novo]);
    setNovoDescricao('');
    dispararSalvo();
  };

  const handleRemoverCusto = (id: string) => {
    onSalvarCustos(custos.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Fase 6 • Gestão Financeira & Orçamento
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>Planilha Orçamentária & Custos de Recuperação: {areaAtiva.nomeTalhao}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhamento de orçamento previsto vs realizado, insumos, maquinário e investimento por hectare
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Custo Médio / Hectare</span>
            <strong className="text-emerald-700 dark:text-emerald-300 text-sm">R$ {custoPorHa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / ha</strong>
          </div>
        </div>
      </div>

      {salvo && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Lançamento de custo registrado com sucesso!</span>
        </div>
      )}

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Total Previsto / Orçado</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            R$ {totalPrevisto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400">Para {areaAtiva.areaHa} hectares</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Total Já Executado / Pago</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            R$ {totalRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {totalPrevisto > 0 ? ((totalRealizado / totalPrevisto) * 100).toFixed(0) : 0}% executado
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Saldo a Investir</span>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            R$ {Math.max(0, totalPrevisto - totalRealizado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-slate-400">Etapas pendentes</span>
        </div>
      </div>

      {/* Formulário de Novo Lançamento de Custo */}
      <form onSubmit={handleAdicionarCusto} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>Lançar Item de Despesa / Orçamento</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Descrição do Item *</label>
            <input
              type="text"
              value={novoDescricao}
              onChange={e => setNovoDescricao(e.target.value)}
              placeholder="Ex: Calcário dolomítico a granel"
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Categoria</label>
            <select
              value={novaCategoria}
              onChange={e => setNovaCategoria(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
            >
              <option value="insumos">Insumos (Adubos, Sementes, Corretivos)</option>
              <option value="maquinas_combustivel">Máquinas & Combustível</option>
              <option value="mao_de_obra">Mão de Obra (Homem-Dia)</option>
              <option value="servicos_terceiros">Serviços de Terceiros (Topografia, Análise)</option>
              <option value="transporte">Frete & Transporte</option>
              <option value="manutencao_replantio">Manutenção & Replantio</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Unidade</label>
            <input
              type="text"
              value={novaUnidade}
              onChange={e => setNovaUnidade(e.target.value)}
              placeholder="ton, kg, hora, dia"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Quantidade</label>
            <input
              type="number"
              step="0.01"
              value={novaQuantidade}
              onChange={e => setNovaQuantidade(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Valor Unitário (R$)</label>
            <input
              type="number"
              step="0.01"
              value={novoValorUnitario}
              onChange={e => setNovoValorUnitario(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Valor Realizado Pago (R$)</label>
            <input
              type="number"
              step="0.01"
              value={novoValorRealizado}
              onChange={e => setNovoValorRealizado(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Lançamento</span>
          </button>
        </div>
      </form>

      {/* Tabela de Itens de Custos */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
          Itens Lançados ({custosDaArea.length})
        </h3>

        {custosDaArea.length === 0 ? (
          <p className="text-center py-8 text-slate-400">Nenhum custo lançado para este talhão ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-[11px] text-slate-400 uppercase">
                  <th className="py-2">Descrição</th>
                  <th>Categoria</th>
                  <th>Qtd</th>
                  <th>Unitário</th>
                  <th>Previsto</th>
                  <th>Realizado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {custosDaArea.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-bold text-slate-900 dark:text-white">{c.descricao}</td>
                    <td className="capitalize text-slate-500">{c.categoria.replace('_', ' ')}</td>
                    <td>{c.quantidade} {c.unidade}</td>
                    <td>R$ {c.valorUnitarioR$.toFixed(2)}</td>
                    <td className="font-bold">R$ {c.valorTotalPrevistoR$.toFixed(2)}</td>
                    <td className="font-bold text-emerald-600">R$ {c.valorTotalRealizadoR$.toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleRemoverCusto(c.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
