import React, { useState } from 'react';
import {
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  TANKMIX_PRODUCTS_DATABASE,
  COMPATIBILITY_RULES_DATABASE,
} from '../../data/tankMixData';
import { CompatibilityRule, CompatibilityRating } from '../../types/tankMix';

export const TankMixCompatibilityMatrixView: React.FC = () => {
  const [selectedProductA, setSelectedProductA] = useState<string>(TANKMIX_PRODUCTS_DATABASE[0]?.id || '');
  const [selectedProductB, setSelectedProductB] = useState<string>(TANKMIX_PRODUCTS_DATABASE[2]?.id || '');

  const prodA = (TANKMIX_PRODUCTS_DATABASE || []).find(p => p?.id === selectedProductA);
  const prodB = (TANKMIX_PRODUCTS_DATABASE || []).find(p => p?.id === selectedProductB);

  const pairRule = COMPATIBILITY_RULES_DATABASE.find(
    r =>
      (r.productAId === selectedProductA && r.productBId === selectedProductB) ||
      (r.productAId === selectedProductB && r.productBId === selectedProductA)
  );

  const matrixProducts = TANKMIX_PRODUCTS_DATABASE.slice(0, 10);

  const getCellRating = (idA: string, idB: string): { rating: CompatibilityRating; rule?: CompatibilityRule } => {
    if (idA === idB) return { rating: 'compativel' };
    const rule = COMPATIBILITY_RULES_DATABASE.find(
      r =>
        (r.productAId === idA && r.productBId === idB) ||
        (r.productAId === idB && r.productBId === idA)
    );
    if (rule) return { rating: rule.rating, rule };
    return { rating: 'compativel' };
  };

  const renderStatusLabel = (rating?: CompatibilityRating) => {
    if (rating === 'incompativel') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>Incompatível (não recomendada)</span>
        </span>
      );
    }
    if (rating === 'restricao_severa') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-700 dark:text-orange-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Restrição severa (antagonismo)</span>
        </span>
      );
    }
    if (rating === 'compativel_restricoes') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Compatível com cuidados</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <span>Compatível (sem restrições registradas)</span>
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
          Matriz de Compatibilidade de Defensivos
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Teste rápido par a par e visualização cruzada de interações físico-químicas e biológicas
        </p>
      </div>

      {/* Simulador Rápido Par a Par */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Verificação Rápida Par a Par
          </h3>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="matrix-prod-a"
              className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block mb-1"
            >
              Produto A
            </label>
            <select
              id="matrix-prod-a"
              value={selectedProductA}
              onChange={e => setSelectedProductA(e.target.value)}
              className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              {TANKMIX_PRODUCTS_DATABASE.map(p => (
                <option key={p.id} value={p.id}>
                  {p.commercialName} ({p.formulation} · {p.agrochemicalClass.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="matrix-prod-b"
              className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block mb-1"
            >
              Produto B
            </label>
            <select
              id="matrix-prod-b"
              value={selectedProductB}
              onChange={e => setSelectedProductB(e.target.value)}
              className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              {TANKMIX_PRODUCTS_DATABASE.map(p => (
                <option key={p.id} value={p.id}>
                  {p.commercialName} ({p.formulation} · {p.agrochemicalClass.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Diagnóstico da Mistura */}
        <div className="px-4 py-3.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs text-slate-600 dark:text-zinc-400">
              Mistura avaliada:{' '}
              <strong className="font-semibold text-slate-900 dark:text-zinc-100">
                {prodA?.commercialName} + {prodB?.commercialName}
              </strong>
            </div>
            <div>{renderStatusLabel(pairRule?.rating)}</div>
          </div>

          {pairRule ? (
            <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200/70 dark:border-zinc-800">
              <div className="font-semibold text-slate-900 dark:text-zinc-100">
                {pairRule.issueSummary}
              </div>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                {pairRule.technicalDetails}
              </p>
              <div className="text-slate-800 dark:text-zinc-200 pt-0.5">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  Recomendação agronômica:
                </span>{' '}
                {pairRule.recommendedAction}
              </div>
              {pairRule.scientificReference && (
                <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                  Referência: {pairRule.scientificReference}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Não há registro de incompatibilidade físico-química severa entre estes dois defensivos. Mantenha a ordem sequencial padrão (WALES) e agitação contínua durante o preparo.
            </p>
          )}
        </div>
      </div>

      {/* Tabela da Matriz 2D */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Matriz de Compatibilidade Cruzada
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Clique em qualquer célula para inspecionar os detalhes da interação acima
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/20 border border-emerald-500/60" />
              Compatível
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500/20 border border-amber-500/60" />
              Cuidados
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-orange-500/20 border border-orange-500/60" />
              Antagonismo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500/20 border border-rose-500/60" />
              Incompatível
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-950/60 border-b border-slate-200 dark:border-zinc-800">
                <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-zinc-300 sticky left-0 bg-slate-50 dark:bg-zinc-950 z-10 min-w-[160px] border-r border-slate-200 dark:border-zinc-800">
                  Produto
                </th>
                {matrixProducts.map(p => (
                  <th
                    key={p.id}
                    className="px-2 py-2 text-center font-medium text-slate-700 dark:text-zinc-300 min-w-[92px]"
                  >
                    <div className="truncate max-w-[88px] mx-auto" title={p.commercialName}>
                      {p.commercialName.split(' ')[0]}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 font-normal">
                      {p.formulation}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {matrixProducts.map(rowProd => (
                <tr key={rowProd.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                  <td className="px-3 py-2 sticky left-0 bg-white dark:bg-zinc-900 z-10 border-r border-slate-200 dark:border-zinc-800">
                    <div
                      className="font-medium text-slate-900 dark:text-zinc-100 truncate max-w-[148px]"
                      title={rowProd.commercialName}
                    >
                      {rowProd.commercialName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                      <span className="font-mono">{rowProd.formulation}</span> · {rowProd.agrochemicalClass.slice(0, 4)}
                    </div>
                  </td>

                  {matrixProducts.map(colProd => {
                    const { rating, rule } = getCellRating(rowProd.id, colProd.id);
                    const isSame = rowProd.id === colProd.id;
                    const isActivePair =
                      (rowProd.id === selectedProductA && colProd.id === selectedProductB) ||
                      (rowProd.id === selectedProductB && colProd.id === selectedProductA);

                    let cellClass =
                      'bg-emerald-50/60 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/50';
                    let cellLabel = 'OK';

                    if (isSame) {
                      cellClass = 'bg-slate-50 dark:bg-zinc-950/50 text-slate-300 dark:text-zinc-700';
                      cellLabel = '—';
                    } else if (rating === 'incompativel') {
                      cellClass =
                        'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-semibold hover:bg-rose-100 dark:hover:bg-rose-950/70';
                      cellLabel = 'Incomp.';
                    } else if (rating === 'restricao_severa') {
                      cellClass =
                        'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-semibold hover:bg-orange-100 dark:hover:bg-orange-950/70';
                      cellLabel = 'Antag.';
                    } else if (rating === 'compativel_restricoes') {
                      cellClass =
                        'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium hover:bg-amber-100 dark:hover:bg-amber-950/70';
                      cellLabel = 'Cuidado';
                    }

                    return (
                      <td
                        key={colProd.id}
                        onClick={() => {
                          if (!isSame) {
                            setSelectedProductA(rowProd.id);
                            setSelectedProductB(colProd.id);
                          }
                        }}
                        className={`px-2 py-2 text-center border-l border-slate-100 dark:border-zinc-800/80 text-[11px] transition-colors ${
                          isSame ? 'cursor-default' : 'cursor-pointer'
                        } ${cellClass} ${
                          isActivePair && !isSame ? 'ring-2 ring-inset ring-emerald-600 dark:ring-emerald-400' : ''
                        }`}
                        title={rule ? rule.issueSummary : isSame ? '' : 'Compatível'}
                      >
                        {cellLabel}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
