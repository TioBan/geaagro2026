import React, { useState } from 'react';
import {
  Layers,
  Search,
  BookOpen,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sparkles,
  Droplets,
  HelpCircle,
  Filter,
  ShieldAlert,
  PackageCheck,
} from 'lucide-react';
import { FORMULATION_DATABASE, TANKMIX_PRODUCTS_DATABASE } from '../../data/tankMixData';
import { PesticideFormulationCode, FormulationInfo } from '../../types/tankMix';

export const TankMixFormulationsLibraryView: React.FC = () => {
  const [selectedFormulation, setSelectedFormulation] = useState<FormulationInfo>(FORMULATION_DATABASE[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'solido' | 'liquido' | 'encapsulado' | 'oleo'>('all');

  const filtered = FORMULATION_DATABASE.filter(f => {
    const matchesSearch =
      f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (categoryFilter === 'solido') {
      return ['WP', 'WG', 'DF', 'SP', 'SG', 'WSB'].includes(f.code);
    }
    if (categoryFilter === 'encapsulado') {
      return ['CS', 'ZC', 'ME'].includes(f.code);
    }
    if (categoryFilter === 'oleo') {
      return ['EC', 'OD', 'EW', 'SE'].includes(f.code);
    }
    if (categoryFilter === 'liquido') {
      return ['SC', 'SL', 'AS', 'DC', 'FS'].includes(f.code);
    }
    return true;
  });

  const matchingProducts = TANKMIX_PRODUCTS_DATABASE.filter(
    p => p.formulation === selectedFormulation.code
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Biblioteca Técnica Agronômica
            </span>
            <span className="text-xs text-gray-500">• Comportamento Físico de Formulações</span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mt-1">Biblioteca de Formulações de Defensivos</h1>
          <p className="text-xs text-gray-600 mt-1">
            Conheça as características físico-químicas de cada sigla (EC, SC, WG, WP, SL, OD, etc.), como se comportam na água e os cuidados obrigatórios no preparo da calda.
          </p>
        </div>
      </div>

      {/* Main Dual Grid: Left Selector List | Right Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar sigla ou tipo (ex: ZC, CS, WG)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Quick category filter tags */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'solido', label: 'Sólidos' },
                { id: 'liquido', label: 'Líquidos' },
                { id: 'oleo', label: 'Óleos/Emulsões' },
                { id: 'encapsulado', label: 'Microencapsulados' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as any)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${
                    categoryFilter === cat.id
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 max-h-[520px] overflow-y-auto">
              {filtered.map(f => {
                const isSelected = selectedFormulation.code === f.code;
                return (
                  <button
                    key={f.code}
                    onClick={() => setSelectedFormulation(f)}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between border ${
                      isSelected
                        ? 'bg-purple-50 border-purple-400 shadow-xs'
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                          {f.code}
                        </span>
                        <span className="text-xs font-bold text-gray-900">{f.fullName.split('(')[0]}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">{f.mixingOrderGroup}</div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold">Passo {f.mixingOrderIndex}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Detail Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            {/* Header of selected */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-black bg-purple-600 text-white px-3 py-1 rounded-lg">
                    Formulação {selectedFormulation.code}
                  </span>
                  <span className="text-xs text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
                    {selectedFormulation.mixingOrderGroup}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-gray-900 mt-2">{selectedFormulation.fullName}</h2>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">{selectedFormulation.description}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center min-w-[140px] shrink-0">
                <span className="text-[10px] text-gray-500 uppercase font-semibold block">Agitação Recomendada</span>
                <span className="text-xs font-extrabold text-purple-700 mt-0.5 block">
                  {selectedFormulation.recommendedAgitation}
                </span>
              </div>
            </div>

            {/* Technical Specifications Grid: Water Behavior & Filter Mesh */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Behavior in water */}
              <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-cyan-50 p-3.5 rounded-xl border border-blue-200 text-blue-950">
                <h3 className="font-bold text-xs text-blue-900 flex items-center gap-2 mb-1">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  Comportamento Físico em Água
                </h3>
                <p className="text-xs text-blue-900 leading-relaxed">{selectedFormulation.waterBehavior}</p>
              </div>

              {/* Filter mesh recommendation */}
              <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 text-amber-950">
                <h3 className="font-bold text-xs text-amber-900 flex items-center gap-1.5 mb-1">
                  <Filter className="w-4 h-4 text-amber-700" />
                  Filtro Recomendado
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                  {selectedFormulation.filterMeshRecommendation || 'Filtro padrão Malha 50 a 80 mesh.'}
                </p>
              </div>
            </div>

            {/* Carrier compatibility notes (if available) */}
            {selectedFormulation.carrierCompatibilityNotes && (
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 text-purple-950">
                <h3 className="font-bold text-xs text-purple-900 flex items-center gap-1.5 mb-1">
                  <ShieldAlert className="w-4 h-4 text-purple-700" />
                  Compatibilidade com Veículo & Óleo
                </h3>
                <p className="text-xs text-purple-900 leading-relaxed">
                  {selectedFormulation.carrierCompatibilityNotes}
                </p>
              </div>
            )}

            {/* Advantages and Precautions Dual Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Advantages */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Vantagens Agronômicas
                </h3>
                <ul className="space-y-1.5 text-xs text-emerald-950">
                  {selectedFormulation.advantages.map((adv, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Precautions */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Cuidados no Preparo & Restrições
                </h3>
                <ul className="space-y-1.5 text-xs text-amber-950">
                  {selectedFormulation.precautions.map((prec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{prec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Mixing Sequence Info */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center">
                  {selectedFormulation.mixingOrderIndex}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Posição Oficial na Ordem de Mistura (WALES / DAMES)</div>
                  <div className="text-[11px] text-gray-500">
                    Inserir no grupo de <strong>{selectedFormulation.mixingOrderGroup}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Benchmark products registered in TankMix with this formulation */}
            {matchingProducts.length > 0 && (
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <h4 className="text-xs font-extrabold text-gray-800 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-purple-600" />
                  Exemplos Comerciais no TankMix com formulação {selectedFormulation.code}:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {matchingProducts.map(p => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-lg border border-gray-200 bg-gray-50/50 flex flex-col justify-between text-xs"
                    >
                      <div className="font-bold text-gray-900 flex items-center justify-between">
                        <span>{p.commercialName}</span>
                        <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded font-bold">
                          {p.formulation}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-600 mt-0.5">{p.activeIngredient}</div>
                      <div className="text-[10px] text-gray-400 mt-1 capitalize">
                        {p.agrochemicalClass.replace('_', ' ')} • {p.manufacturer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
