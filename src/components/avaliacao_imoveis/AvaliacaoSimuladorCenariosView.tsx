import React, { useState, useEffect, useRef } from 'react';
import { SimuladorCenarioMelhoria } from '../../types/avaliacaoImoveis';
import { Sparkles, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';

interface Props {
  simuladores: SimuladorCenarioMelhoria[];
  propriedadeId: string;
  valorAtualImovelR$: number;
  onSalvarSimuladores: (sims: SimuladorCenarioMelhoria[]) => void;
}

const inputCls =
  'w-full h-8 px-2.5 text-xs rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';

export const AvaliacaoSimuladorCenariosView: React.FC<Props> = ({
  simuladores,
  propriedadeId,
  valorAtualImovelR$,
  onSalvarSimuladores
}) => {
  const [lista, setLista] = useState<SimuladorCenarioMelhoria[]>([...simuladores]);
  const [sucesso, setSucesso] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLista([...simuladores]);
  }, [simuladores, propriedadeId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const recalcularSimulador = (sim: SimuladorCenarioMelhoria): SimuladorCenarioMelhoria => {
    const roi =
      sim.investimentoEstimadoR$ > 0
        ? ((sim.acrescimoValorMercadoEstimadoR$ - sim.investimentoEstimadoR$) /
            sim.investimentoEstimadoR$) *
          100
        : 0;

    return {
      ...sim,
      retornoSobreInvestimentoPct: Number(roi.toFixed(1))
    };
  };

  const handleUpdateSim = (
    id: string,
    patch: Partial<SimuladorCenarioMelhoria>,
    shouldRecalc = false
  ) => {
    setLista((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...patch };
        return shouldRecalc ? recalcularSimulador(merged) : merged;
      })
    );
  };

  const handleSalvar = () => {
    const recalcs = lista.map(recalcularSimulador);
    setLista(recalcs);
    onSalvarSimuladores(recalcs);
    setSucesso(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSucesso(false), 3000);
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
    setLista((prev) => [...prev, novo]);
  };

  const handleRemover = (id: string) => {
    setLista((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Barra Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Simulador de Cenários & Valorização Pós-Melhorias (CapEx)
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Projeção de retorno sobre investimento (ROI) e valorização com pivôs, silos e pastagens
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {sucesso && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mr-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Salvo
            </span>
          )}
          <button
            type="button"
            onClick={handleAdd}
            className="h-8 px-2.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/70 rounded-lg flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Cenário
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Salvar & Simular
          </button>
        </div>
      </div>

      {lista.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-1.5">
          <Sparkles className="w-6 h-6 text-slate-400 dark:text-zinc-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
            Nenhum cenário de melhoria cadastrado
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Clique em <strong>Novo Cenário</strong> para simular investimentos de CapEx e valorização.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lista.map((sim) => {
            const valorProjetadoImovel =
              valorAtualImovelR$ + sim.acrescimoValorMercadoEstimadoR$;

            return (
              <div
                key={sim.id}
                className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={sim.titulo}
                      placeholder="Título do cenário (ex: Implantação de Irrigação)"
                      onChange={(e) => handleUpdateSim(sim.id, { titulo: e.target.value })}
                      className={`${inputCls} font-semibold`}
                    />
                    <input
                      type="text"
                      value={sim.descricao}
                      placeholder="Descrição da melhoria ou investimento..."
                      onChange={(e) => handleUpdateSim(sim.id, { descricao: e.target.value })}
                      className="w-full h-8 px-2.5 text-xs rounded-md border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-700 dark:text-zinc-300 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemover(sim.id)}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                    title="Remover cenário"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase mb-1">
                    Categoria da Melhoria
                  </label>
                  <select
                    value={sim.tipoMelhoria}
                    onChange={(e) =>
                      handleUpdateSim(sim.id, {
                        tipoMelhoria: e.target.value as SimuladorCenarioMelhoria['tipoMelhoria']
                      })
                    }
                    className={inputCls}
                  >
                    <option value="irrigacao">Irrigação (Pivô / Gotejamento)</option>
                    <option value="armazem">Armazenagem / Silos</option>
                    <option value="fertilidade">Correção de Solo / Fertilidade</option>
                    <option value="pastagem">Reforma / Formação de Pastagem</option>
                    <option value="infraestrutura">Infraestrutura / Benfeitorias</option>
                    <option value="outros">Outros Investimentos</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase mb-1">
                      Investimento CapEx (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sim.investimentoEstimadoR$ || ''}
                      placeholder="0,00"
                      onChange={(e) =>
                        handleUpdateSim(
                          sim.id,
                          { investimentoEstimadoR$: parseFloat(e.target.value) || 0 },
                          true
                        )
                      }
                      className={`${inputCls} font-semibold tabular-nums`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase mb-1">
                      Acréscimo de Valor (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sim.acrescimoValorMercadoEstimadoR$ || ''}
                      placeholder="0,00"
                      onChange={(e) =>
                        handleUpdateSim(
                          sim.id,
                          { acrescimoValorMercadoEstimadoR$: parseFloat(e.target.value) || 0 },
                          true
                        )
                      }
                      className={`${inputCls} font-semibold tabular-nums text-emerald-700 dark:text-emerald-400`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase mb-1">
                      Prazo (Meses)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sim.prazoMeses || ''}
                      placeholder="0"
                      onChange={(e) =>
                        handleUpdateSim(sim.id, { prazoMeses: parseInt(e.target.value, 10) || 0 })
                      }
                      className={`${inputCls} tabular-nums`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase mb-1">
                      Ganho Produtivo (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={sim.incrementoProdutividadePct || ''}
                      placeholder="0"
                      onChange={(e) =>
                        handleUpdateSim(sim.id, {
                          incrementoProdutividadePct: parseFloat(e.target.value) || 0
                        })
                      }
                      className={`${inputCls} font-semibold tabular-nums text-sky-600 dark:text-sky-400`}
                    />
                  </div>
                </div>

                {/* Indicadores de Retorno */}
                <div className="p-3 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400 block">
                      ROI Estimado
                    </span>
                    <span
                      className={`text-lg font-bold tabular-nums ${
                        sim.retornoSobreInvestimentoPct < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {sim.retornoSobreInvestimentoPct > 0 ? '+' : ''}
                      {sim.retornoSobreInvestimentoPct}%
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-medium text-slate-500 dark:text-zinc-400 block">
                      Valor Projetado do Imóvel
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
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
