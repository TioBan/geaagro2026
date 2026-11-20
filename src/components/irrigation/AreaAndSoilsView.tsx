import React, { useEffect, useState } from 'react';
import { SoilPhysicsProfile, CropWaterRequirement } from '../../types/irrigation';
import { Layers, Sprout, Plus, Search, X } from 'lucide-react';
import { IRRIGATION_INPUT_CLASS, IRRIGATION_LABEL_CLASS } from './irrigationUi';

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

  // Soil modal state
  const [isSoilModalOpen, setIsSoilModalOpen] = useState(false);
  const [soilName, setSoilName] = useState('');
  const [texturalClass, setTexturalClass] = useState<SoilPhysicsProfile['texturalClass']>('Argilosa');
  const [clay, setClay] = useState(60);
  const [silt, setSilt] = useState(15);
  const [sand, setSand] = useState(25);
  const [density, setDensity] = useState(1.2);
  const [fieldCapacity, setFieldCapacity] = useState(32);
  const [pmp, setPmp] = useState(18);
  const [rawPct, setRawPct] = useState(50);

  // Crop modal state (wires onAddCrop cleanly)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropName, setCropName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [cropGroup, setCropGroup] = useState<CropWaterRequirement['group']>('Grãos');
  const [rootMin, setRootMin] = useState(20);
  const [rootMax, setRootMax] = useState(60);
  const [totalWaterMm, setTotalWaterMm] = useState(550);
  const [intervalDays, setIntervalDays] = useState(3);
  const [kyFactor, setKyFactor] = useState(0.95);
  const [kcPeak, setKcPeak] = useState(1.15);

  useEffect(() => {
    if (!isSoilModalOpen && !isCropModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSoilModalOpen(false);
        setIsCropModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSoilModalOpen, isCropModalOpen]);

  const handleCreateSoil = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soilName.trim()) return;

    const cad = Math.max(0.1, ((fieldCapacity - pmp) / 10) * density);
    const newSoil: SoilPhysicsProfile = {
      id: `soil-${Date.now()}`,
      name: soilName.trim(),
      texturalClass,
      clayPercent: clay,
      siltPercent: silt,
      sandPercent: sand,
      bulkDensity: density,
      fieldCapacity,
      permanentWiltingPoint: pmp,
      availableWaterCapacity: Math.round(cad * 100) / 100,
      readilyAvailableWaterPct: rawPct,
      basicInfiltrationRate: texturalClass === 'Arenosa' ? 55 : texturalClass === 'Argilosa' ? 22 : 32,
      hydraulicConductivity: 3.5,
    };

    onAddSoil(newSoil);
    setIsSoilModalOpen(false);
    setSoilName('');
  };

  const handleCreateCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim()) return;

    const newCrop: CropWaterRequirement = {
      id: `custom-crop-${Date.now()}`,
      cropName: cropName.trim(),
      scientificName: scientificName.trim() || 'Cultura cadastrada',
      group: cropGroup,
      rootDepthMinCm: rootMin,
      rootDepthMaxCm: rootMax,
      totalWaterRequirementMm: totalWaterMm,
      irrigationIntervalDays: intervalDays,
      deficitSensitivityKy: kyFactor,
      stages: [
        { stageName: 'Estabelecimento / Inicial', durationDays: 20, kc: 0.45 },
        { stageName: 'Desenvolvimento Vegetativo', durationDays: 35, kc: 0.80 },
        { stageName: 'Floração / Enchimento', durationDays: 45, kc: kcPeak },
        { stageName: 'Maturação', durationDays: 25, kc: 0.60 },
      ],
    };

    onAddCrop(newCrop);
    setIsCropModalOpen(false);
    setCropName('');
    setScientificName('');
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredSoils = soils.filter(
    (s) => !q || s.name.toLowerCase().includes(q) || s.texturalClass.toLowerCase().includes(q)
  );
  const filteredCrops = crops.filter(
    (c) =>
      !q ||
      c.cropName.toLowerCase().includes(q) ||
      c.scientificName.toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 self-start">
          <button
            type="button"
            onClick={() => setActiveSubTab('soils')}
            className={`h-7 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'soils'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Solos Hídricos ({soils.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('crops')}
            className={`h-7 px-3 rounded-md text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeSubTab === 'crops'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            Culturas &amp; Kc ({crops.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por nome, classe ou cultura..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {activeSubTab === 'soils' ? (
            <button
              type="button"
              onClick={() => setIsSoilModalOpen(true)}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Solo
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsCropModalOpen(true)}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Cultura
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Soils */}
      {activeSubTab === 'soils' && (
        filteredSoils.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {soils.length === 0 ? 'Nenhum perfil de solo cadastrado' : 'Nenhum solo encontrado para a busca'}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Cadastre a capacidade de campo (CC), ponto de murcha (PMP) e densidade para calcular CAD e AFD com precisão.
            </p>
            {soils.length === 0 && (
              <button
                type="button"
                onClick={() => setIsSoilModalOpen(true)}
                className="mt-2 h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Cadastrar Perfil de Solo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSoils.map((soil) => (
              <div
                key={soil.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3"
              >
                <div>
                  <span className="text-[11px] font-medium text-sky-700 dark:text-sky-400">
                    {soil.texturalClass}
                  </span>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100 mt-0.5">
                    {soil.name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs tabular-nums">
                  <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">CAD</span>
                    <strong className="text-slate-900 dark:text-zinc-100">{soil.availableWaterCapacity} mm/cm</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Infiltração (IB)</span>
                    <strong className="text-slate-900 dark:text-zinc-100">{soil.basicInfiltrationRate} mm/h</strong>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs tabular-nums">
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 dark:text-zinc-400">CC / PMP</span>
                    <strong className="text-slate-900 dark:text-zinc-100">
                      {soil.fieldCapacity}% / {soil.permanentWiltingPoint}%
                    </strong>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 dark:text-zinc-400">Argila / Silte / Areia</span>
                    <strong className="text-slate-800 dark:text-zinc-200">
                      {soil.clayPercent}% / {soil.siltPercent}% / {soil.sandPercent}%
                    </strong>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 dark:text-zinc-400">Densidade / Fator f</span>
                    <strong className="text-slate-900 dark:text-zinc-100">
                      {soil.bulkDensity} g/cm³ · {soil.readilyAvailableWaterPct}%
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tab 2: Crops */}
      {activeSubTab === 'crops' && (
        filteredCrops.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {crops.length === 0 ? 'Nenhuma cultura cadastrada' : 'Nenhuma cultura encontrada para a busca'}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Cadastre culturas com profundidade radicular e coeficientes Kc por estádio para uso no cálculo de lâminas.
            </p>
            {crops.length === 0 && (
              <button
                type="button"
                onClick={() => setIsCropModalOpen(true)}
                className="mt-2 h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Cadastrar Cultura
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCrops.map((crop) => (
              <div
                key={crop.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      {crop.group}
                    </span>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
                      {crop.cropName}{' '}
                      <span className="text-xs font-normal italic text-slate-500 dark:text-zinc-400">
                        ({crop.scientificName})
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs tabular-nums">
                  <div className="bg-slate-50 dark:bg-zinc-950 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Raízes (Z)</span>
                    <strong className="text-slate-900 dark:text-zinc-100">
                      {crop.rootDepthMinCm}–{crop.rootDepthMaxCm} cm
                    </strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-950 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Demanda</span>
                    <strong className="text-sky-700 dark:text-sky-400">{crop.totalWaterRequirementMm} mm</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-950 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Fator Ky</span>
                    <strong className="text-amber-700 dark:text-amber-400">{crop.deficitSensitivityKy}</strong>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800 border-t border-slate-100 dark:border-zinc-800 pt-2 text-xs">
                  {crop.stages.map((st, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 gap-2">
                      <span className="text-slate-600 dark:text-zinc-300 truncate">
                        {st.stageName} ({st.durationDays} d)
                      </span>
                      <strong className="tabular-nums text-emerald-700 dark:text-emerald-400 shrink-0">
                        Kc {st.kc.toFixed(2)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal: New Soil */}
      {isSoilModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
          onClick={() => setIsSoilModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Cadastrar Perfil de Solo Hídrico"
        >
          <form
            onSubmit={handleCreateSoil}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Cadastrar Perfil de Solo Hídrico
              </h3>
              <button
                type="button"
                onClick={() => setIsSoilModalOpen(false)}
                aria-label="Fechar modal"
                className="h-7 w-7 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Nome do Perfil de Solo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Latossolo Vermelho Amarelo — Gleba B"
                  value={soilName}
                  onChange={(e) => setSoilName(e.target.value)}
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Classe Textural</label>
                  <select
                    value={texturalClass}
                    onChange={(e) =>
                      setTexturalClass(e.target.value as SoilPhysicsProfile['texturalClass'])
                    }
                    className={IRRIGATION_INPUT_CLASS}
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
                  <label className={IRRIGATION_LABEL_CLASS}>Densidade (g/cm³)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={density}
                    onChange={(e) => setDensity(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>CC (%)</label>
                  <input
                    type="number"
                    value={fieldCapacity}
                    onChange={(e) => setFieldCapacity(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>PMP (%)</label>
                  <input
                    type="number"
                    value={pmp}
                    onChange={(e) => setPmp(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Fator f (%)</label>
                  <input
                    type="number"
                    value={rawPct}
                    onChange={(e) => setRawPct(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Argila (%)</label>
                  <input
                    type="number"
                    value={clay}
                    onChange={(e) => setClay(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Silte (%)</label>
                  <input
                    type="number"
                    value={silt}
                    onChange={(e) => setSilt(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Areia (%)</label>
                  <input
                    type="number"
                    value={sand}
                    onChange={(e) => setSand(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSoilModalOpen(false)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
              >
                Salvar Solo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: New Crop */}
      {isCropModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
          onClick={() => setIsCropModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Cadastrar Cultura Agrícola"
        >
          <form
            onSubmit={handleCreateCrop}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Cadastrar Cultura &amp; Parâmetros Hídricos
              </h3>
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                aria-label="Fechar modal"
                className="h-7 w-7 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Nome da Cultura *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Feijão Carioca"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Nome Científico</label>
                  <input
                    type="text"
                    placeholder="Ex: Phaseolus vulgaris"
                    value={scientificName}
                    onChange={(e) => setScientificName(e.target.value)}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Grupo</label>
                  <select
                    value={cropGroup}
                    onChange={(e) => setCropGroup(e.target.value as CropWaterRequirement['group'])}
                    className={IRRIGATION_INPUT_CLASS}
                  >
                    <option value="Grãos">Grãos</option>
                    <option value="Hortaliças">Hortaliças</option>
                    <option value="Frutíferas">Frutíferas</option>
                    <option value="Forragens">Forragens</option>
                    <option value="Fibras">Fibras</option>
                    <option value="Raízes/Tubérculos">Raízes/Tubérculos</option>
                  </select>
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Exigência Total (mm)</label>
                  <input
                    type="number"
                    value={totalWaterMm}
                    onChange={(e) => setTotalWaterMm(Number(e.target.value))}
                    className={IRRIGATION_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Raiz Mín (cm)</label>
                  <input type="number" value={rootMin} onChange={(e) => setRootMin(Number(e.target.value))} className={IRRIGATION_INPUT_CLASS} />
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Raiz Máx (cm)</label>
                  <input type="number" value={rootMax} onChange={(e) => setRootMax(Number(e.target.value))} className={IRRIGATION_INPUT_CLASS} />
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Kc Pico</label>
                  <input type="number" step="0.05" value={kcPeak} onChange={(e) => setKcPeak(Number(e.target.value))} className={IRRIGATION_INPUT_CLASS} />
                </div>
                <div>
                  <label className={IRRIGATION_LABEL_CLASS}>Turno (dias)</label>
                  <input type="number" value={intervalDays} onChange={(e) => setIntervalDays(Number(e.target.value))} className={IRRIGATION_INPUT_CLASS} />
                </div>
              </div>

              <div>
                <label className={IRRIGATION_LABEL_CLASS}>Sensibilidade ao Déficit (Ky)</label>
                <input
                  type="number"
                  step="0.05"
                  value={kyFactor}
                  onChange={(e) => setKyFactor(Number(e.target.value))}
                  className={IRRIGATION_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCropModalOpen(false)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
              >
                Salvar Cultura
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AreaAndSoilsView;
