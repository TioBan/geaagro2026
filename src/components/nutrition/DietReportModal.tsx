// @ts-nocheck
import React from 'react';
import { DietFormulation, FeedIngredient } from '../../types/animalNutrition';
import { Printer, Download, X, Layers, Scale, DollarSign, Award, ShieldCheck, Check } from 'lucide-react';

interface Props {
  diet: DietFormulation;
  ingredients: FeedIngredient[];
  onClose: () => void;
}

export const DietReportModal: React.FC<Props> = ({ diet, ingredients, onClose }) => {
  const ingredientsMap = new Map<string, FeedIngredient>((ingredients || []).filter(i => i && i.id).map((i) => [i.id, i]));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 print:p-0 print:border-none print:bg-white print:text-black">
        {/* Modal Controls (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Relatório Técnico & Ordem de Batelada
            </span>
            <span className="text-xs text-slate-400">Pronto para Impressão e Envio ao Operador</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="space-y-6 text-slate-200 print:text-black">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-800 print:border-black pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-emerald-400 print:text-emerald-700 tracking-tight">
                  GeaAgro &bull; Nutrição Animal
                </span>
              </div>
              <h2 className="text-lg font-bold text-white print:text-black mt-1">{diet.name}</h2>
              <p className="text-xs text-slate-400 print:text-gray-600">
                Espécie: <strong className="text-white print:text-black">{diet.species.replace('_', ' ').toUpperCase()}</strong> &bull; Categoria: {diet.category} &bull; Lote: {diet.animalCount} animais
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400 print:text-gray-600 block">Data de Emissão</span>
              <strong className="text-white print:text-black">
                {new Date(diet.updatedAt || diet.createdAt).toLocaleDateString('pt-BR')}
              </strong>
              <span className="block text-[10px] text-slate-500 mt-1">Versão {diet.version}.0 &bull; NRC 2001 / BR-CORTE</span>
            </div>
          </div>

          {/* Key Executive Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-800/60 print:bg-gray-100 p-3 rounded-xl print:border">
              <span className="text-slate-400 print:text-gray-600 block text-[10px]">Consumo Alvo MS</span>
              <strong className="text-white print:text-black text-sm">{diet.totalDmiKgPerAnimal} kg MS/cab/dia</strong>
            </div>
            <div className="bg-slate-800/60 print:bg-gray-100 p-3 rounded-xl print:border">
              <span className="text-slate-400 print:text-gray-600 block text-[10px]">Consumo Natural (In Natura)</span>
              <strong className="text-white print:text-black text-sm">{diet.totalDmnKgPerAnimal} kg MN/cab/dia</strong>
            </div>
            <div className="bg-slate-800/60 print:bg-gray-100 p-3 rounded-xl print:border">
              <span className="text-slate-400 print:text-gray-600 block text-[10px]">Custo Diário / Cabeça</span>
              <strong className="text-emerald-400 print:text-emerald-700 text-sm">
                R$ {diet.costs?.costPerAnimalDay?.toFixed(2)}
              </strong>
            </div>
            <div className="bg-slate-800/60 print:bg-gray-100 p-3 rounded-xl print:border">
              <span className="text-slate-400 print:text-gray-600 block text-[10px]">Índice IGEN</span>
              <strong className="text-amber-400 print:text-black text-sm">
                {diet.igen?.score || 92} / 100 ({diet.igen?.grade || 'A'})
              </strong>
              {diet.igen?.feedConversion && (
                <span className="text-[10px] text-slate-300 print:text-gray-600 block mt-0.5">
                  CA: {diet.igen.feedConversion} kg MS/{diet.species === 'bovinos_leite' ? 'L' : 'kg'} | GPD: {diet.igen.expectedGain} {diet.species === 'bovinos_leite' ? 'L' : 'kg'}
                </span>
              )}
            </div>
          </div>

          {/* Mixer Wagon Loading Sequence Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              Ordem de Carregamento do Vagão / Batelada ({diet.targetBatchKg.toLocaleString('pt-BR')} kg)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-800 print:border-black">
                <thead className="bg-slate-800/80 print:bg-gray-200">
                  <tr className="text-slate-300 print:text-black">
                    <th className="p-2 font-bold w-12 text-center">Ordem</th>
                    <th className="p-2 font-bold">Ingrediente</th>
                    <th className="p-2 font-bold text-center">% MS</th>
                    <th className="p-2 font-bold text-right">kg MN / Animal</th>
                    <th className="p-2 font-bold text-right">Batelada Vagão (kg)</th>
                    <th className="p-2 font-bold text-right">Custo (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-gray-300">
                  {diet.items.map((it, idx) => {
                    const ing = ingredientsMap.get(it.ingredientId);
                    return (
                      <tr key={idx} className="print:bg-white">
                        <td className="p-2 text-center font-bold text-slate-400 print:text-black">{idx + 1}º</td>
                        <td className="p-2 font-medium text-white print:text-black">
                          {ing ? ing.name : it.ingredientId}
                          <span className="block text-[10px] text-slate-400 print:text-gray-600">
                            {ing?.category} &bull; {ing?.bromatology.dryMatterPct}% MS
                          </span>
                        </td>
                        <td className="p-2 text-center text-slate-300 print:text-black font-semibold">
                          {it.inclusionPctMs}%
                        </td>
                        <td className="p-2 text-right text-slate-300 print:text-black">
                          {it.inclusionKgMnPerAnimal} kg
                        </td>
                        <td className="p-2 text-right font-extrabold text-amber-400 print:text-black text-sm">
                          {it.inclusionKgBatch} kg
                        </td>
                        <td className="p-2 text-right text-slate-300 print:text-black">
                          R$ {((it.inclusionKgBatch * (ing?.pricePerKg || 1)) / (diet.targetBatchKg / 1000)).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-800/90 print:bg-gray-200 font-bold">
                  <tr>
                    <td colSpan={2} className="p-2 text-white print:text-black">TOTAL BATELADA</td>
                    <td className="p-2 text-center text-emerald-400 print:text-black">100.0%</td>
                    <td className="p-2 text-right text-white print:text-black">{diet.totalDmnKgPerAnimal} kg</td>
                    <td className="p-2 text-right text-emerald-400 print:text-black text-sm">
                      {diet.targetBatchKg.toLocaleString('pt-BR')} kg
                    </td>
                    <td className="p-2 text-right text-emerald-400 print:text-black">
                      R$ {diet.costs?.totalCostPerBatch?.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Diet Bromatological Profile */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-white print:text-black uppercase tracking-wider">
              Balanço Nutricional da Ração (% na Matéria Seca)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-800/40 print:bg-gray-100 p-2.5 rounded-lg border border-slate-800 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">Proteína Bruta (PB)</span>
                <strong className="text-white print:text-black text-sm">
                  {diet.calculatedBromatology?.crudeProteinPct?.toFixed(1)}%
                </strong>
              </div>
              <div className="bg-slate-800/40 print:bg-gray-100 p-2.5 rounded-lg border border-slate-800 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">NDT Total</span>
                <strong className="text-white print:text-black text-sm">
                  {diet.calculatedBromatology?.tdnPct?.toFixed(1)}%
                </strong>
              </div>
              <div className="bg-slate-800/40 print:bg-gray-100 p-2.5 rounded-lg border border-slate-800 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">FDN Total</span>
                <strong className="text-white print:text-black text-sm">
                  {diet.calculatedBromatology?.ndfPct?.toFixed(1)}%
                </strong>
              </div>
              <div className="bg-slate-800/40 print:bg-gray-100 p-2.5 rounded-lg border border-slate-800 print:border-gray-300">
                <span className="text-[10px] text-slate-400 print:text-gray-600 block">FDN Efetivo (peNDF)</span>
                <strong className="text-emerald-400 print:text-black text-sm">
                  {diet.calculatedBromatology?.peNdfPct?.toFixed(1)}%
                </strong>
              </div>
            </div>
          </div>

          {/* Operator Instructions & Signatures */}
          <div className="pt-4 border-t border-slate-800 print:border-black grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-800/30 print:bg-gray-50 p-3 rounded-xl border border-slate-800 print:border-gray-300">
              <strong className="text-white print:text-black block mb-1">Instruções para o Operador do Vagão:</strong>
              <ul className="list-disc list-inside space-y-1 text-slate-300 print:text-gray-700 text-[11px]">
                <li>Respeitar a ordem de carregamento indicada na tabela.</li>
                <li>Tempo de mistura após último ingrediente: 4 a 6 minutos.</li>
                <li>Aferir sobras de cocho diariamente às 06:00 (alvo: 3 a 5%).</li>
                <li>Qualquer alteração visual de umidade na silagem, notificar zootecnista.</li>
              </ul>
            </div>

            <div className="flex flex-col justify-end text-center space-y-4 pt-4">
              <div className="border-b border-slate-700 print:border-black w-3/4 mx-auto pb-1"></div>
              <span className="text-[11px] text-slate-400 print:text-black">
                Responsável Técnico Zootecnista / CRMV
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
