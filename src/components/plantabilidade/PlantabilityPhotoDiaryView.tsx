import React, { useState, useEffect } from 'react';
import { PlantabilityPhoto, PropertyField } from '../../types/plantability';
import { Camera, Plus, Trash2, X } from 'lucide-react';

interface Props {
  photos: PlantabilityPhoto[];
  fields: PropertyField[];
  onSavePhoto: (photo: PlantabilityPhoto) => void;
  onDeletePhoto?: (id: string) => void;
}

const CATEGORIES: Array<{ id: 'all' | PlantabilityPhoto['category']; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'sulco', label: 'Sulco' },
  { id: 'sementes', label: 'Sementes' },
  { id: 'emergência', label: 'Emergência' },
  { id: 'desenvolvimento', label: 'Desenvolvimento' },
  { id: 'equipamento', label: 'Equipamento' },
  { id: 'problema', label: 'Problema' }
];

const inputClass =
  'w-full h-9 px-3 mt-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500';

export const PlantabilityPhotoDiaryView: React.FC<Props> = ({
  photos,
  fields,
  onSavePhoto,
  onDeletePhoto
}) => {
  const safeFields = (fields || []).filter(f => f && f.id);
  const safePhotos = (photos || []).filter(p => p && p.id);

  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | PlantabilityPhoto['category']>('all');
  const [selectedFieldId, setSelectedFieldId] = useState<string>(safeFields[0]?.id || '');
  const [category, setCategory] = useState<PlantabilityPhoto['category']>('sulco');
  const [caption, setCaption] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (safeFields.length > 0 && !safeFields.some(f => f.id === selectedFieldId)) {
      setSelectedFieldId(safeFields[0].id);
    }
  }, [safeFields, selectedFieldId]);

  useEffect(() => {
    if (!showModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showModal]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = uploadEvent => {
      if (uploadEvent.target?.result) {
        setPhotoUrl(uploadEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() || !photoUrl) return;

    const newPhoto: PlantabilityPhoto = {
      id: `pic-${Date.now()}`,
      fieldId: selectedFieldId || safeFields[0]?.id || 'fld-default',
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

  const filteredPhotos =
    filterCategory === 'all'
      ? safePhotos
      : safePhotos.filter(p => p.category === filterCategory);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Diário Fotográfico de Campo & Semeadura</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Registros fotográficos categorizados de abertura de sulco, sementes, emergência, equipamentos e ocorrências.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Anexar Foto</span>
          </button>
        </div>

        {/* Category Filter Strip */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-zinc-800/80">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterCategory(cat.id)}
              className={`h-7 px-2.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Gallery Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-2.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Camera className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            {safePhotos.length === 0
              ? 'Nenhuma fotografia registrada'
              : 'Nenhuma foto nesta categoria'}
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Anexe fotos do sulco, deposição de sementes e emergência inicial para compor o histórico do talhão.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhotos.map(p => {
            const field = safeFields.find(f => f.id === p.fieldId);

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden p-3.5 space-y-3"
              >
                <div className="relative h-44 rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  <img
                    src={p.photoUrl}
                    alt={p.caption}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-zinc-900/80 text-white text-[10px] font-semibold uppercase tracking-wide">
                    {p.category}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/70 dark:border-emerald-900/60">
                      {field?.fieldCode || 'Talhão'}
                    </span>

                    {onDeletePhoto && (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDeleteId(confirmDeleteId === p.id ? null : p.id)
                        }
                        title="Remover foto"
                        className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {confirmDeleteId === p.id && onDeletePhoto && (
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs">
                      <span className="text-rose-700 dark:text-rose-300 font-medium">Excluir foto?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-6 px-2 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-[11px] cursor-pointer"
                        >
                          Não
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeletePhoto(p.id);
                            setConfirmDeleteId(null);
                          }}
                          className="h-6 px-2 rounded bg-rose-600 text-white text-[11px] cursor-pointer"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  )}

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{p.caption}</h4>
                  {p.notes && <p className="text-xs text-slate-500 dark:text-zinc-400">{p.notes}</p>}
                </div>
              </div>
            );
          })}
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
                <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Anexar Foto de Campo</span>
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
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Talhão</label>
                  <select
                    value={selectedFieldId}
                    onChange={e => setSelectedFieldId(e.target.value)}
                    className={inputClass}
                  >
                    {safeFields.length === 0 ? (
                      <option value="">Talhão padrão</option>
                    ) : (
                      safeFields.map(f => (
                        <option key={f.id} value={f.id}>
                          {f.fieldCode} - {f.crop}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-600 dark:text-zinc-300">Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as PlantabilityPhoto['category'])}
                    className={inputClass}
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
                <label className="font-medium text-slate-600 dark:text-zinc-300 block">
                  Arquivo de Imagem
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 dark:text-zinc-400 file:mr-3 file:h-8 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer bg-slate-50/70 dark:bg-zinc-950/60 p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700"
                />
                {photoUrl && (
                  <div className="h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800">
                    <img
                      src={photoUrl}
                      alt="Prévia"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Legenda da Foto</label>
                <input
                  type="text"
                  required
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Ex: Profundidade e contato semente-solo na linha 4"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="font-medium text-slate-600 dark:text-zinc-300">Observações Adicionais</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
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
                  disabled={!photoUrl || !caption.trim()}
                  className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white text-xs font-medium cursor-pointer"
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
