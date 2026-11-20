import React, { useState, useMemo } from 'react';
import { Leaf, Search, ShieldCheck } from 'lucide-react';
import { CropCategory, TraceabilityCrop } from '../../types/traceability';

interface CropsCatalogProps {
  crops: TraceabilityCrop[];
}

const CATEGORY_LABELS: Record<CropCategory, string> = {
  hortalicas_frutos: 'Hortaliças-Fruto',
  hortalicas_folhosas: 'Hortaliças Folhosas',
  raizes_tuberculos: 'Raízes e Tubérculos',
  frutiferas: 'Frutíferas',
  graos_cereais: 'Grãos e Cereais',
  industriais_especiais: 'Industriais e Especiais',
};

export const TraceabilityCropsCatalog: React.FC<CropsCatalogProps> = ({ crops }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<TraceabilityCrop | null>(crops[0] || null);

  const filteredCrops = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return (crops || []).filter(crop => {
      if (!crop) return false;
      const matchSearch =
        !query ||
        (crop.name || '').toLowerCase().includes(query) ||
        (crop.scientificName || '').toLowerCase().includes(query) ||
        (crop.cultivarsRecommended || []).some(c => (c || '').toLowerCase().includes(query));
      const matchCategory = categoryFilter === 'all' || crop.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [crops, searchTerm, categoryFilter]);

  const activeCrop = selectedCrop && filteredCrops.some(c => c.id === selectedCrop.id)
    ? selectedCrop
    : filteredCrops[0] || selectedCrop;

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Banco Nacional de Hortaliças, Frutas & Culturas (HF)
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Catálogo agronômico com parâmetros de classificação comercial, ciclo fenológico, peso de caixa e cultivares
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60 tabular-nums whitespace-nowrap">
            {crops.length} culturas configuradas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar cultura por nome, espécie científica ou cultivar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          >
            <option value="all">Todas as Categorias</option>
            <option value="hortalicas_frutos">Hortaliças-Fruto (Tomate, Pimentão...)</option>
            <option value="hortalicas_folhosas">Hortaliças Folhosas (Alface, Couve...)</option>
            <option value="raizes_tuberculos">Raízes e Tubérculos (Cenoura, Batata...)</option>
            <option value="frutiferas">Frutíferas (Morango, Melão, Banana...)</option>
            <option value="graos_cereais">Grãos e Cereais (Soja, Milho, Feijão)</option>
            <option value="industriais_especiais">Industriais e Especiais (Café)</option>
          </select>
        </div>
      </div>

      {/* Grid: Crops List & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          {filteredCrops.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-8 text-center">
              <Leaf className="w-7 h-7 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Nenhuma cultura encontrada</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Ajuste o termo de busca ou selecione outra categoria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCrops.map(crop => {
                const isSelected = activeCrop?.id === crop.id;
                const cycleDays = crop.cycleDays || crop.cycleDaysAverage || 90;
                return (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => setSelectedCrop(crop)}
                    className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500/80 dark:border-emerald-600'
                        : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          {CATEGORY_LABELS[crop.category] || crop.category.replace(/_/g, ' ')}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 truncate">
                          {crop.name}
                        </h4>
                        <p className="text-[11px] italic text-slate-400 dark:text-zinc-500 truncate">{crop.scientificName}</p>
                      </div>
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold border bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700 whitespace-nowrap tabular-nums">
                        {cycleDays} dias
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      <span>{crop.boxWeightKg} kg/caixa</span>
                      <span>{(crop.cultivarsRecommended || []).length} cultivares</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Crop Inspector */}
        <div className="lg:col-span-5">
          {activeCrop && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 sticky top-4">
              <div className="pb-3 border-b border-slate-200/80 dark:border-zinc-800">
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Ficha Agronômica Oficial
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
                  {activeCrop.name}
                </h3>
                <p className="text-xs italic text-slate-400 dark:text-zinc-500">{activeCrop.scientificName}</p>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600 dark:text-zinc-300">
                <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg tabular-nums">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold block">Ciclo Médio</span>
                    <strong className="text-slate-900 dark:text-zinc-100">
                      {activeCrop.cycleDays || activeCrop.cycleDaysAverage || 90} dias
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold block">Peso Padrão</span>
                    <strong className="text-slate-900 dark:text-zinc-100">
                      {activeCrop.boxWeightKg || 20} kg
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold block">Espaçamento</span>
                    <strong className="text-slate-900 dark:text-zinc-100">{activeCrop.defaultSpacingMeters}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold block">Carência Média</span>
                    <strong className="text-slate-900 dark:text-zinc-100">{activeCrop.safetyIntervalGeneralDays} dias</strong>
                  </div>
                </div>

                {activeCrop.nutritionalNeedsSummary && (
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                      Manejo Nutricional & Fisiologia
                    </span>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                      {activeCrop.nutritionalNeedsSummary}
                    </p>
                  </div>
                )}

                <div>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 block mb-1.5">
                    Cultivares e Híbridos Comerciais
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeCrop.cultivarsRecommended || []).map((cult, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 rounded-md text-[11px] font-medium border border-emerald-200/80 dark:border-emerald-800/60"
                      >
                        {cult}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 block mb-1.5">
                    Classificação Comercial MAPA
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeCrop.commercialClasses || activeCrop.commercialClassesAvailable || ['Extra AA', 'Extra A', 'Comercial']).map(
                      (cls, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px]"
                        >
                          {cls}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] text-emerald-900 dark:text-emerald-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Conformidade INC 02/2018:</strong> Esta cultura exige emissão de etiqueta de rastreabilidade na expedição para varejo e atacado.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
