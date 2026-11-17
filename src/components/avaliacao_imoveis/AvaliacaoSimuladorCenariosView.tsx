import React, { useState, useEffect } from 'react';
import { SimuladorCenarioMelhoria } from '../../types/avaliacaoImoveis';
import {
  Sparkles,
  Plus,
  Trash2,
  Save,
  CheckCircle2
} from 'lucide-react';

interface Props {
  simuladores: SimuladorCenarioMelhoria[];
  propriedadeId: string;
  valorAtualImovelR$: number;
  onSalvarSimuladores: (sims: SimuladorCenarioMelhoria[]) => void;
}

export const AvaliacaoSimuladorCenariosView: React.FC<Props> = ({
  simuladores,
  propriedadeId,
  valorAtualImovelR$,
  onSalvarSimuladores
}) => {
  const [lista, setLista] = useState<SimuladorCenarioMelhoria[]>([...simuladores]);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    setLista([...simuladores]);
  }, [simuladores, propriedadeId]);

  const recalcularSimulador = (sim: SimuladorCenarioMelhoria): SimuladorCenarioMelhoria => {
    const roi =
      sim.investimentoEstimadoR$ > 0
        ? ((sim.acrescimoValorMercadoEstimadoR$ - sim.investimentoEstimadoR$) / sim.investimentoEstimadoR$) * 100
        : 0;

    return {
      ...sim,
      retornoSobreInvestimentoPct: Number(roi.toFixed(1))
    };
  };

  const handleSalvar = () => {
    const recalcs = lista.map(recalcularSimulador);
    setLista(recalcs);
    onSalvarSimuladores(recalcs);
    setSucesso(true);
    setTimeout(() => setSucesso(false), 3000);
  };

  const handleAdd = () => {
    const novo: SimuladorCenarioMelhoria = {
      id: `sim-${Date.now()}`,
      propriedadeId,
      titulo: '',
      descricao: '',
      tipoMelhoria: 'outros',
      investimentoEstimadoR$: 0,
      prazoMeses: 0,
      incrementoProdutividadePct: 0,
      acrescimoValorMercadoEstimadoR$: 0,
      retornoSobreInvestimentoPct: 0,
      premissasTecnicas: '',
      riscosAssociados: ''
    };
    setLista([...lista, novo]);
  };

  const handleRemover = (id: string) => {
    setLista(lista.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Simulador de Cenários & Valorização Pós-Melhorias (CapEx)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Projeção de retorno sobre investimento (ROI) e valorização do imóvel com pivôs, silos e pastagens
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sucesso && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mr-2">
              <CheckCircle2 className="w-4 h-4" /> Cenários salvos!
            </span>
          )}
          <button
            type="button"
            onClick={handleAdd}
            className="px-3 py-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Cenário
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Salvar & Simular
          </button>
        </div>
      </div>

      {/* Estado vazio */}
      {lista.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Nenhum cenário de melhoria cadastrado
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Clique em &quot;Novo Cenário&quot; para adicionar uma simulação de CapEx e valorização do imóvel.
          </p>
        </div>
      ) : (
        /* Grid de Cenários */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lista.map((sim, idx) => {
            const valorProjetadoImovel = valorAtualImovelR$ + sim.acrescimoValorMercadoEstimadoR$;

            return (
              <div
                key={sim.id}
                className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={sim.titulo}
                      placeholder="Título do cenário (ex: Implantação de Irrigação)"
                      onChange={(e) => {
                        const upd = [...lista];
                        upd[idx] = { ...upd[idx], titulo: e.target.value };
                        setLista(upd);
                      }}
                      className="w-full text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      type="text"
                      value={sim.descricao}
                      placeholder="Descrição da melhoria ou investimento..."
                      onChange={(e) => {
                        const upd = [...lista];
                        upd[idx] = { ...upd[idx], descricao: e.target.value };
                        setLista(upd);
                      }}
                      className="w-full text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemover(sim.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                    title="Remover cenário"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Tipo de Melhoria */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Categoria da Melhoria
                  </label>
                  <select
                    value={sim.tipoMelhoria}
                    onChange={(e) => {
                      const upd = [...lista];
                      upd[idx] = {
                        ...upd[idx],
                        tipoMelhoria: e.target.value as SimuladorCenarioMelhoria['tipoMelhoria']
                      };
                      setLista(upd);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="irrigacao">Irrigação (Pivô / Gotejamento)</option>
                    <option value="armazem">Armazenagem / Silos</option>
                    <option value="fertilidade">Correção de Solo / Fertilidade</option>
                    <option value="pastagem">Reforma / Formação de Pastagem</option>
                    <option value="infraestrutura">Infraestrutura / Benfeitorias</option>
                    <option value="outros">Outros Investimentos</option>
                  </select>
                </div>

                {/* Parâmetros do Cenário */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Investimento CapEx (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sim.investimentoEstimadoR$ || ''}
                      placeholder="0,00"
                      onChange={(e) => {
                        const upd = [...lista];
                        upd[idx] = {
                          ...upd[idx],
                          investimentoEstimadoR$: parseFloat(e.target.value) || 0
                        };
                        setLista(upd.map(recalcularSimulador));
                      }}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Acréscimo de Valor (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sim.acrescimoValorMercadoEstimadoR$ || ''}
                      placeholder="0,00"
                      onChange={(e) => {
                        const upd = [...lista];
                        upd[idx] = {
                          ...upd[idx],
                          acrescimoValorMercadoEstimadoR$: parseFloat(e.target.value) || 0
                        };
                        setLista(upd.map(recalcularSimulador));
                      }}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-emerald-600 dark:text-emerald-400 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Prazo de Implantação (Meses)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sim.prazoMeses || ''}
                      placeholder="0"
                      onChange={(e) => {
                        const upd = [...lista];
                        upd[idx] = {
                          ...upd[idx],
                          prazoMeses: parseInt(e.target.value, 10) || 0
                        };
                        setLista(upd);
                      }}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Ganho Produtivo (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={sim.incrementoProdutividadePct || ''}
                      placeholder="0"
                      onChange={(e) => {
                        const upd = [...lista];
                        upd[idx] = {
                          ...upd[idx],
                          incrementoProdutividadePct: parseFloat(e.target.value) || 0
                        };
                        setLista(upd);
                      }}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-blue-600 dark:text-blue-400 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Indicadores de Retorno */}
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                      Retorno sobre Investimento (ROI)
                    </span>
                    <span
                      className={`text-xl font-extrabold ${
                        sim.retornoSobreInvestimentoPct < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {sim.retornoSobreInvestimentoPct > 0 ? '+' : ''}
                      {sim.retornoSobreInvestimentoPct}%
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                      Valor Novo Estimado da Fazenda
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      R$ {valorProjetadoImovel.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
