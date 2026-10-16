import React, { useState } from 'react';
import { PlantabilityPhoto, PropertyField } from '../../types/plantability';
import { Camera, Plus, Save, Image as ImageIcon, Trash2 } from 'lucide-react';

interface Props {
  photos: PlantabilityPhoto[];
  fields: PropertyField[];
  onSavePhoto: (photo: PlantabilityPhoto) => void;
}

export const PlantabilityPhotoDiaryView: React.FC<Props> = ({ photos, fields, onSavePhoto }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string>((fields || []).length > 0 ? fields[0]?.id || '' : '');
  const [category, setCategory] = useState<PlantabilityPhoto['category']>('sulco');
  const [caption, setCaption] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption || !photoUrl) return;

    const newPhoto: PlantabilityPhoto = {
      id: `pic-${Date.now()}`,
      fieldId: selectedFieldId || ((fields || []).length > 0 ? fields[0]?.id || 'fld-default' : 'fld-default'),
      category,
      photoUrl,
      caption: caption.trim(),
      timestamp: new Date().toISOString(),
      notes: notes.trim()
    };

    onSavePhoto(newPhoto);
    setShowModal(false);
    setCaption('');
    setNotes('');
    setPhotoUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Camera className="w-6 h-6 text-emerald-600" />
            Diário Fotográfico de Campo & Semeadura
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Anexos fotográficos categorizados de abertura de sulco, colocação de sementes, emergência inicial, equipamentos e problemas observados.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Anexar Foto de Campo
        </button>
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(photos || []).length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-zinc-800 text-stone-400 space-y-2">
            <Camera className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-600 dark:text-stone-300">Nenhuma fotografia registrada.</p>
            <p className="text-xs text-stone-400">Clique no botão acima para adicionar fotos do sulco, sementes e emergência.</p>
          </div>
        ) : (
          (photos || []).filter(p => p && p.id).map(p => {
            const field = (fields || []).find(f => f?.id === p.fieldId);

            return (
              <div key={p.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm overflow-hidden space-y-3 p-4">
                <div className="relative h-48 rounded-xl overflow-hidden bg-stone-100 dark:bg-zinc-800">
                  <img src={p.photoUrl} alt={p.caption} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                    {p.category}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    {field?.fieldCode || 'Talhão'}
                  </span>
                  <h4 className="text-sm font-black text-stone-900 dark:text-white mt-1">{p.caption}</h4>
                  {p.notes && <p className="text-xs text-stone-500">{p.notes}</p>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl max-w-lg w-full space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-600" />
              Anexar Foto de Campo
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Talhão</label>
                  <select
                    value={selectedFieldId}
                    onChange={e => setSelectedFieldId(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  >
                    {fields.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.fieldCode} - {f.crop}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-stone-600 dark:text-stone-300">Categoria da Foto</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                  >
                    <option value="sulco">Sulco de Semeadura</option>
                    <option value="sementes">Sementes no Solo</option>
                    <option value="emergência">Emergência de Plântulas</option>
                    <option value="desenvolvimento">Desenvolvimento Inicial</option>
                    <option value="equipamento">Equipamento / Regulagem</option>
                    <option value="problema">Problema Observado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-stone-600 dark:text-stone-300 block">Fotografia da Câmera / Arquivo</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer bg-stone-50 dark:bg-zinc-800 p-2 rounded-xl border border-stone-300 dark:border-zinc-700"
                  />
                </div>
                {photoUrl && (
                  <div className="mt-2 h-32 rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-stone-600 dark:text-stone-300">Legenda da Foto</label>
                <input
                  type="text"
                  required
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Ex: Profundidade e contato semente-solo perfeitos na linha 4"
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone-300 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-stone-600 dark:text-stone-300">Observações Adicionais</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
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
                  Salvar Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
