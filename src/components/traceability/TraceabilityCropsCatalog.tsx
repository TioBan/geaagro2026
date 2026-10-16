import React, { useState } from 'react';
import {
  Leaf,
  Search,
  Filter,
  Sparkles,
  Info,
  Calendar,
  Layers,
  CheckCircle2,
  Scale,
  Droplets,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { TraceabilityCrop } from '../../types/traceability';

interface CropsCatalogProps {
  crops: TraceabilityCrop[];
  onSelectCropForLot?: (crop: TraceabilityCrop) => void;
}

export const TraceabilityCropsCatalog: React.FC<CropsCatalogProps> = ({
  crops,
  onSelectCropForLot,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<TraceabilityCrop>(crops[0]);

  const filteredCrops = (crops || []).filter(crop => {
    if (!crop) return false;
    const query = (searchTerm || '').toLowerCase();
    const matchSearch =
      !query ||
      (crop.name || '').toLowerCase().includes(query) ||
      (crop.scientificName || '').toLowerCase().includes(query) ||
      (crop.cultivarsRecommended || []).some(c => (c || '').toLowerCase().includes(query));

    const matchCategory = categoryFilter === 'all' || crop.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600" />
              Banco Nacional de Hortaliças, Frutas & Legumes (HF)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Catálogo agronômico oficial com parâmetros de classificação comercial, ciclo fenológico, peso de caixa e cultivares
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-xl">
            {crops.length} Culturas Pré-Configuradas
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cultura por nome, espécie científica, híbrido..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
            >
              <option value="all">Todas as Categorias</option>
              <option value="fruto">Hortaliças-Fruto (Tomate, Pimentão, Berinjela...)</option>
              <option value="folhosa">Hortaliças Folhosas (Alface, Rúcula, Couve...)</option>
              <option value="raiz_tuberculo">Raízes e Tubérculos (Cenoura, Batata...)</option>
              <option value="frutifera">Frutas & Pequenos Frutos (Morango, Melão...)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Crops List & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Crops List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredCrops.map(crop => {
              const isSelected = selectedCrop?.id === crop.id;

              return (
                <div
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        {crop.category.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {crop.name}
                      </h4>
                      <p className="text-xs italic text-slate-400">{crop.scientificName}</p>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      {crop.cycleDays} dias
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{crop.boxWeightKg} kg/caixa</span>
                    <span>{crop.cultivarsRecommended.length} cultivares</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Crop Inspector */}
        <div className="lg:col-span-5">
          {selectedCrop && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4 sticky top-20">
              <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Ficha Agronômica Oficial
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedCrop.name}
                </h3>
                <p className="text-xs italic text-slate-400">{selectedCrop.scientificName}</p>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-zinc-300">
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Ciclo Médio:</span>
                    <strong className="text-slate-800 dark:text-zinc-200">{selectedCrop.cycleDays || selectedCrop.cycleDaysAverage || 90} dias</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Peso Padrão Caixa:</span>
                    <strong className="text-slate-800 dark:text-zinc-200">{selectedCrop.boxWeightKg || 20} kg ({selectedCrop.packagingTypeDefault || 'Caixa Plástica Padrão'})</strong>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block mb-1.5">
                    Cultivares e Híbridos Comerciais:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedCrop.cultivarsRecommended || []).map((cult, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-800"
                      >
                        {cult}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block mb-1">
                    Classificação Comercial MAPA:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(selectedCrop.commercialClassesAvailable || ['Extra AA', 'Extra A', 'Comercial']).map((cls, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px]">
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 inline mr-1 -mt-0.5" />
                  <strong>Conformidade INC 02/2018:</strong> Esta cultura exige emissão de etiqueta de rastreabilidade na expedição para varejo e atacado.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
