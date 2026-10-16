import React, { useState } from 'react';
import {
  Zap,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FlaskConical,
  Layers,
  Info,
  ShieldCheck,
} from 'lucide-react';
import {
  TANKMIX_PRODUCTS_DATABASE,
  COMPATIBILITY_RULES_DATABASE,
} from '../../data/tankMixData';
import { TankMixProduct, CompatibilityRule, CompatibilityRating } from '../../types/tankMix';

export const TankMixCompatibilityMatrixView: React.FC = () => {
  const [selectedProductA, setSelectedProductA] = useState<string>(TANKMIX_PRODUCTS_DATABASE[0]?.id || '');
  const [selectedProductB, setSelectedProductB] = useState<string>(TANKMIX_PRODUCTS_DATABASE[2]?.id || '');
  const [matrixFilterClass, setMatrixFilterClass] = useState<string>('todos');
  const [searchMatrix, setSearchMatrix] = useState<string>('');

  // Selected products for dual pair test
  const prodA = (TANKMIX_PRODUCTS_DATABASE || []).find(p => p?.id === selectedProductA);
  const prodB = (TANKMIX_PRODUCTS_DATABASE || []).find(p => p?.id === selectedProductB);

  // Find direct rule
  const pairRule = COMPATIBILITY_RULES_DATABASE.find(
    r =>
      (r.productAId === selectedProductA && r.productBId === selectedProductB) ||
      (r.productAId === selectedProductB && r.productBId === selectedProductA)
  );

  // Top products for matrix 2D preview
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Matriz 2D & Teste Par a Par
            </span>
            <span className="text-xs text-gray-500">• Base Científica de Interações</span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mt-1">Banco de Compatibilidade de Defensivos</h1>
        </div>
      </div>

      {/* Interactive Pair-to-Pair Simulator */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-base font-bold text-emerald-400 mb-1 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Simulador Rápido de Combinação Par a Par
        </h2>
        <p className="text-xs text-gray-300 mb-5">
          Selecione dois produtos para verificar instantaneamente a compatibilidade físico-química, antagonismo biológico e riscos de calda.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1">Produto A</label>
            <select
              value={selectedProductA}
              onChange={e => setSelectedProductA(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {TANKMIX_PRODUCTS_DATABASE.map(p => (
                <option key={p.id} value={p.id}>
                  {p.commercialName} ({p.formulation} - {p.agrochemicalClass})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-1">Produto B</label>
            <select
              value={selectedProductB}
              onChange={e => setSelectedProductB(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {TANKMIX_PRODUCTS_DATABASE.map(p => (
                <option key={p.id} value={p.id}>
                  {p.commercialName} ({p.formulation} - {p.agrochemicalClass})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dual Pair Evaluation Result Box */}
        <div className="mt-5 p-4 rounded-xl bg-gray-800/90 border border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-700 pb-3">
            <div>
              <span className="text-[11px] text-gray-400">Diagnóstico da Mistura:</span>
              <div className="text-sm font-bold text-white mt-0.5">
                {prodA?.commercialName} <span className="text-emerald-400">+</span> {prodB?.commercialName}
              </div>
            </div>

            <div>
              {pairRule ? (
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    pairRule.rating === 'incompativel'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                      : pairRule.rating === 'restricao_severa'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50'
                      : pairRule.rating === 'compativel_restricoes'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  }`}
                >
                  {pairRule.rating === 'incompativel'
                    ? '🔴 Incompatível (Não Recomendada)'
                    : pairRule.rating === 'restricao_severa'
                    ? '🟠 Restrição Severa (Antagonismo)'
                    : pairRule.rating === 'compativel_restricoes'
                    ? '🟡 Compatível com Cuidados'
                    : '🟢 Compatível (Excelente)'}
                </span>
              ) : (
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                  🟢 Compatível (Sem Restrições Registradas)
                </span>
              )}
            </div>
          </div>

          {pairRule ? (
            <div className="mt-3 space-y-2 text-xs">
              <div className="text-amber-300 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>{pairRule.issueSummary}</span>
              </div>
              <p className="text-gray-300 leading-relaxed">{pairRule.technicalDetails}</p>
              <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700/50">
                <span className="font-bold text-emerald-400">Recomendação Agronômica:</span>{' '}
                <span className="text-gray-200">{pairRule.recommendedAction}</span>
              </div>
              {pairRule.scientificReference && (
                <div className="text-[11px] text-gray-400 italic">
                  Referência: {pairRule.scientificReference}
                </div>
              )}
            </div>
          ) : (
            <p className="mt-3 text-xs text-gray-300 leading-relaxed">
              Não há registro de incompatibilidade físico-química severa entre estes dois defensivos no banco de dados. Recomenda-se manter a ordem sequencial padrão (WALES) e agitação contínua durante o preparo.
            </p>
          )}
        </div>
      </div>

      {/* 2D Cross Matrix Table */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Matriz de Compatibilidade Cruzada</h2>
            <p className="text-xs text-gray-500">Visualização de interações entre os principais defensivos agrícolas</p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Compatível
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Cuidados / Sequência
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Antagonismo
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Incompatível
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-2.5 text-left font-bold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[150px]">
                  Produto
                </th>
                {matrixProducts.map(p => (
                  <th key={p.id} className="p-2.5 text-center font-bold text-gray-700 min-w-[110px]">
                    <div className="truncate max-w-[100px]" title={p.commercialName}>
                      {p.commercialName.split(' ')[0]}
                    </div>
                    <span className="text-[10px] text-gray-400 font-normal">({p.formulation})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {matrixProducts.map((rowProd, rIdx) => (
                <tr key={rowProd.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-2.5 font-bold text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-100">
                    <div className="truncate max-w-[140px]" title={rowProd.commercialName}>
                      {rowProd.commercialName}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-normal">
                      {rowProd.formulation} • {rowProd.agrochemicalClass.slice(0, 4)}
                    </span>
                  </td>

                  {matrixProducts.map((colProd, cIdx) => {
                    const { rating, rule } = getCellRating(rowProd.id, colProd.id);

                    let bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    let iconText = '🟢';
                    if (rowProd.id === colProd.id) {
                      bgClass = 'bg-gray-100 text-gray-400 border-gray-200';
                      iconText = '—';
                    } else if (rating === 'incompativel') {
                      bgClass = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
                      iconText = '🔴';
                    } else if (rating === 'restricao_severa') {
                      bgClass = 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
                      iconText = '🟠';
                    } else if (rating === 'compativel_restricoes') {
                      bgClass = 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
                      iconText = '🟡';
                    }

                    return (
                      <td
                        key={colProd.id}
                        onClick={() => {
                          setSelectedProductA(rowProd.id);
                          setSelectedProductB(colProd.id);
                        }}
                        className={`p-2 text-center cursor-pointer transition-all border border-gray-100 hover:scale-105 ${bgClass}`}
                        title={rule ? rule.issueSummary : 'Compatível'}
                      >
                        <div className="flex items-center justify-center gap-1 font-mono">
                          <span>{iconText}</span>
                        </div>
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
