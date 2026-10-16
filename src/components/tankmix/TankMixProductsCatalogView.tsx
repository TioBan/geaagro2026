import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  FlaskConical,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle2,
  Bookmark,
  ChevronDown,
} from 'lucide-react';
import { TankMixProduct, AgrochemicalClass, PesticideFormulationCode } from '../../types/tankMix';
import { TANKMIX_PRODUCTS_DATABASE } from '../../data/tankMixData';

interface Props {
  products: TankMixProduct[];
  onAddCustomProduct: (product: TankMixProduct) => void;
  onSelectProductForLab: (product: TankMixProduct) => void;
}

export const TankMixProductsCatalogView: React.FC<Props> = ({
  products,
  onAddCustomProduct,
  onSelectProductForLab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('todos');
  const [selectedProductDetail, setSelectedProductDetail] = useState<TankMixProduct | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Custom Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdAi, setNewProdAi] = useState('');
  const [newProdConc, setNewProdConc] = useState('');
  const [newProdForm, setNewProdForm] = useState<PesticideFormulationCode>('SC');
  const [newProdClass, setNewProdClass] = useState<AgrochemicalClass>('herbicida');
  const [newProdGroup, setNewProdGroup] = useState('');
  const [newProdMechanism, setNewProdMechanism] = useState('');
  const [newProdManufacturer, setNewProdManufacturer] = useState('');
  const [newProdMapa, setNewProdMapa] = useState('');
  const [newProdDose, setNewProdDose] = useState<number>(1.0);
  const [newProdDoseUnit, setNewProdDoseUnit] = useState<TankMixProduct['doseUnit']>('L/ha');
  const [newProdGrace, setNewProdGrace] = useState<number>(14);
  const [newProdLeafletNotes, setNewProdLeafletNotes] = useState('');

  const filtered = products.filter(p => {
    const matchSearch =
      p.commercialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.activeIngredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.actionMechanism.toLowerCase().includes(searchQuery.toLowerCase());
    const matchClass = selectedClass === 'todos' || p.agrochemicalClass === selectedClass;
    return matchSearch && matchClass;
  });

  const handleSaveCustomProduct = () => {
    if (!newProdName || !newProdAi) return;
    const custom: TankMixProduct = {
      id: `custom_${Date.now()}`,
      commercialName: newProdName,
      activeIngredient: newProdAi,
      concentration: newProdConc || 'N/A',
      formulation: newProdForm,
      agrochemicalClass: newProdClass,
      chemicalGroup: newProdGroup || 'Diversos',
      actionMechanism: newProdMechanism || 'Não especificado',
      manufacturer: newProdManufacturer || 'Genérico',
      mapaRegistration: newProdMapa || 'Isento/Cadastrado',
      defaultDose: newProdDose,
      doseUnit: newProdDoseUnit,
      targetPests: ['Alvos agronômicos cadastrados'],
      registeredCrops: ['Culturas agrícolas'],
      optimalPhRange: { min: 5.0, max: 6.5 },
      hydrolysisRiskHighPh: false,
      cationBindingRisk: false,
      mixingOrderStep: newProdForm === 'WP' || newProdForm === 'WG' ? 2 : newProdForm === 'SC' ? 3 : newProdForm === 'SL' ? 5 : 6,
      safetyIntervalDays: newProdGrace,
      toxicologicalClass: 'IV - Pouco Tóxico',
      environmentalHazard: 'III - Perigoso',
      leafletNotes: newProdLeafletNotes || 'Produto cadastrado pelo usuário.',
      ppeRequired: ['Luvas de nitrila', 'Óculos de proteção', 'Máscara com filtro'],
    };

    onAddCustomProduct(custom);
    setShowAddModal(false);
    // Reset form
    setNewProdName('');
    setNewProdAi('');
    setNewProdConc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Banco Técnico de Insumos
            </span>
            <span className="text-xs text-gray-500">• {(products || []).length} Defensivos & Adjuvantes</span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mt-1">Catálogo de Produtos & Defensivos Agrícolas</h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Produto</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar por nome comercial, ingrediente ativo, mecanismo (HRAC/FRAC/IRAC) ou fabricante..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'herbicida', label: 'Herbicidas' },
              { id: 'fungicida', label: 'Fungicidas' },
              { id: 'inseticida', label: 'Inseticidas' },
              { id: 'adjuvante', label: 'Adjuvantes' },
              { id: 'fertilizante_foliar', label: 'Foliares' },
              { id: 'condicionador_calda', label: 'Condicionadores' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedClass(cat.id)}
                className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                  selectedClass === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(product => (
          <div
            key={product.id}
            className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-bold bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded">
                  {product.formulation}
                </span>
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full capitalize">
                  {product.agrochemicalClass.replace('_', ' ')}
                </span>
              </div>

              <h2 className="font-extrabold text-gray-900 text-sm">{product.commercialName}</h2>
              <div className="text-xs text-emerald-700 font-semibold mt-0.5">{product.activeIngredient}</div>

              <div className="mt-3 space-y-1 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400">Grupo/Mecanismo:</span> {product.actionMechanism}
                </div>
                <div>
                  <span className="text-gray-400">Fabricante:</span> {product.manufacturer}
                </div>
                <div>
                  <span className="text-gray-400">Dose Padrão:</span>{' '}
                  <strong className="text-gray-900">
                    {product.defaultDose} {product.doseUnit}
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedProductDetail(product)}
                className="text-xs font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Bula & Ficha</span>
              </button>

              <button
                onClick={() => onSelectProductForLab(product)}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Usar no Tanque</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Detalhes da Bula & Ficha Técnica */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 bg-gray-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-emerald-500 text-gray-950 px-2 py-0.5 rounded">
                    {selectedProductDetail.formulation}
                  </span>
                  <span className="text-xs text-gray-300 capitalize">{selectedProductDetail.agrochemicalClass}</span>
                </div>
                <h3 className="text-base font-extrabold text-white mt-1">{selectedProductDetail.commercialName}</h3>
              </div>
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Ingrediente Ativo</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{selectedProductDetail.activeIngredient}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Mecanismo de Ação</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{selectedProductDetail.actionMechanism}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Registro MAPA</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{selectedProductDetail.mapaRegistration}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Faixa Ideal de pH</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">
                    {selectedProductDetail.optimalPhRange.min} a {selectedProductDetail.optimalPhRange.max}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Intervalo de Reentrada / Carência</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{selectedProductDetail.safetyIntervalDays} dias</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Classe Toxicológica</span>
                  <span className="font-bold text-amber-700 mt-0.5 block">{selectedProductDetail.toxicologicalClass}</span>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold block mb-1">Recomendações e Cuidados no Preparo de Calda:</span>
                <p className="leading-relaxed text-amber-950">{selectedProductDetail.leafletNotes}</p>
              </div>

              <div>
                <span className="font-bold text-gray-700 block mb-1">Equipamentos de Proteção Individual (EPI):</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProductDetail.ppeRequired.map((epi, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200 font-medium">
                      🛡️ {epi}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => {
                  onSelectProductForLab(selectedProductDetail);
                  setSelectedProductDetail(null);
                }}
                className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-emerald-700 flex items-center gap-1.5"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Adicionar ao Laboratório Virtual</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Cadastrar Novo Produto Personalizado */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 text-base">Cadastrar Defensivo no Banco Local (Offline)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nome Comercial *</label>
                <input
                  type="text"
                  placeholder="Ex: Produto X 500 SC"
                  value={newProdName}
                  onChange={e => setNewProdName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Ingrediente Ativo *</label>
                <input
                  type="text"
                  placeholder="Ex: Tebuconazol (200 g/L)"
                  value={newProdAi}
                  onChange={e => setNewProdAi(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Formulação</label>
                <select
                  value={newProdForm}
                  onChange={e => setNewProdForm(e.target.value as PesticideFormulationCode)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <label className="text-xs font-bold text-gray-700 block mb-1">Classe de Uso</label>
                <select
                  value={newProdClass}
                  onChange={e => setNewProdClass(e.target.value as AgrochemicalClass)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <label className="text-xs font-bold text-gray-700 block mb-1">Dose Padrão</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step={0.1}
                    value={newProdDose}
                    onChange={e => setNewProdDose(Number(e.target.value))}
                    className="w-24 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                  />
                  <select
                    value={newProdDoseUnit}
                    onChange={e => setNewProdDoseUnit(e.target.value as TankMixProduct['doseUnit'])}
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
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
                <label className="text-xs font-bold text-gray-700 block mb-1">Fabricante</label>
                <input
                  type="text"
                  placeholder="Ex: Bayer / Syngenta / UPL"
                  value={newProdManufacturer}
                  onChange={e => setNewProdManufacturer(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Informações de Bula & Cuidados</label>
              <textarea
                rows={3}
                placeholder="Descreva cuidados de mistura, alvos e compatibilidades conhecidas..."
                value={newProdLeafletNotes}
                onChange={e => setNewProdLeafletNotes(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCustomProduct}
                disabled={!newProdName || !newProdAi}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
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
