import React, { useState, useEffect } from 'react';
import { SeedBatch, CropType, SeedCategory } from '../../types/plantability';
import { Sprout, Plus, Pencil, Trash2, X } from 'lucide-react';

interface Props {
  seeds: SeedBatch[];
  onSaveSeed: (seed: SeedBatch) => void;
  onDeleteSeed?: (id: string) => void;
}

const createEmptySeed = (): Partial<SeedBatch> => ({
  crop: 'Soja',
  cultivar: '',
  batchNumber: '',
  category: 'C1',
  treatment: '',
  pmsGrams: undefined,
  germinationRate: undefined,
  vigorRate: undefined,
  purityRate: 99,
  supplier: ''
});

const inputClass =
  'w-full h-9 px-3 mt-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500';

export const PlantabilitySeedsView: React.FC<Props> = ({ seeds, onSaveSeed, onDeleteSeed }) => {
  const [showModal, setShowModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SeedBatch>>(createEmptySeed);

  useEffect(() => {
    if (!showModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showModal]);

  const openNewModal = () => {
    setFormData(createEmptySeed());
    setShowModal(true);
  };

  const openEditModal = (seed: SeedBatch) => {
    setFormData({ ...seed });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cultivar?.trim() || !formData.batchNumber?.trim()) return;

    const newSeed: SeedBatch = {
      id: formData.id || `sd-${Date.now()}`,
      crop: (formData.crop as CropType) || 'Soja',
      cultivar: formData.cultivar.trim(),
      batchNumber: formData.batchNumber.trim(),
      category: (formData.category as SeedCategory) || 'C1',
      treatment: formData.treatment?.trim() || 'Sem Tratamento',
      pmsGrams: Number(formData.pmsGrams) || 180,
      germinationRate: Number(formData.germinationRate) || 90,
      vigorRate: Number(formData.vigorRate) || 85,
      purityRate: Number(formData.purityRate) || 99,
      supplier: formData.supplier?.trim() || 'Fornecedor Certificado'
    };

    onSaveSeed(newSeed);
    setShowModal(false);
    setFormData(createEmptySeed());
  };

  const safeSeeds = (seeds || []).filter(s => s && s.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Cadastro & Análise de Lotes de Sementes</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Controle de germinação, vigor, pureza, PMS (peso de mil sementes), categoria e tratamento.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Lote</span>
        </button>
      </div>

      {/* Cards Grid or Empty State */}
      {safeSeeds.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Nenhum lote de sementes cadastrado
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Registre os lotes com laudo de germinação, vigor, pureza e PMS para dimensionamento do estande ideal.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewModal}
            className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Primeiro Lote</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {safeSeeds.map(s => (
            <div
              key={s.id}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 block">
                    {s.crop} • {s.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                    {s.cultivar}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums truncate">
                    Lote: {s.batchNumber}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] font-semibold tabular-nums text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                    PMS {s.pmsGrams}g
                  </span>
                  <button
                    type="button"
                    onClick={() => openEditModal(s)}
                    title="Editar lote"
                    className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  {onDeleteSeed && (
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDeleteId(confirmDeleteId === s.id ? null : s.id)
                      }
                      title="Remover lote"
                      className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {confirmDeleteId === s.id && onDeleteSeed && (
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs">
                  <span className="text-rose-700 dark:text-rose-300 font-medium">Excluir lote?</span>
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
                        onDeleteSeed(s.id);
                        setConfirmDeleteId(null);
                      }}
                      className="h-7 px-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-medium cursor-pointer"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center text-xs tabular-nums bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 p-2.5 rounded-lg">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Germinação</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.germinationRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Vigor</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">{s.vigorRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">Pureza</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">{s.purityRate}%</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-zinc-300 space-y-1">
                <p>
                  <span className="text-slate-400 dark:text-zinc-500">Tratamento: </span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200">{s.treatment}</span>
                </p>
                <p>
                  <span className="text-slate-400 dark:text-zinc-500">Fornecedor: </span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200">{s.supplier}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
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
                <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{formData.id ? 'Editar Lote de Sementes' : 'Cadastrar Lote de Sementes'}</span>
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
                    required
                    value={formData.cultivar || ''}
                    onChange={e => setFormData({ ...formData, cultivar: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Número do Lote</label>
                  <input
                    type="text"
                    required
                    value={formData.batchNumber || ''}
                    onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Categoria</label>
                  <select
                    value={formData.category || 'C1'}
                    onChange={e => setFormData({ ...formData, category: e.target.value as SeedCategory })}
                    className={inputClass}
                  >
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="Certificada">Certificada</option>
                    <option value="Básica">Básica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Germinação (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.germinationRate ?? ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        germinationRate: e.target.value === '' ? undefined : Number(e.target.value)
                      })
                    }
                    placeholder="90"
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Vigor (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.vigorRate ?? ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        vigorRate: e.target.value === '' ? undefined : Number(e.target.value)
                      })
                    }
                    placeholder="85"
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Pureza (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.purityRate ?? ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        purityRate: e.target.value === '' ? undefined : Number(e.target.value)
                      })
                    }
                    placeholder="99"
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">PMS (g)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.pmsGrams ?? ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        pmsGrams: e.target.value === '' ? undefined : Number(e.target.value)
                      })
                    }
                    placeholder="180"
                    className={`${inputClass} tabular-nums`}
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">
                  Tratamento de Semente (TSI / On-Farm)
                </label>
                <input
                  type="text"
                  value={formData.treatment || ''}
                  onChange={e => setFormData({ ...formData, treatment: e.target.value })}
                  placeholder="Ex: Fungicida + Inseticida + Inoculante"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Fornecedor / Sementeira</label>
                <input
                  type="text"
                  value={formData.supplier || ''}
                  onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                  className={inputClass}
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
                  className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
