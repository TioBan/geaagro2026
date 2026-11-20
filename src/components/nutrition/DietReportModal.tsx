import React, { useMemo } from 'react';
import { DietFormulation, FeedIngredient } from '../../types/animalNutrition';
import { getIngredientCategoryLabel, getSpeciesLabel } from './nutritionConstants';
import { Printer, X, Layers } from 'lucide-react';

interface Props {
  diet: DietFormulation;
  ingredients: FeedIngredient[];
  onClose: () => void;
}

export const DietReportModal: React.FC<Props> = ({ diet, ingredients, onClose }) => {
  const ingredientsMap = useMemo(
    () => new Map<string, FeedIngredient>((ingredients || []).filter((i) => i && i.id).map((i) => [i.id, i])),
    [ingredients]
  );

  const totalInclusionPctMs = useMemo(
    () => (diet.items || []).reduce((sum, it) => sum + (it.inclusionPctMs || 0), 0),
    [diet.items]
  );

  const itemBatchRows = useMemo(() => {
    return (diet.items || []).map((it) => {
      const ing = ingredientsMap.get(it.ingredientId);
      const basePrice = ing?.pricePerKg ?? 0;
      const freightPerKg = (ing?.freightPerTon ?? 0) / 1000;
      const opFactor = 1 + (ing?.operationalCostPct ?? 0) / 100;
      const effectivePriceMn = (basePrice + freightPerKg) * opFactor;
      const batchItemCost = (it.inclusionKgBatch || 0) * effectivePriceMn;
      return {
        item: it,
        ing,
        batchItemCost,
      };
    });
  }, [diet.items, ingredientsMap]);

  const computedTotalBatchCost = useMemo(() => {
    if (diet.costs?.costPerBatch && diet.costs.costPerBatch > 0) {
      return diet.costs.costPerBatch;
    }
    return itemBatchRows.reduce((sum, row) => sum + row.batchItemCost, 0);
  }, [diet.costs?.costPerBatch, itemBatchRows]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:static print:bg-white print:p-0">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-4xl w-full shadow-lg my-6 overflow-hidden print:my-0 print:border-none print:shadow-none print:rounded-none print:bg-white print:text-black">
        {/* Toolbar (hidden on print) */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              Relatório Técnico & Ordem de Batelada
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Documento pronto para impressão A4 e envio ao operador do vagão
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar relatório"
              className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-5 sm:p-6 space-y-5 text-slate-800 dark:text-slate-200 print:p-0 print:text-black">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 dark:border-slate-800 print:border-slate-900 pb-4 gap-3">
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 print:text-emerald-800">
                GeaAgro · Nutrição Animal & Formulação
              </p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white print:text-black mt-0.5">
                {diet.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 print:text-slate-700 mt-0.5">
                Espécie: <strong className="text-slate-900 dark:text-slate-100 print:text-black">{getSpeciesLabel(diet.species)}</strong>
                {' · '}Categoria: {diet.category}
                {' · '}Lote: <span className="tabular-nums font-medium">{diet.animalCount}</span> animais
              </p>
            </div>

            <div className="sm:text-right text-xs">
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-600 block">Data de emissão</span>
              <strong className="text-slate-900 dark:text-white print:text-black tabular-nums">
                {new Date(diet.updatedAt || diet.createdAt).toLocaleDateString('pt-BR')}
              </strong>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 mt-0.5 tabular-nums">
                Versão {diet.version}.0 · NRC 2001 / BR-CORTE
              </span>
            </div>
          </div>

          {/* Executive KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-200 dark:border-slate-800 print:border-slate-300 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 print:divide-slate-300">
            <div className="p-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 block">Consumo Alvo MS</span>
              <strong className="text-sm font-semibold text-slate-900 dark:text-white print:text-black tabular-nums mt-0.5 block">
                {diet.totalDmiKgPerAnimal.toFixed(1)} kg MS/cab/d
              </strong>
            </div>
            <div className="p-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 block">Consumo In Natura</span>
              <strong className="text-sm font-semibold text-slate-900 dark:text-white print:text-black tabular-nums mt-0.5 block">
                {diet.totalDmnKgPerAnimal.toFixed(1)} kg MN/cab/d
              </strong>
            </div>
            <div className="p-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 block">Custo Diário / Cabeça</span>
              <strong className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 print:text-black tabular-nums mt-0.5 block">
                R$ {(diet.costs?.costPerAnimalDay ?? 0).toFixed(2)}
              </strong>
            </div>
            <div className="p-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 block">Índice IGEN</span>
              <strong className="text-sm font-semibold text-slate-900 dark:text-white print:text-black tabular-nums mt-0.5 block">
                {diet.igen?.score ?? 0} / 100 ({diet.igen?.grade ?? '—'})
              </strong>
              {diet.igen?.feedConversion !== undefined && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 block tabular-nums">
                  CA: {diet.igen.feedConversion} · Prod: {diet.igen.expectedGain} {diet.species === 'bovinos_leite' ? 'L' : 'kg'}
                </span>
              )}
            </div>
          </div>

          {/* Mixer Wagon Loading Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 print:text-black flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 print:text-black" />
              Ordem de Carregamento do Vagão / Batelada ({diet.targetBatchKg.toLocaleString('pt-BR')} kg MN)
            </h3>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 print:border-slate-400 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 print:bg-slate-100 border-b border-slate-200 dark:border-slate-800 print:border-slate-400">
                  <tr className="text-slate-600 dark:text-slate-300 print:text-black">
                    <th className="py-2 px-3 font-semibold w-14 text-center">Ordem</th>
                    <th className="py-2 px-3 font-semibold">Ingrediente</th>
                    <th className="py-2 px-3 font-semibold text-right">% MS</th>
                    <th className="py-2 px-3 font-semibold text-right">kg MN / Animal</th>
                    <th className="py-2 px-3 font-semibold text-right">Batelada (kg)</th>
                    <th className="py-2 px-3 font-semibold text-right">Custo Batelada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 print:divide-slate-300">
                  {itemBatchRows.map(({ item, ing, batchItemCost }, idx) => (
                    <tr key={item.ingredientId} className="bg-white dark:bg-slate-900 print:bg-white">
                      <td className="py-2 px-3 text-center font-semibold text-slate-500 dark:text-slate-400 print:text-black tabular-nums">
                        {idx + 1}º
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-medium text-slate-900 dark:text-slate-100 print:text-black block">
                          {ing ? ing.name : item.ingredientId}
                        </span>
                        {ing && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600">
                            {getIngredientCategoryLabel(ing.category)} · {ing.bromatology.dryMatterPct}% MS
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300 print:text-black tabular-nums">
                        {item.inclusionPctMs.toFixed(1)}%
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300 print:text-black tabular-nums">
                        {item.inclusionKgMnPerAnimal.toFixed(2)} kg
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-900 dark:text-white print:text-black tabular-nums">
                        {item.inclusionKgBatch.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 dark:text-slate-300 print:text-black tabular-nums">
                        R$ {batchItemCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800/60 print:bg-slate-100 border-t border-slate-200 dark:border-slate-800 print:border-slate-400 font-semibold">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 text-slate-900 dark:text-white print:text-black">
                      Total da Batelada
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 print:text-black tabular-nums">
                      {totalInclusionPctMs.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900 dark:text-white print:text-black tabular-nums">
                      {diet.totalDmnKgPerAnimal.toFixed(2)} kg
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-900 dark:text-white print:text-black tabular-nums">
                      {diet.targetBatchKg.toLocaleString('pt-BR')} kg
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 print:text-black tabular-nums">
                      R$ {computedTotalBatchCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Bromatological Summary */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 print:text-black">
              Balanço Nutricional da Ração (% na Matéria Seca)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 border border-slate-200 dark:border-slate-800 print:border-slate-300 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 print:divide-slate-300 text-xs">
              <div className="p-2.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 block">PB</span>
                <strong className="text-slate-900 dark:text-white print:text-black tabular-nums">
                  {(diet.calculatedBromatology?.crudeProteinPct ?? 0).toFixed(1)}%
                </strong>
              </div>
              <div className="p-2.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 block">NDT</span>
                <strong className="text-slate-900 dark:text-white print:text-black tabular-nums">
                  {(diet.calculatedBromatology?.tdnPct ?? 0).toFixed(1)}%
                </strong>
              </div>
              <div className="p-2.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 block">FDN Total</span>
                <strong className="text-slate-900 dark:text-white print:text-black tabular-nums">
                  {(diet.calculatedBromatology?.ndfPct ?? 0).toFixed(1)}%
                </strong>
              </div>
              <div className="p-2.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 block">peNDF</span>
                <strong className="text-emerald-700 dark:text-emerald-400 print:text-black tabular-nums">
                  {(diet.calculatedBromatology?.peNdfPct ?? 0).toFixed(1)}%
                </strong>
              </div>
              <div className="p-2.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 block">Cálcio (Ca)</span>
                <strong className="text-slate-900 dark:text-white print:text-black tabular-nums">
                  {(diet.calculatedBromatology?.calciumPct ?? 0).toFixed(2)}%
                </strong>
              </div>
              <div className="p-2.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600 block">Fósforo (P)</span>
                <strong className="text-slate-900 dark:text-white print:text-black tabular-nums">
                  {(diet.calculatedBromatology?.phosphorusPct ?? 0).toFixed(2)}%
                </strong>
              </div>
            </div>
          </div>

          {/* Operator Instructions & Signature */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 print:border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/40 print:bg-slate-50 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 print:border-slate-300">
              <strong className="text-slate-900 dark:text-slate-100 print:text-black block mb-1.5">
                Instruções para o Operador do Vagão
              </strong>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 print:text-slate-700 text-[11px]">
                <li>Respeitar a ordem de carregamento indicada na tabela acima.</li>
                <li>Tempo de mistura após último ingrediente: 4 a 6 minutos.</li>
                <li>Aferir sobras de cocho diariamente às 06:00 (meta: 3 a 5%).</li>
                <li>Em caso de variação visual de umidade na silagem, notificar o responsável técnico.</li>
              </ul>
              {diet.notes && (
                <p className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 print:text-slate-700">
                  <strong>Observações:</strong> {diet.notes}
                </p>
              )}
            </div>

            <div className="flex flex-col justify-end text-center space-y-2 pt-8">
              <div className="border-b border-slate-400 dark:border-slate-600 print:border-black w-3/4 mx-auto pb-1" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 print:text-black">
                Responsável Técnico · Zootecnista / Médico Veterinário (CRMV)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
