import React, { useMemo, useState } from 'react';
import { FeedIngredient, IngredientCategory } from '../../types/animalNutrition';
import { getIngredientCategoryLabel, INGREDIENT_CATEGORIES } from './nutritionConstants';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

interface Props {
  ingredients: FeedIngredient[];
  onSaveIngredient: (ingredient: FeedIngredient) => void;
  onDeleteIngredient: (id: string) => void;
}

const createEmptyIngredient = (): FeedIngredient => ({
  id: `ing_custom_${Date.now()}`,
  name: '',
  category: 'energeticos',
  pricePerKg: 1.2,
  freightPerTon: 35.0,
  operationalCostPct: 2.0,
  stockKg: 5000,
  minStockAlertKg: 1500,
  supplier: 'Fornecedor Local',
  notes: '',
  isCustom: true,
  bromatology: {
    dryMatterPct: 88.0,
    crudeProteinPct: 12.0,
    metabolizableEnergyMcal: 2.7,
    netEnergyElm: 1.8,
    netEnergyElg: 1.2,
    netEnergyEll: 1.65,
    ndfPct: 20.0,
    adfPct: 8.0,
    tdnPct: 75.0,
    peNdfPct: 5.0,
    starchPct: 45.0,
    sugarsPct: 3.0,
    etherExtractPct: 3.0,
    calciumPct: 0.1,
    phosphorusPct: 0.25,
    potassiumPct: 0.5,
    magnesiumPct: 0.2,
    sodiumPct: 0.03,
    sulfurPct: 0.15,
    chlorinePct: 0.05,
    zincPpm: 25.0,
    copperPpm: 5.0,
    manganesePpm: 20.0,
    seleniumPpm: 0.08,
    cobaltPpm: 0.04,
    iodinePpm: 0.05,
    dmdPct: 80.0,
    minInclusionPct: 0.0,
    maxInclusionPct: 50.0,
  },
});

