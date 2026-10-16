import React, { useState } from 'react';
import { FeedIngredient, IngredientCategory } from '../../types/animalNutrition';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Package,
  Layers,
  AlertTriangle,
  Info,
  DollarSign,
  Truck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface Props {
  ingredients: FeedIngredient[];
  onSaveIngredient: (ingredient: FeedIngredient) => void;
  onDeleteIngredient: (id: string) => void;
}

export const IngredientDatabaseView: React.FC<Props> = ({
  ingredients,
  onSaveIngredient,
  onDeleteIngredient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'todas'>('todas');
  const [selectedIngredient, setSelectedIngredient] = useState<FeedIngredient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form State for editing or creating
  const [formData, setFormData] = useState<FeedIngredient>({
    id: '',
    name: '',
    category: 'energeticos',
    pricePerKg: 1.0,
    freightPerTon: 40.0,
    operationalCostPct: 2.0,
    stockKg: 10000,
    minStockAlertKg: 2000,
    supplier: '',
    notes: '',
    bromatology: {
      dryMatterPct: 88.0,
      crudeProteinPct: 10.0,
      metabolizableEnergyMcal: 2.8,
      netEnergyElm: 1.9,
      netEnergyElg: 1.25,
      netEnergyEll: 1.75,
      ndfPct: 15.0,
      adfPct: 6.0,
      tdnPct: 80.0,
      peNdfPct: 4.0,
      starchPct: 60.0,
      sugarsPct: 3.0,
      etherExtractPct: 3.5,
      calciumPct: 0.05,
      phosphorusPct: 0.30,
      potassiumPct: 0.40,
      magnesiumPct: 0.15,
      sodiumPct: 0.02,
      sulfurPct: 0.12,
      chlorinePct: 0.05,
      zincPpm: 20.0,
      copperPpm: 4.0,
      manganesePpm: 15.0,
      seleniumPpm: 0.05,
      cobaltPpm: 0.03,
      iodinePpm: 0.05,
      dmdPct: 85.0,
      minInclusionPct: 0.0,
      maxInclusionPct: 60.0,
    },
  });

  const openNewIngredientModal = () => {
    setIsEditMode(false);
    setFormData({
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
        calciumPct: 0.10,
        phosphorusPct: 0.25,
        potassiumPct: 0.50,
        magnesiumPct: 0.20,
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

  const filtered = ingredients.filter((ing) => {
    const matchSearch =
      ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ing.supplier && ing.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCat = selectedCategory === 'todas' || ing.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const categories: Array<{ id: IngredientCategory | 'todas'; label: string; icon: string }> = [
    { id: 'todas', label: 'Todos os Alimentos', icon: '🌽' },
    { id: 'energeticos', label: 'Energéticos', icon: '⚡' },
    { id: 'proteicos', label: 'Proteicos', icon: '🥩' },
    { id: 'volumosos', label: 'Volumosos / Silagens', icon: '🌾' },
    { id: 'minerais', label: 'Macro & Micro Minerais', icon: '🧂' },
    { id: 'vitaminas', label: 'Vitaminas & Premixes', icon: '💊' },
    { id: 'aditivos', label: 'Aditivos & Moduladores', icon: '🔬' },
  ];

  return (
    <div id="ingredient-database-view" className="space-y-6">
      {/* Search & Category Filter */}
      <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar ingrediente por nome, nutriente ou fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={openNewIngredientModal}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 whitespace-nowrap transition-all"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Ingrediente Personalizado
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ingredients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ing) => {
          const isLowStock = ing.stockKg <= ing.minStockAlertKg;
          const costPerKgMs =
            ing.bromatology.dryMatterPct > 0
              ? (ing.pricePerKg / (ing.bromatology.dryMatterPct / 100)).toFixed(2)
              : ing.pricePerKg.toFixed(2);

          return (
            <div
              key={ing.id}
              className={`bg-slate-900/80 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                isLowStock
                  ? 'border-rose-900/50 hover:border-rose-700'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                    {ing.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {ing.isCustom && (
                      <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-blue-500/20 text-blue-300 rounded">
                        Personalizado
                      </span>
                    )}
                    {isLowStock && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-500/20 text-rose-400 rounded flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        Estoque Baixo
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white mt-2">{ing.name}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {ing.notes || ing.supplier || 'Padrão Tabela Nacional de Bromatologia'}
                </p>

                {/* Key Bromatology Mini Metrics */}
                <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-800/80 text-center">
                  <div className="bg-slate-800/60 p-1.5 rounded">
                    <span className="text-[9px] text-slate-400 block">% MS</span>
                    <strong className="text-xs text-white">{ing.bromatology.dryMatterPct}%</strong>
                  </div>
                  <div className="bg-slate-800/60 p-1.5 rounded">
                    <span className="text-[9px] text-slate-400 block">% PB</span>
                    <strong className="text-xs text-emerald-400">{ing.bromatology.crudeProteinPct}%</strong>
                  </div>
                  <div className="bg-slate-800/60 p-1.5 rounded">
                    <span className="text-[9px] text-slate-400 block">% NDT</span>
                    <strong className="text-xs text-blue-400">{ing.bromatology.tdnPct}%</strong>
                  </div>
                  <div className="bg-slate-800/60 p-1.5 rounded">
                    <span className="text-[9px] text-slate-400 block">% FDN</span>
                    <strong className="text-xs text-amber-400">{ing.bromatology.ndfPct}%</strong>
                  </div>
                </div>

                {/* Stock & Cost Metrics */}
                <div className="mt-3 bg-slate-800/40 p-2 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Preço MN:</span>
                    <strong className="text-slate-200">R$ {ing.pricePerKg.toFixed(2)} / kg</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Custo base MS:</span>
                    <strong className="text-emerald-400">R$ {costPerKgMs} / kg MS</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estoque Disponível:</span>
                    <span className={`font-semibold ${isLowStock ? 'text-rose-400' : 'text-slate-300'}`}>
                      {(ing.stockKg / 1000).toFixed(1)} t
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedIngredient(ing)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" />
                  Ver Ficha Completa
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(ing)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-all"
                    title="Editar Preço e Estoque"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {ing.isCustom && (
                    <button
                      onClick={() => onDeleteIngredient(ing.id)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 rounded transition-all"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ingredient Detailed Bromatology Modal */}
      {selectedIngredient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Ficha Bromatológica Completa
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedIngredient.name}</h3>
              </div>
              <button
                onClick={() => setSelectedIngredient(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Energy & Macronutrients */}
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-2">
                  1. Energia & Frações Fibrosas (% na Matéria Seca)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Matéria Seca (% MS)</span>
                    <strong className="text-white text-sm">{selectedIngredient.bromatology.dryMatterPct}%</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Proteína Bruta (% PB)</span>
                    <strong className="text-emerald-400 text-sm">{selectedIngredient.bromatology.crudeProteinPct}%</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">NDT (% MS)</span>
                    <strong className="text-blue-400 text-sm">{selectedIngredient.bromatology.tdnPct}%</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Energia Met. (Mcal/kg)</span>
                    <strong className="text-amber-400 text-sm">{selectedIngredient.bromatology.metabolizableEnergyMcal}</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">FDN Total (% MS)</span>
                    <strong className="text-white text-sm">{selectedIngredient.bromatology.ndfPct}%</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">FDN Efetivo (% FDNef)</span>
                    <strong className="text-emerald-300 text-sm">{selectedIngredient.bromatology.peNdfPct}%</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">FDA (% MS)</span>
                    <strong className="text-white text-sm">{selectedIngredient.bromatology.adfPct}%</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Amido Total (% MS)</span>
                    <strong className="text-white text-sm">{selectedIngredient.bromatology.starchPct}%</strong>
                  </div>
                </div>
              </div>

              {/* Net Energies & Minerals */}
              <div>
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-2">
                  2. Energias Líquidas & Macro Minerais
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">ELm - Manutenção</span>
                    <strong className="text-white text-xs">{selectedIngredient.bromatology.netEnergyElm} Mcal/kg</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">ELg - Ganho de Peso</span>
                    <strong className="text-white text-xs">{selectedIngredient.bromatology.netEnergyElg} Mcal/kg</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">ELl - Lactação</span>
                    <strong className="text-white text-xs">{selectedIngredient.bromatology.netEnergyEll} Mcal/kg</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Extrato Etéreo (EE)</span>
                    <strong className="text-white text-xs">{selectedIngredient.bromatology.etherExtractPct}%</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Cálcio (Ca)</span>
                    <strong className="text-white text-xs">{selectedIngredient.bromatology.calciumPct}%</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Fósforo (P)</span>
                    <strong className="text-white text-xs">{selectedIngredient.bromatology.phosphorusPct}%</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Potássio (K)</span>
                    <strong className="text-white text-xs">{selectedIngredient.bromatology.potassiumPct}%</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Magnésio (Mg)</span>
                    <strong className="text-white text-xs">{selectedIngredient.bromatology.magnesiumPct}%</strong>
                  </div>
                </div>
              </div>

              {/* Electrolytes and Trace Elements */}
              <div>
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-2">
                  3. Eletrólitos & Micro Minerais (DCAD & Quelatos)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center">
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Sódio (Na)</span>
                    <strong className="text-white text-xs">{selectedIngredient.bromatology.sodiumPct}%</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Cloro (Cl)</span>
                    <strong className="text-white text-xs">{selectedIngredient.bromatology.chlorinePct}%</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Enxofre (S)</span>
                    <strong className="text-white text-xs">{selectedIngredient.bromatology.sulfurPct}%</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Zinco (Zn)</span>
                    <strong className="text-white text-xs">{selectedIngredient.bromatology.zincPpm} ppm</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Cobre (Cu)</span>
                    <strong className="text-white text-xs">{selectedIngredient.bromatology.copperPpm} ppm</strong>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px]">Selênio (Se)</span>
                    <strong className="text-white text-xs">{selectedIngredient.bromatology.seleniumPpm} ppm</strong>
                  </div>
                </div>
              </div>

              {/* Limits and Notes */}
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Limites de Inclusão Sugeridos na Dieta:</span>
                  <strong className="text-emerald-400">
                    Min {selectedIngredient.bromatology.minInclusionPct}% — Máx {selectedIngredient.bromatology.maxInclusionPct}% da MS
                  </strong>
                </div>
                {selectedIngredient.bromatology.antiNutritionalFactors && (
                  <div className="text-slate-300">
                    <span className="text-amber-400 font-semibold block">Fatores Antinutricionais / Atenção:</span>
                    <span>{selectedIngredient.bromatology.antiNutritionalFactors}</span>
                  </div>
                )}
                {selectedIngredient.bromatology.processingType && (
                  <div className="text-slate-300">
                    <span className="text-slate-400 font-semibold block">Processamento / Granulometria Recomendada:</span>
                    <span>{selectedIngredient.bromatology.processingType}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedIngredient(null)}
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Ingredient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                {isEditMode ? 'Editar Parâmetros & Estoque do Ingrediente' : 'Novo Ingrediente Personalizado'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Nome do Ingrediente *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="energeticos">Energéticos</option>
                    <option value="proteicos">Proteicos</option>
                    <option value="volumosos">Volumosos / Silagens</option>
                    <option value="minerais">Minerais</option>
                    <option value="vitaminas">Vitaminas & Premixes</option>
                    <option value="aditivos">Aditivos & Moduladores</option>
                  </select>
                </div>
              </div>

              {/* Economic & Stock Fields */}
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 space-y-3">
                <span className="text-emerald-400 font-bold block">Preços, Frete & Estoque</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Preço Base (R$/kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.pricePerKg}
                      onChange={(e) => setFormData({ ...formData, pricePerKg: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Frete (R$/tonelada)</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.freightPerTon}
                      onChange={(e) => setFormData({ ...formData, freightPerTon: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Estoque Atual (kg)</label>
                    <input
                      type="number"
                      step="100"
                      value={formData.stockKg}
                      onChange={(e) => setFormData({ ...formData, stockKg: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Alerta Mínimo (kg)</label>
                    <input
                      type="number"
                      step="100"
                      value={formData.minStockAlertKg}
                      onChange={(e) => setFormData({ ...formData, minStockAlertKg: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bromatological Values */}
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 space-y-3">
                <span className="text-emerald-400 font-bold block">Composição Bromatológica (% na MS)</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">% Matéria Seca</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bromatology.dryMatterPct}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bromatology: { ...formData.bromatology, dryMatterPct: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">% Proteína Bruta</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bromatology.crudeProteinPct}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bromatology: { ...formData.bromatology, crudeProteinPct: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">% NDT</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bromatology.tdnPct}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bromatology: { ...formData.bromatology, tdnPct: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">% FDN Total</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bromatology.ndfPct}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bromatology: { ...formData.bromatology, ndfPct: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">% FDN Efetivo (peNDF)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bromatology.peNdfPct}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bromatology: { ...formData.bromatology, peNdfPct: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">% Amido</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.bromatology.starchPct}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bromatology: { ...formData.bromatology, starchPct: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">% Cálcio (Ca)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.bromatology.calciumPct}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bromatology: { ...formData.bromatology, calciumPct: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">% Fósforo (P)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.bromatology.phosphorusPct}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bromatology: { ...formData.bromatology, phosphorusPct: Number(e.target.value) },
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-lg shadow-emerald-500/20"
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
