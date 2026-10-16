import React, { useState } from 'react';
import { SoilPhysicsProfile, CropWaterRequirement } from '../../types/irrigation';
import { Layers, Sprout, Plus, Search, MapPin, Database, Info, Filter } from 'lucide-react';

interface Props {
  soils: SoilPhysicsProfile[];
  crops: CropWaterRequirement[];
  onAddSoil: (soil: SoilPhysicsProfile) => void;
  onAddCrop: (crop: CropWaterRequirement) => void;
}

export const AreaAndSoilsView: React.FC<Props> = ({
  soils,
  crops,
  onAddSoil,
  onAddCrop,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'soils' | 'crops'>('soils');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for new soil
  const [soilName, setSoilName] = useState('');
  const [texturalClass, setTexturalClass] = useState<SoilPhysicsProfile['texturalClass']>('Argilosa');
  const [clay, setClay] = useState(60);
  const [silt, setSilt] = useState(15);
  const [sand, setSand] = useState(25);
  const [density, setDensity] = useState(1.2);
  const [fieldCapacity, setFieldCapacity] = useState(32);
  const [pmp, setPmp] = useState(18);
  const [rawPct, setRawPct] = useState(50);
  const [isSoilModalOpen, setIsSoilModalOpen] = useState(false);

  const handleCreateSoil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soilName) return;

    const cad = ((fieldCapacity - pmp) / 10) * density;
    const newSoil: SoilPhysicsProfile = {
      id: `soil-${Date.now()}`,
      name: soilName,
      texturalClass,
      clayPercent: clay,
      siltPercent: silt,
      sandPercent: sand,
      bulkDensity: density,
      fieldCapacity,
      permanentWiltingPoint: pmp,
      availableWaterCapacity: Math.round(cad * 100) / 100,
      readilyAvailableWaterPct: rawPct,
      basicInfiltrationRate: 25,
      hydraulicConductivity: 3.5,
    };

    onAddSoil(newSoil);
    setIsSoilModalOpen(false);
    setSoilName('');
  };

  const filteredSoils = soils.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.texturalClass.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCrops = crops.filter(c =>
    c.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Sub-header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('soils')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'soils'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Banco de Solos Hídricos ({soils.length})
          </button>

          <button
            onClick={() => setActiveSubTab('crops')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'crops'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
            }`}
          >
            <Sprout className="w-4 h-4" />
            Catálogo de Culturas (&gt;200)
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, classe ou cultura..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {activeSubTab === 'soils' && (
            <button
              onClick={() => setIsSoilModalOpen(true)}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Novo Solo
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Banco de Solos */}
      {activeSubTab === 'soils' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSoils.map(soil => (
            <div
              key={soil.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-xs space-y-4 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 rounded text-[10px] font-black uppercase tracking-wider">
                    {soil.texturalClass}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1">
                    {soil.name}
                  </h3>
                </div>
                <Database className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              </div>

              {/* Parâmetros Físico-Hídricos principais */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">CAD (Água Disp.)</span>
                  <strong className="text-slate-900 dark:text-white text-sm">{soil.availableWaterCapacity} mm/cm</strong>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">Infiltração (IB)</span>
                  <strong className="text-slate-900 dark:text-white text-sm">{soil.basicInfiltrationRate} mm/h</strong>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-300 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between">
                  <span>Capacidade de Campo (CC):</span>
                  <strong className="text-slate-900 dark:text-white">{soil.fieldCapacity}%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Ponto de Murcha (PMP):</span>
                  <strong className="text-slate-900 dark:text-white">{soil.permanentWiltingPoint}%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Granulometria (Argila/Silte/Areia):</span>
                  <strong className="text-cyan-600 dark:text-cyan-400">{soil.clayPercent}% / {soil.siltPercent}% / {soil.sandPercent}%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Densidade do Solo (Ds):</span>
                  <strong className="text-slate-900 dark:text-white">{soil.bulkDensity} g/cm³</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Catálogo de Culturas e Kc */}
      {activeSubTab === 'crops' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCrops.map(crop => (
            <div
              key={crop.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-xs space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                    {crop.group}
                  </span>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">
                    {crop.cropName} <span className="text-xs font-normal text-slate-400 italic">({crop.scientificName})</span>
                  </h3>
                </div>
                <Sprout className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Raízes Z (cm)</span>
                  <strong className="text-slate-900 dark:text-white">{crop.rootDepthMinCm} - {crop.rootDepthMaxCm} cm</strong>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Exigência Total</span>
                  <strong className="text-cyan-600 dark:text-cyan-400">{crop.totalWaterRequirementMm} mm</strong>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Sensib. Ky</span>
                  <strong className="text-amber-600 dark:text-amber-400">{crop.deficitSensitivityKy}</strong>
                </div>
              </div>

              {/* Tabela de Estádios e Kc */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">Estádios Fenológicos & Coeficiente Kc:</span>
                <div className="space-y-1">
                  {crop.stages.map((st, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50 dark:bg-zinc-950/50 rounded-lg border border-slate-100 dark:border-zinc-800/80"
                    >
                      <span className="text-slate-700 dark:text-zinc-300">{st.stageName} ({st.durationDays} dias)</span>
                      <strong className="text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800">
                        Kc = {st.kc}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Adicionar Novo Solo */}
      {isSoilModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full p-6 space-y-6 border border-slate-200 dark:border-zinc-800 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Cadastrar Perfil de Solo Hídrico</h3>
              <button onClick={() => setIsSoilModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateSoil} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Nome do Perfil de Solo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Latossolo Vermelho Amarelo - Gleba B"
                  value={soilName}
                  onChange={e => setSoilName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Classe Textural</label>
                  <select
                    value={texturalClass}
                    onChange={e => setTexturalClass(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="Argilosa">Argilosa</option>
                    <option value="Muito Argilosa">Muito Argilosa</option>
                    <option value="Franca">Franca</option>
                    <option value="Franco-Argilosa">Franco-Argilosa</option>
                    <option value="Franco-Arenosa">Franco-Arenosa</option>
                    <option value="Arenosa">Arenosa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Densidade do Solo (g/cm³)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={density}
                    onChange={e => setDensity(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Capacidade de Campo CC (%)</label>
                  <input
                    type="number"
                    value={fieldCapacity}
                    onChange={e => setFieldCapacity(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">Ponto de Murcha PMP (%)</label>
                  <input
                    type="number"
                    value={pmp}
                    onChange={e => setPmp(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSoilModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold"
                >
                  Salvar Solo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
