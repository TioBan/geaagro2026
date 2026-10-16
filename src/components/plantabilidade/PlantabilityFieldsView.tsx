import React, { useState } from 'react';
import { PropertyField, CropType, SoilType, TillageSystem } from '../../types/plantability';
import { Layers, Plus, Save, MapPin, Calendar, Sprout, Building2 } from 'lucide-react';

interface Props {
  fields: PropertyField[];
  onSaveField: (field: PropertyField) => void;
}

export const PlantabilityFieldsView: React.FC<Props> = ({ fields, onSaveField }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<PropertyField>>({
    farmName: '',
    fieldCode: '',
    crop: 'Soja',
    cultivar: '',
    areaHa: undefined,
    soilType: 'Argiloso',
    tillageSystem: 'Plantio Direto',
    seedingDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fieldCode || !formData.farmName) return;

    const newField: PropertyField = {
      id: formData.id || `fld-${Date.now()}`,
      farmName: formData.farmName.trim(),
      fieldCode: formData.fieldCode.trim(),
      crop: (formData.crop as CropType) || 'Soja',
      cultivar: formData.cultivar ? formData.cultivar.trim() : 'Padrão',
      areaHa: Number(formData.areaHa) || 10,
      soilType: (formData.soilType as SoilType) || 'Argiloso',
      tillageSystem: (formData.tillageSystem as TillageSystem) || 'Plantio Direto',
      seedingDate: formData.seedingDate || new Date().toISOString().split('T')[0],
      notes: formData.notes?.trim()
    };

    onSaveField(newField);
    setShowModal(false);
    setFormData({
      farmName: '',
      fieldCode: '',
      crop: 'Soja',
      cultivar: '',
      areaHa: undefined,
      soilType: 'Argiloso',
      tillageSystem: 'Plantio Direto',
      seedingDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            Cadastro de Propriedade & Talhões Semeados
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Gestão das áreas agrícolas, tipo de solo, sistema de preparo, cultivares e datas de semeadura.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Talhão
        </button>
      </div>

      {/* Field Cards Grid or Empty State */}
      {(fields || []).length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-black text-stone-900 dark:text-white">Nenhum talhão cadastrado</h3>
            <p className="text-xs text-stone-500">
              Cadastre a sua fazenda e os talhões semeados para iniciar as avaliações de plantabilidade em campo.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeiro Talhão
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map(f => (
            <div key={f.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex justify-between items-start border-b border-stone-100 dark:border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                    {f.crop} • {f.cultivar}
                  </span>
                  <h3 className="text-lg font-black text-stone-900 dark:text-white mt-1.5">{f.fieldCode}</h3>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {f.farmName}
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                  {f.areaHa} ha
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-stone-600 dark:text-stone-300">
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Tipo de Solo</span>
                  <span className="font-bold text-stone-800 dark:text-stone-100">{f.soilType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Sistema</span>
                  <span className="font-bold text-stone-800 dark:text-stone-100">{f.tillageSystem}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Data Semeadura</span>
                  <span className="font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    {f.seedingDate}
                  </span>
                </div>
              </div>

              {f.notes && (
                <p className="text-[11px] text-stone-500 italic bg-stone-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-stone-100 dark:border-zinc-800">
                  "{f.notes}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl max-w-lg w-full space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Cadastrar Talhão para Avaliação de Semeadura
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Nome da Fazenda</label>
                  <input
                    type="text"
                    required
                    value={formData.farmName}
                    onChange={e => setFormData({ ...formData, farmName: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Código / Identificação Talhão</label>
                  <input
                    type="text"
                    required
                    value={formData.fieldCode}
                    onChange={e => setFormData({ ...formData, fieldCode: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Cultura</label>
                  <select
                    value={formData.crop}
                    onChange={e => setFormData({ ...formData, crop: e.target.value as CropType })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  >
                    <option value="Soja">Soja</option>
                    <option value="Milho">Milho</option>
                    <option value="Algodão">Algodão</option>
                    <option value="Feijão">Feijão</option>
                    <option value="Girassol">Girassol</option>
                    <option value="Sorgo">Sorgo</option>
                    <option value="Trigo">Trigo</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Cultivar / Híbrido</label>
                  <input
                    type="text"
                    value={formData.cultivar}
                    onChange={e => setFormData({ ...formData, cultivar: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Área do Talhão (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.areaHa}
                    onChange={e => setFormData({ ...formData, areaHa: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Tipo de Solo</label>
                  <select
                    value={formData.soilType}
                    onChange={e => setFormData({ ...formData, soilType: e.target.value as SoilType })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  >
                    <option value="Argiloso">Argiloso</option>
                    <option value="Arenoso">Arenoso</option>
                    <option value="Misto">Misto</option>
                    <option value="Franco-Argiloso">Franco-Argiloso</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Sistema de Cultivo</label>
                  <select
                    value={formData.tillageSystem}
                    onChange={e => setFormData({ ...formData, tillageSystem: e.target.value as TillageSystem })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  >
                    <option value="Plantio Direto">Plantio Direto</option>
                    <option value="Convencional">Convencional</option>
                    <option value="Mínimo">Mínimo</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Data da Semeadura</label>
                  <input
                    type="date"
                    value={formData.seedingDate}
                    onChange={e => setFormData({ ...formData, seedingDate: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-600 dark:text-stone-300">Observações de Campo</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-stone-200 dark:bg-zinc-800 text-stone-800 dark:text-stone-200 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar Talhão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
