import React, { useState } from 'react';
import { SeedBatch, CropType, SeedCategory } from '../../types/plantability';
import { Sprout, Plus, Save, Package, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Props {
  seeds: SeedBatch[];
  onSaveSeed: (seed: SeedBatch) => void;
}

export const PlantabilitySeedsView: React.FC<Props> = ({ seeds, onSaveSeed }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<SeedBatch>>({
    crop: 'Soja',
    cultivar: '',
    batchNumber: '',
    category: 'C1',
    treatment: '',
    pmsGrams: undefined,
    germinationRate: undefined,
    vigorRate: undefined,
    purityRate: undefined,
    supplier: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cultivar || !formData.batchNumber) return;

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
    setFormData({
      crop: 'Soja',
      cultivar: '',
      batchNumber: '',
      category: 'C1',
      treatment: '',
      pmsGrams: undefined,
      germinationRate: undefined,
      vigorRate: undefined,
      purityRate: undefined,
      supplier: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-600" />
            Cadastro & Análise de Lotes de Sementes
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Registro de Germinação %, Vigor %, Pureza %, PMS (Peso de mil sementes), categoria e tratamento industrial ou na fazenda.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Lote de Sementes
        </button>
      </div>

      {/* Cards Grid or Empty State */}
      {(seeds || []).length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
            <Sprout className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-black text-stone-900 dark:text-white">Nenhum lote de sementes cadastrado</h3>
            <p className="text-xs text-stone-500">
              Cadastre os lotes de sementes com laudo de germinação, vigor, PMS e tratamento para cálculo de estande ideal.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Primeiro Lote
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {seeds.map(s => (
            <div key={s.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex justify-between items-start border-b border-stone-100 dark:border-zinc-800 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                    {s.crop} • {s.category}
                  </span>
                  <h3 className="text-base font-black text-stone-900 dark:text-white mt-1.5">{s.cultivar}</h3>
                  <p className="text-xs font-mono text-stone-500">Lote: {s.batchNumber}</p>
                </div>
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                  PMS: {s.pmsGrams}g
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] text-stone-400 block font-bold">Germinação</span>
                  <span className="font-extrabold text-emerald-600">{s.germinationRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-bold">Vigor</span>
                  <span className="font-extrabold text-sky-600">{s.vigorRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-bold">Pureza</span>
                  <span className="font-extrabold text-purple-600">{s.purityRate}%</span>
                </div>
              </div>

              <div className="text-xs text-stone-600 dark:text-stone-300 space-y-1">
                <p><strong className="text-stone-800 dark:text-stone-200">Tratamento:</strong> {s.treatment}</p>
                <p><strong className="text-stone-800 dark:text-stone-200">Fornecedor:</strong> {s.supplier}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl max-w-lg w-full space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              Cadastrar Lote de Sementes
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-semibold">
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
                    required
                    value={formData.cultivar}
                    onChange={e => setFormData({ ...formData, cultivar: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Número do Lote</label>
                  <input
                    type="text"
                    required
                    value={formData.batchNumber}
                    onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as SeedCategory })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Germinação (%)</label>
                  <input
                    type="number"
                    value={formData.germinationRate}
                    onChange={e => setFormData({ ...formData, germinationRate: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Vigor (%)</label>
                  <input
                    type="number"
                    value={formData.vigorRate}
                    onChange={e => setFormData({ ...formData, vigorRate: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-600 dark:text-stone-300">PMS (g)</label>
                  <input
                    type="number"
                    value={formData.pmsGrams}
                    onChange={e => setFormData({ ...formData, pmsGrams: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-600 dark:text-stone-300">Tratamento de Semente (TSI / On-Farm)</label>
                <input
                  type="text"
                  value={formData.treatment}
                  onChange={e => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-stone-600 dark:text-stone-300">Fornecedor / Sementeira</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={e => setFormData({ ...formData, supplier: e.target.value })}
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md"
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
