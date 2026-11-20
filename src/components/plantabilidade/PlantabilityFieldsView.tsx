import React, { useState, useEffect } from 'react';
import { PropertyField, CropType, SoilType, TillageSystem } from '../../types/plantability';
import { Layers, Plus, Save, MapPin, Calendar, Building2, Pencil, Trash2, X } from 'lucide-react';

interface Props {
  fields: PropertyField[];
  onSaveField: (field: PropertyField) => void;
  onDeleteField?: (id: string) => void;
}

const createEmptyField = (): Partial<PropertyField> => ({
  farmName: '',
  fieldCode: '',
  crop: 'Soja',
  cultivar: '',
  areaHa: undefined,
  soilType: 'Argiloso',
  tillageSystem: 'Plantio Direto',
  seedingDate: new Date().toISOString().split('T')[0],
  municipio: '',
  estado: '',
  notes: ''
});

const inputClass =
  'w-full h-9 px-3 mt-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500';

export const PlantabilityFieldsView: React.FC<Props> = ({
  fields,
  onSaveField,
  onDeleteField
}) => {
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PropertyField>>(createEmptyField);

  useEffect(() => {
    if (!showModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showModal]);

  const openNewModal = () => {
    setFormData(createEmptyField());
    setShowModal(true);
  };

  const openEditModal = (field: PropertyField) => {
    setFormData({ ...field });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fieldCode?.trim() || !formData.farmName?.trim()) return;

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
      municipio: formData.municipio?.trim() || undefined,
      estado: formData.estado?.trim().toUpperCase() || undefined,
      latitude: formData.latitude,
      longitude: formData.longitude,
      notes: formData.notes?.trim()
    };

    onSaveField(newField);
    setShowModal(false);
    setFormData(createEmptyField());
  };

  const safeFields = (fields || []).filter(f => f && f.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Cadastro de Propriedade & Talhões Semeados</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Gestão de áreas agrícolas, tipo de solo, sistema de cultivo, cultivares e datas de semeadura.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Talhão</span>
        </button>
      </div>

      {/* Field Cards Grid or Empty State */}
      {safeFields.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Nenhum talhão cadastrado
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Cadastre a fazenda e os talhões semeados para vincular amostragens, mapa e laudos técnicos.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewModal}
            className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Primeiro Talhão</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {safeFields.map(f => (
            <div
              key={f.id}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 block truncate">
                    {f.crop} • {f.cultivar}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {f.fieldCode}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      {f.farmName}
                      {f.municipio ? ` • ${f.municipio}${f.estado ? `/${f.estado}` : ''}` : ''}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                    {f.areaHa} ha
                  </span>
                  <button
                    type="button"
                    onClick={() => openEditModal(f)}
                    title="Editar talhão"
                    className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {onDeleteField && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDeleteId(confirmDeleteId === f.id ? null : f.id)
                      }
                      title="Remover talhão"
                      className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {confirmDeleteId === f.id && onDeleteField && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs">
                  <span className="text-rose-700 dark:text-rose-300 font-medium">Excluir talhão?</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-[11px] font-medium cursor-pointer"
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteField(f.id);
                        setConfirmDeleteId(null);
                      }}
                      className="h-7 px-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-medium cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-zinc-500 block">
                    Tipo de Solo
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{f.soilType}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-zinc-500 block">
                    Sistema
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{f.tillageSystem}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-zinc-500 block">
                    Data Semeadura
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 inline-flex items-center gap-1 tabular-nums">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{f.seedingDate}</span>
                  </span>
                </div>
              </div>

              {f.notes && (
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/60 px-2.5 py-2 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                  {f.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{formData.id ? 'Editar Talhão' : 'Cadastrar Talhão para Semeadura'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Nome da Fazenda</label>
                  <input
                    type="text"
                    required
                    value={formData.farmName || ''}
                    onChange={e => setFormData({ ...formData, farmName: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Identificação do Talhão</label>
                  <input
                    type="text"
                    required
                    value={formData.fieldCode || ''}
                    onChange={e => setFormData({ ...formData, fieldCode: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Cultura</label>
                  <select
                    value={formData.crop || 'Soja'}
                    onChange={e => setFormData({ ...formData, crop: e.target.value as CropType })}
                    className={inputClass}
                  >
                    <option value="Soja">Soja</option>
                    <option value="Milho">Milho</option>
                    <option value="Algodão">Algodão</option>
                    <option value="Feijão">Feijão</option>
                    <option value="Girassol">Girassol</option>
                    <option value="Sorgo">Sorgo</option>
                    <option value="Trigo">Trigo</option>
                    <option value="Outra">Outra</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Cultivar / Híbrido</label>
                  <input
                    type="text"
                    value={formData.cultivar || ''}
                    onChange={e => setFormData({ ...formData, cultivar: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Área do Talhão (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.areaHa ?? ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        areaHa: e.target.value === '' ? undefined : Number(e.target.value)
                      })
                    }
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Tipo de Solo</label>
                  <select
                    value={formData.soilType || 'Argiloso'}
                    onChange={e => setFormData({ ...formData, soilType: e.target.value as SoilType })}
                    className={inputClass}
                  >
                    <option value="Argiloso">Argiloso</option>
                    <option value="Arenoso">Arenoso</option>
                    <option value="Misto">Misto</option>
                    <option value="Franco-Argiloso">Franco-Argiloso</option>
                    <option value="Siltoso">Siltoso</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Sistema de Cultivo</label>
                  <select
                    value={formData.tillageSystem || 'Plantio Direto'}
                    onChange={e =>
                      setFormData({ ...formData, tillageSystem: e.target.value as TillageSystem })
                    }
                    className={inputClass}
                  >
                    <option value="Plantio Direto">Plantio Direto</option>
                    <option value="Convencional">Convencional</option>
                    <option value="Mínimo">Mínimo</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Data da Semeadura</label>
                  <input
                    type="date"
                    value={formData.seedingDate || ''}
                    onChange={e => setFormData({ ...formData, seedingDate: e.target.value })}
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Município (opcional)</label>
                  <input
                    type="text"
                    value={formData.municipio || ''}
                    onChange={e => setFormData({ ...formData, municipio: e.target.value })}
                    placeholder="Ex: Sorriso"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.estado || ''}
                    onChange={e => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                    placeholder="MT"
                    className={`${inputClass} uppercase`}
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Observações de Campo</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 mt-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Talhão</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
