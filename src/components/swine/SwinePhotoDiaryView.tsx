import React, { useMemo, useState } from 'react';
import { Camera, Plus, Trash2, Upload, X } from 'lucide-react';
import { SwineAnimal, SwinePhotoRecord } from '../../types/swine';
import { loadSwinePhotos, saveSwinePhotos } from '../../utils/swineStorage';
import {
  SWINE_CARD_CLASS,
  SWINE_INPUT_CLASS,
  SWINE_LABEL_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SECONDARY_BTN_CLASS,
  SWINE_TEXTAREA_CLASS,
  formatBrDate,
  getTodayIsoDate,
  useEscapeClose,
} from './swineUi';

interface SwinePhotoDiaryViewProps {
  animals: SwineAnimal[];
  photos?: SwinePhotoRecord[];
  onAddPhoto?: (photo: SwinePhotoRecord) => void;
  onDeletePhoto?: (id: string) => void;
}

const PHOTO_CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'Leitegada', label: 'Leitegada' },
  { id: 'Animal', label: 'Animal / ECC' },
  { id: 'Baia', label: 'Baia / Galpão' },
  { id: 'Lesão/Necropsia', label: 'Lesão / Necropsia' },
  { id: 'Instalação', label: 'Instalação' },
  { id: 'Manejo', label: 'Manejo' },
];

export const SwinePhotoDiaryView: React.FC<SwinePhotoDiaryViewProps> = ({
  animals,
  photos: externalPhotos,
  onAddPhoto,
  onDeletePhoto,
}) => {
  const [localEntries, setLocalEntries] = useState<SwinePhotoRecord[]>(loadSwinePhotos);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form state
  const [swineId, setSwineId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SwinePhotoRecord['category']>('Leitegada');
  const [photoUrl, setPhotoUrl] = useState('');
  const [shedId, setShedId] = useState('');

  useEscapeClose(isModalOpen, () => setIsModalOpen(false));

  const entries = externalPhotos ?? localEntries;

  const filteredEntries = useMemo(
    () => entries.filter(e => selectedTag === 'all' || e.category === selectedTag),
    [entries, selectedTag]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !photoUrl.trim()) return;

    const newEntry: SwinePhotoRecord = {
      id: `photo_${Date.now()}`,
      date: getTodayIsoDate(),
      swineId: swineId || undefined,
      shedId: shedId.trim() || undefined,
      title: title.trim(),
      description: description.trim() || undefined,
      imageUrl: photoUrl.trim(),
      category,
    };

    if (onAddPhoto) {
      onAddPhoto(newEntry);
    } else {
      const updated = [newEntry, ...localEntries];
      setLocalEntries(updated);
      saveSwinePhotos(updated);
    }

    setTitle('');
    setDescription('');
    setPhotoUrl('');
    setShedId('');
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (onDeletePhoto) {
      onDeletePhoto(id);
    } else {
      const updated = localEntries.filter(p => p.id !== id);
      setLocalEntries(updated);
      saveSwinePhotos(updated);
    }
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Camera className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Diário Fotográfico & Evidências a Campo</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Registro visual persistente de partos, escore corporal, lesões clínicas e inspeções de galpão.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`${SWINE_PRIMARY_BTN_CLASS} shrink-0`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Evidência</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className={`${SWINE_CARD_CLASS} p-2 flex items-center gap-1 overflow-x-auto`}>
        {PHOTO_CATEGORIES.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedTag(t.id)}
            className={`h-8 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedTag === t.id
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredEntries.length === 0 ? (
        <div className={`${SWINE_CARD_CLASS} p-10 text-center space-y-2`}>
          <Camera className="w-8 h-8 text-slate-400 dark:text-zinc-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            Nenhuma evidência fotográfica registrada
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Envie uma foto do dispositivo ou informe uma URL para compor o diário da granja.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map(photo => {
            const matchedAnimal = animals.find(a => a.id === photo.swineId);
            return (
              <div key={photo.id} className={`${SWINE_CARD_CLASS} overflow-hidden flex flex-col`}>
                <div className="h-44 bg-slate-100 dark:bg-zinc-950 relative overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-zinc-950/75 text-white text-[10px] font-medium rounded-md">
                    {photo.category}
                  </span>
                  {matchedAnimal && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-semibold rounded-md">
                      {matchedAnimal.code}
                    </span>
                  )}
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 mb-1 tabular-nums">
                      <span>{formatBrDate(photo.date)}</span>
                      <span>{photo.shedId || 'Granja'}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                      {photo.title}
                    </h3>
                    {photo.description && (
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                        {photo.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Registro salvo localmente
                    </span>

                    {confirmDeleteId === photo.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(photo.id)}
                          className="h-7 px-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-[11px] font-medium cursor-pointer"
                        >
                          Excluir
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-[11px] cursor-pointer"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(photo.id)}
                        className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-400 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center cursor-pointer"
                        title="Excluir evidência"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Registrar Foto / Evidência
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className={SWINE_LABEL_CLASS}>Título da Evidência *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Parto da Matriz MTZ-1042"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className={SWINE_INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Animal Relacionado</label>
                  <select
                    value={swineId}
                    onChange={e => setSwineId(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  >
                    <option value="">Nenhum (Instalação / Galpão)</option>
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.code} ({a.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as SwinePhotoRecord['category'])}
                    className={SWINE_INPUT_CLASS}
                  >
                    <option value="Leitegada">Leitegada</option>
                    <option value="Animal">Animal / ECC</option>
                    <option value="Baia">Baia / Gaiola</option>
                    <option value="Lesão/Necropsia">Lesão / Necropsia</option>
                    <option value="Instalação">Instalação</option>
                    <option value="Manejo">Manejo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={SWINE_LABEL_CLASS}>Galpão / Local</label>
                <input
                  type="text"
                  placeholder="Ex: Maternidade 01"
                  value={shedId}
                  onChange={e => setShedId(e.target.value)}
                  className={SWINE_INPUT_CLASS}
                />
              </div>

              <div className="space-y-2">
                <label className={SWINE_LABEL_CLASS}>Imagem (Enviar arquivo ou colar URL) *</label>
                <div className="flex items-center gap-2">
                  <label className={`${SWINE_SECONDARY_BTN_CLASS} shrink-0`}>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carregar Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ou cole a URL da imagem..."
                    value={photoUrl}
                    onChange={e => setPhotoUrl(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label className={SWINE_LABEL_CLASS}>Descrição Técnica</label>
                <textarea
                  rows={2}
                  placeholder="Observações da inspeção visual..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className={SWINE_TEXTAREA_CLASS}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={SWINE_SECONDARY_BTN_CLASS}
                >
                  Cancelar
                </button>
                <button type="submit" className={SWINE_PRIMARY_BTN_CLASS}>
                  Salvar Evidência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
