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

const INPUT_CLASS =
  'w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';

const LABEL_CLASS =
  'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

const CATEGORIA_LABEL: Record<ItemCustoRecuperacao['categoria'], string> = {
  insumos: 'Insumos',
  maquinas_combustivel: 'Máquinas & Combustível',
  mao_de_obra: 'Mão de Obra',
  servicos_terceiros: 'Serviços de Terceiros',
  transporte: 'Frete & Transporte',
  manutencao_replantio: 'Manutenção & Replantio'
};

export const RecuperaCustosView: React.FC<Props> = ({
  areaAtiva,
  custos,
  onSalvarCustos
}) => {
  const custosDaArea = custos.filter(c => c.areaId === areaAtiva.id);
  const [salvo, dispararSalvo] = useTimedFlag(3000);
  const [confirmandoExcluirId, setConfirmandoExcluirId] = useState<string | null>(null);

  const [novoDescricao, setNovoDescricao] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<ItemCustoRecuperacao['categoria']>('insumos');
  const [novaQuantidade, setNovaQuantidade] = useState<number>(1);
  const [novaUnidade, setNovaUnidade] = useState('tonelada');
  const [novoValorUnitario, setNovoValorUnitario] = useState<number>(190);
  const [novoValorRealizado, setNovoValorRealizado] = useState<number>(0);

  const totalPrevisto = custosDaArea.reduce((acc, c) => acc + (c.valorTotalPrevistoR$ || 0), 0);
  const totalRealizado = custosDaArea.reduce((acc, c) => acc + (c.valorTotalRealizadoR$ || 0), 0);
  const custoPorHa = areaAtiva.areaHa > 0 ? totalPrevisto / areaAtiva.areaHa : 0;
  const pctExecutado = totalPrevisto > 0 ? Math.round((totalRealizado / totalPrevisto) * 100) : 0;

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
    setConfirmandoExcluirId(null);
  };

  const fmtMoeda = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800">
        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
          Fase 6 • Gestão Financeira & Orçamento
        </span>
        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 mt-0.5">
          <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate">Planilha Orçamentária & Custos: {areaAtiva.nomeTalhao}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Acompanhamento de orçamento previsto vs realizado, insumos, maquinário e investimento por hectare
        </p>
      </div>

      {salvo && (
        <div className="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Lançamento de custo registrado com sucesso.</span>
        </div>
      )}

      {/* Faixa Unificada de KPIs Financeiros */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
        <div className="p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
            Total Previsto / Orçado
          </span>
          <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-1">
            R$ {fmtMoeda(totalPrevisto)}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
            Para {areaAtiva.areaHa} hectares
          </span>
        </div>

        <div className="p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
            Total Executado / Pago
          </span>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums mt-1">
            R$ {fmtMoeda(totalRealizado)}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
            {pctExecutado}% executado
          </span>
        </div>

        <div className="p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
            Saldo a Investir
          </span>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-1">
            R$ {fmtMoeda(Math.max(0, totalPrevisto - totalRealizado))}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            Etapas pendentes
          </span>
        </div>

        <div className="p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">
            Custo Médio / Hectare
          </span>
          <p className="text-lg font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-1">
            R$ {fmtMoeda(custoPorHa)}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            Investimento unitário (R$/ha)
          </span>
        </div>
      </div>

      {/* Formulário de Novo Lançamento */}
      <form
        onSubmit={handleAdicionarCusto}
        className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800 space-y-3.5"
      >
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 border-b border-slate-200/70 dark:border-zinc-800 pb-2.5">
          <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Lançar Item de Despesa / Orçamento</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS}>Descrição do Item *</label>
            <input
              type="text"
              value={novoDescricao}
              onChange={e => setNovoDescricao(e.target.value)}
              placeholder="Ex: Calcário dolomítico a granel"
              required
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Categoria</label>
            <select
              value={novaCategoria}
              onChange={e => setNovaCategoria(e.target.value as ItemCustoRecuperacao['categoria'])}
              className={INPUT_CLASS}
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
            <label className={LABEL_CLASS}>Unidade</label>
            <input
              type="text"
              value={novaUnidade}
              onChange={e => setNovaUnidade(e.target.value)}
              placeholder="ton, kg, hora, dia"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={LABEL_CLASS}>Quantidade</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={novaQuantidade}
              onChange={e => setNovaQuantidade(parseFloat(e.target.value) || 0)}
              className={`${INPUT_CLASS} font-semibold tabular-nums`}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Valor Unitário (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={novoValorUnitario}
              onChange={e => setNovoValorUnitario(parseFloat(e.target.value) || 0)}
              className={`${INPUT_CLASS} font-semibold tabular-nums`}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Valor Realizado Pago (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={novoValorRealizado}
              onChange={e => setNovoValorRealizado(parseFloat(e.target.value) || 0)}
              className={`${INPUT_CLASS} tabular-nums`}
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Lançamento</span>
          </button>
        </div>
      </form>

      {/* Tabela de Itens de Custos */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800 space-y-3">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 border-b border-slate-200/70 dark:border-zinc-800 pb-2.5 tabular-nums">
          Itens Lançados ({custosDaArea.length})
        </h3>

        {custosDaArea.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400 dark:text-zinc-500">
            Nenhum custo lançado para este talhão ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[10px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="py-2 pr-3">Descrição</th>
                  <th className="py-2 px-3">Categoria</th>
                  <th className="py-2 px-3 text-right">Qtd</th>
                  <th className="py-2 px-3 text-right">Unitário</th>
                  <th className="py-2 px-3 text-right">Previsto</th>
                  <th className="py-2 px-3 text-right">Realizado</th>
                  <th className="py-2 pl-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {custosDaArea.map(c => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-zinc-100">
                      {c.descricao}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                      {CATEGORIA_LABEL[c.categoria] || c.categoria.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 dark:text-zinc-300 tabular-nums whitespace-nowrap">
                      {c.quantidade} {c.unidade}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 dark:text-zinc-300 tabular-nums whitespace-nowrap">
                      R$ {fmtMoeda(c.valorUnitarioR$)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums whitespace-nowrap">
                      R$ {fmtMoeda(c.valorTotalPrevistoR$)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                      R$ {fmtMoeda(c.valorTotalRealizadoR$)}
                    </td>
                    <td className="py-2.5 pl-3 text-right whitespace-nowrap">
                      {confirmandoExcluirId === c.id ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleRemoverCusto(c.id)}
                            className="h-6 px-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-medium transition"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmandoExcluirId(null)}
                            className="h-6 px-2 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-[10px] font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmandoExcluirId(c.id)}
                          title="Remover lançamento"
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