export const IngredientDatabaseView: React.FC<Props> = ({
  ingredients,
  onSaveIngredient,
  onDeleteIngredient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'todas'>('todas');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<FeedIngredient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FeedIngredient>(createEmptyIngredient);

  const openNewIngredientModal = () => {
    setIsEditMode(false);
    setFormData(createEmptyIngredient());
    setIsModalOpen(true);
  };

  const openEditModal = (ing: FeedIngredient) => {
    setIsEditMode(true);
    setFormData(JSON.parse(JSON.stringify(ing)));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveIngredient(formData);
    setIsModalOpen(false);
  };

  const lowStockCount = useMemo(
    () => ingredients.filter((i) => i.stockKg <= i.minStockAlertKg).length,
    [ingredients]
  );

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return ingredients.filter((ing) => {
      const matchSearch =
        !q ||
        ing.name.toLowerCase().includes(q) ||
        (ing.supplier && ing.supplier.toLowerCase().includes(q)) ||
        (ing.notes && ing.notes.toLowerCase().includes(q));
      const matchCat = selectedCategory === 'todas' || ing.category === selectedCategory;
      const matchStock = !onlyLowStock || ing.stockKg <= ing.minStockAlertKg;
      return matchSearch && matchCat && matchStock;
    });
  }, [ingredients, searchTerm, selectedCategory, onlyLowStock]);

  const inputCls =
    'w-full h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500';

  return (
    <div id="ingredient-database-view" className="space-y-4">
      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar ingrediente por nome, fornecedor ou observação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-8 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {lowStockCount > 0 && (
              <button
                type="button"
                onClick={() => setOnlyLowStock((prev) => !prev)}
                className={`h-8 px-2.5 rounded-md text-xs font-medium inline-flex items-center gap-1.5 border whitespace-nowrap shrink-0 transition-colors ${
                  onlyLowStock
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Estoque Baixo ({lowStockCount})
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={openNewIngredientModal}
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Ingrediente
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('todas')}
              className={`h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                selectedCategory === 'todas'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Todos ({ingredients.length})
            </button>
            {INGREDIENT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap shrink-0 hidden sm:inline">
            {filtered.length} exibidos
          </span>
        </div>
      </div>

      {/* Ingredients Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-10 px-4 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Nenhum ingrediente encontrado
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ajuste os filtros ou cadastre um ingrediente personalizado com sua análise bromatológica.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((ing) => {
            const isLowStock = ing.stockKg <= ing.minStockAlertKg;
            const costPerKgMs =
              ing.bromatology.dryMatterPct > 0
                ? (ing.pricePerKg / (ing.bromatology.dryMatterPct / 100)).toFixed(2)
                : ing.pricePerKg.toFixed(2);

            return (
              <div
                key={ing.id}
                className={`bg-white dark:bg-slate-900 border rounded-lg p-4 flex flex-col justify-between transition-colors ${
                  isLowStock
                    ? 'border-rose-200 dark:border-rose-900/60'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      {getIngredientCategoryLabel(ing.category)}
                      {ing.isCustom ? ' · Personalizado' : ''}
                    </span>
                    {isLowStock && (
                      <span className="text-rose-700 dark:text-rose-400 font-semibold inline-flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        Estoque baixo
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5">
                    {ing.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {ing.notes || ing.supplier || 'Tabela Nacional de Bromatologia'}
                  </p>

                  {/* Bromatology Metrics */}
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs tabular-nums">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">MS</span>
                      <strong className="text-slate-900 dark:text-slate-100">{ing.bromatology.dryMatterPct}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">PB</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">{ing.bromatology.crudeProteinPct}%</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">NDT</span>
                      <strong className="text-slate-900 dark:text-slate-100">{ing.bromatology.tdnPct}%</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">FDN</span>
                      <strong className="text-slate-900 dark:text-slate-100">{ing.bromatology.ndfPct}%</strong>
                    </div>
                  </div>

                  {/* Cost & Stock */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 tabular-nums">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Preço MN / Base MS</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">
                        R$ {ing.pricePerKg.toFixed(2)} · <strong className="text-emerald-700 dark:text-emerald-400">R$ {costPerKgMs}/kg MS</strong>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Estoque Disponível</span>
                      <span className={`font-semibold ${isLowStock ? 'text-rose-700 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {(ing.stockKg / 1000).toFixed(1)} t
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIngredient(ing)}
                    className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" />
                    Ficha Bromatológica
                  </button>

                  {confirmDeleteId === ing.id ? (
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteIngredient(ing.id);
                          setConfirmDeleteId(null);
                        }}
                        className="h-7 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium"
                      >
                        Excluir
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-7 px-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-md"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(ing)}
                        className="h-7 w-7 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md transition-colors"
                        title="Editar preço, estoque e bromatologia"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {ing.isCustom && (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(ing.id)}
                          className="h-7 w-7 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 rounded-md transition-colors"
                          title="Excluir ingrediente personalizado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Bromatology Modal */}
      {selectedIngredient && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-3xl w-full shadow-lg my-6 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  Ficha Bromatológica Completa · {getIngredientCategoryLabel(selectedIngredient.category)}
                </p>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  {selectedIngredient.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIngredient(null)}
                aria-label="Fechar ficha"
                className="h-7 w-7 inline-flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[72vh] overflow-y-auto tabular-nums">
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  1. Energia & Frações Fibrosas (% na MS)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-200 dark:border-slate-800 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
                  {[
                    ['Matéria Seca', `${selectedIngredient.bromatology.dryMatterPct}%`],
                    ['Proteína Bruta', `${selectedIngredient.bromatology.crudeProteinPct}%`],
                    ['NDT', `${selectedIngredient.bromatology.tdnPct}%`],
                    ['Energia Met.', `${selectedIngredient.bromatology.metabolizableEnergyMcal} Mcal/kg`],
                  ].map(([label, val]) => (
                    <div key={label} className="p-2.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{label}</span>
                      <strong className="text-slate-900 dark:text-white text-sm">{val}</strong>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-lg -mt-1 pt-1 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
                  {[
                    ['FDN Total', `${selectedIngredient.bromatology.ndfPct}%`],
                    ['peNDF (Efetivo)', `${selectedIngredient.bromatology.peNdfPct}%`],
                    ['FDA', `${selectedIngredient.bromatology.adfPct}%`],
                    ['Amido Total', `${selectedIngredient.bromatology.starchPct}%`],
                  ].map(([label, val]) => (
                    <div key={label} className="p-2.5">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{label}</span>
                      <strong className="text-slate-900 dark:text-white">{val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  2. Energias Líquidas & Macro Minerais
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    ['ELm Manutenção', `${selectedIngredient.bromatology.netEnergyElm} Mcal/kg`],
                    ['ELg Ganho', `${selectedIngredient.bromatology.netEnergyElg} Mcal/kg`],
                    ['ELl Lactação', `${selectedIngredient.bromatology.netEnergyEll} Mcal/kg`],
                    ['Extrato Etéreo', `${selectedIngredient.bromatology.etherExtractPct}%`],
                    ['Cálcio (Ca)', `${selectedIngredient.bromatology.calciumPct}%`],
                    ['Fósforo (P)', `${selectedIngredient.bromatology.phosphorusPct}%`],
                    ['Potássio (K)', `${selectedIngredient.bromatology.potassiumPct}%`],
                    ['Magnésio (Mg)', `${selectedIngredient.bromatology.magnesiumPct}%`],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2 rounded-md">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{label}</span>
                      <strong className="text-slate-900 dark:text-slate-100">{val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  3. Eletrólitos & Micro Minerais
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    ['Sódio (Na)', `${selectedIngredient.bromatology.sodiumPct}%`],
                    ['Cloro (Cl)', `${selectedIngredient.bromatology.chlorinePct}%`],
                    ['Enxofre (S)', `${selectedIngredient.bromatology.sulfurPct}%`],
                    ['Zinco (Zn)', `${selectedIngredient.bromatology.zincPpm} ppm`],
                    ['Cobre (Cu)', `${selectedIngredient.bromatology.copperPpm} ppm`],
                    ['Selênio (Se)', `${selectedIngredient.bromatology.seleniumPpm} ppm`],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-2 rounded-md">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{label}</span>
                      <strong className="text-slate-900 dark:text-slate-100">{val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400">Inclusão recomendada na MS</span>
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    Mín {selectedIngredient.bromatology.minInclusionPct}% — Máx {selectedIngredient.bromatology.maxInclusionPct}%
                  </strong>
                </div>
                {selectedIngredient.bromatology.antiNutritionalFactors && (
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong className="text-amber-700 dark:text-amber-400">Fatores Antinutricionais:</strong>{' '}
                    {selectedIngredient.bromatology.antiNutritionalFactors}
                  </p>
                )}
                {selectedIngredient.bromatology.processingType && (
                  <p className="text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-800 dark:text-slate-200">Processamento:</strong>{' '}
                    {selectedIngredient.bromatology.processingType}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => {
                  const target = selectedIngredient;
                  setSelectedIngredient(null);
                  openEditModal(target);
                }}
                className="h-8 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md text-xs font-medium transition-colors"
              >
                Editar Parâmetros
              </button>
              <button
                type="button"
                onClick={() => setSelectedIngredient(null)}
                className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full shadow-lg my-6 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {isEditMode ? 'Editar Parâmetros & Estoque do Ingrediente' : 'Novo Ingrediente Personalizado'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar modal"
                className="h-7 w-7 inline-flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs max-h-[76vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Nome do Ingrediente *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as IngredientCategory })}
                    className={inputCls}
                  >
                    {INGREDIENT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                  Preços, Frete & Estoque
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Preço Base (R$/kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.pricePerKg}
                      onChange={(e) => setFormData({ ...formData, pricePerKg: Number(e.target.value) })}
                      className={`${inputCls} tabular-nums`}
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Frete (R$/t)</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.freightPerTon}
                      onChange={(e) => setFormData({ ...formData, freightPerTon: Number(e.target.value) })}
                      className={`${inputCls} tabular-nums`}
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Estoque Atual (kg)</label>
                    <input
                      type="number"
                      step="100"
                      value={formData.stockKg}
                      onChange={(e) => setFormData({ ...formData, stockKg: Number(e.target.value) })}
                      className={`${inputCls} tabular-nums`}
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Alerta Mínimo (kg)</label>
                    <input
                      type="number"
                      step="100"
                      value={formData.minStockAlertKg}
                      onChange={(e) => setFormData({ ...formData, minStockAlertKg: Number(e.target.value) })}
                      className={`${inputCls} tabular-nums`}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                  Composição Bromatológica (% na MS)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(
                    [
                      ['% Matéria Seca', 'dryMatterPct', '0.1'],
                      ['% Proteína Bruta', 'crudeProteinPct', '0.1'],
                      ['% NDT', 'tdnPct', '0.1'],
                      ['% FDN Total', 'ndfPct', '0.1'],
                      ['% peNDF', 'peNdfPct', '0.1'],
                      ['% Amido', 'starchPct', '0.1'],
                      ['% Cálcio (Ca)', 'calciumPct', '0.01'],
                      ['% Fósforo (P)', 'phosphorusPct', '0.01'],
                    ] as const
                  ).map(([label, field, step]) => (
                    <div key={field}>
                      <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">{label}</label>
                      <input
                        type="number"
                        step={step}
                        value={formData.bromatology[field]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bromatology: { ...formData.bromatology, [field]: Number(e.target.value) },
                          })
                        }
                        className={`${inputCls} tabular-nums`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors"
                >
                  Salvar Ingrediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
