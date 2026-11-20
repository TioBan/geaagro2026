import React, { useState } from 'react';
import {
  Search,
  Plus,
  FlaskConical,
  FileText,
  ShieldCheck,
  X,
} from 'lucide-react';
import { TankMixProduct, AgrochemicalClass, PesticideFormulationCode } from '../../types/tankMix';

interface Props {
  products: TankMixProduct[];
  onAddCustomProduct: (product: TankMixProduct) => void;
  onSelectProductForLab: (product: TankMixProduct) => void;
}

const CLASS_OPTIONS = [
  { id: 'todos', label: 'Todos' },
  { id: 'herbicida', label: 'Herbicidas' },
  { id: 'fungicida', label: 'Fungicidas' },
  { id: 'inseticida', label: 'Inseticidas' },
  { id: 'adjuvante', label: 'Adjuvantes' },
  { id: 'fertilizante_foliar', label: 'Foliares' },
  { id: 'condicionador_calda', label: 'Condicionadores' },
];

export const TankMixProductsCatalogView: React.FC<Props> = ({
  products,
  onAddCustomProduct,
  onSelectProductForLab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('todos');
  const [selectedProductDetail, setSelectedProductDetail] = useState<TankMixProduct | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newProdName, setNewProdName] = useState('');
  const [newProdAi, setNewProdAi] = useState('');
  const [newProdForm, setNewProdForm] = useState<PesticideFormulationCode>('SC');
  const [newProdClass, setNewProdClass] = useState<AgrochemicalClass>('herbicida');
  const [newProdManufacturer, setNewProdManufacturer] = useState('');
  const [newProdDose, setNewProdDose] = useState<number>(1.0);
  const [newProdDoseUnit, setNewProdDoseUnit] = useState<TankMixProduct['doseUnit']>('L/ha');
  const [newProdLeafletNotes, setNewProdLeafletNotes] = useState('');

  const filtered = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      p.commercialName.toLowerCase().includes(q) ||
      p.activeIngredient.toLowerCase().includes(q) ||
      p.manufacturer.toLowerCase().includes(q) ||
      p.actionMechanism.toLowerCase().includes(q);
    const matchClass = selectedClass === 'todos' || p.agrochemicalClass === selectedClass;
    return matchSearch && matchClass;
  });

  const handleSaveCustomProduct = () => {
    if (!newProdName || !newProdAi) return;
    const custom: TankMixProduct = {
      id: `custom_${Date.now()}`,
      commercialName: newProdName,
      activeIngredient: newProdAi,
      concentration: 'N/A',
      formulation: newProdForm,
      agrochemicalClass: newProdClass,
      chemicalGroup: 'Diversos',
      actionMechanism: 'Não especificado',
      manufacturer: newProdManufacturer || 'Genérico',
      mapaRegistration: 'Isento/Cadastrado',
      defaultDose: newProdDose,
      doseUnit: newProdDoseUnit,
      targetPests: ['Alvos agronômicos cadastrados'],
      registeredCrops: ['Culturas agrícolas'],
      optimalPhRange: { min: 5.0, max: 6.5 },
      hydrolysisRiskHighPh: false,
      cationBindingRisk: false,
      mixingOrderStep:
        newProdForm === 'WP' || newProdForm === 'WG'
          ? 2
          : newProdForm === 'SC'
          ? 3
          : newProdForm === 'SL'
          ? 5
          : 6,
      safetyIntervalDays: 14,
      toxicologicalClass: 'IV - Pouco Tóxico',
      environmentalHazard: 'III - Perigoso',
      leafletNotes: newProdLeafletNotes || 'Produto cadastrado pelo usuário.',
      ppeRequired: ['Luvas de nitrila', 'Óculos de proteção', 'Máscara com filtro'],
    };

    onAddCustomProduct(custom);
    setShowAddModal(false);
    setNewProdName('');
    setNewProdAi('');
    setNewProdManufacturer('');
    setNewProdLeafletNotes('');
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho e Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            Banco Técnico de Defensivos e Adjuvantes
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
            Exibindo {filtered.length} de {(products || []).length} insumos cadastrados
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>Cadastrar Produto</span>
        </button>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome comercial, ingrediente ativo, mecanismo (HRAC/FRAC/IRAC) ou fabricante..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="inline-flex flex-wrap items-center gap-0.5 p-0.5 bg-slate-100 dark:bg-zinc-800 rounded-lg">
          {CLASS_OPTIONS.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedClass(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedClass === cat.id
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grade de Produtos */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
          Nenhum defensivo encontrado para os filtros selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => (
            <div
              key={product.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-xl p-4 transition-colors flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                      {product.commercialName}
                    </h3>
                    <span className="text-[11px] font-mono font-semibold text-slate-600 dark:text-zinc-400 shrink-0">
                      {product.formulation}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {product.activeIngredient}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 capitalize">
                    {product.agrochemicalClass.replace('_', ' ')} · {product.manufacturer}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400 dark:text-zinc-500 shrink-0">Mecanismo</span>
                    <span className="text-right truncate" title={product.actionMechanism}>
                      {product.actionMechanism}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400 dark:text-zinc-500 shrink-0">Dose padrão</span>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                      {product.defaultDose} {product.doseUnit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProductDetail(product)}
                  className="h-7 px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>Bula &amp; Ficha</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectProductForLab(product)}
                  className="h-7 px-2.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                  <span>Usar no Tanque</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Bula e Ficha Técnica */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden max-h-[88vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                  <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    {selectedProductDetail.formulation}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{selectedProductDetail.agrochemicalClass.replace('_', ' ')}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                  {selectedProductDetail.commercialName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductDetail(null)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 md:grid-cols-3 divide-y md:divide-y-0 divide-x divide-slate-100 dark:divide-zinc-800">
                <div className="p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Ingrediente ativo</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block">
                    {selectedProductDetail.activeIngredient}
                  </span>
                </div>
                <div className="p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Mecanismo de ação</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 mt-0.5 block">
                    {selectedProductDetail.actionMechanism}
                  </span>
                </div>
                <div className="p-3">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Registro MAPA</span>
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5 block">
                    {selectedProductDetail.mapaRegistration}
                  </span>
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Faixa ideal de pH</span>
                  <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                    {selectedProductDetail.optimalPhRange.min} a {selectedProductDetail.optimalPhRange.max}
                  </span>
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Carência / Reentrada</span>
                  <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5 block">
                    {selectedProductDetail.safetyIntervalDays} dias
                  </span>
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Classe toxicológica</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-400 mt-0.5 block">
                    {selectedProductDetail.toxicologicalClass}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/30">
                <span className="font-semibold text-amber-900 dark:text-amber-200 block mb-1">
                  Recomendações no preparo de calda
                </span>
                <p className="leading-relaxed text-amber-950 dark:text-amber-100/90">
                  {selectedProductDetail.leafletNotes}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Equipamentos de Proteção Individual (EPI)</span>
                </span>
                <div className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {selectedProductDetail.ppeRequired.join(' · ')}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedProductDetail(null)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectProductForLab(selectedProductDetail);
                  setSelectedProductDetail(null);
                }}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Adicionar ao Laboratório</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cadastrar Novo Produto */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden max-h-[88vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Cadastrar Defensivo no Banco Local
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 inline-flex items-center justify-center cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Nome comercial *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Produto X 500 SC"
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Ingrediente ativo *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Tebuconazol (200 g/L)"
                    value={newProdAi}
                    onChange={e => setNewProdAi(e.target.value)}
                    className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Formulação
                  </label>
                  <select
                    value={newProdForm}
                    onChange={e => setNewProdForm(e.target.value as PesticideFormulationCode)}
                    className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="EC">EC (Concentrado Emulsionável)</option>
                    <option value="SC">SC (Suspensão Concentrada)</option>
                    <option value="WG">WG (Grânulos Dispersíveis em Água)</option>
                    <option value="WP">WP (Pó Molhável)</option>
                    <option value="SL">SL (Concentrado Solúvel)</option>
                    <option value="OD">OD (Dispersão em Óleo)</option>
                    <option value="CS">CS (Suspensão de Encapsulado)</option>
                    <option value="ME">ME (Microemulsão)</option>
                    <option value="EW">EW (Emulsão Óleo em Água)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Classe de uso
                  </label>
                  <select
                    value={newProdClass}
                    onChange={e => setNewProdClass(e.target.value as AgrochemicalClass)}
                    className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="herbicida">Herbicida</option>
                    <option value="fungicida">Fungicida</option>
                    <option value="inseticida">Inseticida</option>
                    <option value="acaricida">Acaricida</option>
                    <option value="adjuvante">Adjuvante</option>
                    <option value="fertilizante_foliar">Fertilizante Foliar</option>
                    <option value="condicionador_calda">Condicionador de Calda</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Dose padrão
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step={0.1}
                      value={newProdDose}
                      onChange={e => setNewProdDose(Number(e.target.value))}
                      className="w-24 h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                    <select
                      value={newProdDoseUnit}
                      onChange={e => setNewProdDoseUnit(e.target.value as TankMixProduct['doseUnit'])}
                      className="flex-1 h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="L/ha">L/ha</option>
                      <option value="kg/ha">kg/ha</option>
                      <option value="mL/ha">mL/ha</option>
                      <option value="g/ha">g/ha</option>
                      <option value="mL/100L">mL/100L</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Fabricante
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Bayer / Syngenta / UPL"
                    value={newProdManufacturer}
                    onChange={e => setNewProdManufacturer(e.target.value)}
                    className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Informações de bula e cuidados
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva cuidados de mistura, alvos e compatibilidades conhecidas..."
                  value={newProdLeafletNotes}
                  onChange={e => setNewProdLeafletNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustomProduct}
                disabled={!newProdName || !newProdAi}
                className="h-8 px-3.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 cursor-pointer"
              >
                Salvar Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
