import React, { useState } from 'react';
import { CaprinePhotoEntry, CaprinePhotoCategory, CaprineAnimal } from '../../types/caprine';
import { Camera, Plus, X } from 'lucide-react';

interface Props {
  photos: CaprinePhotoEntry[];
  animals: CaprineAnimal[];
  onSavePhoto: (photo: CaprinePhotoEntry) => void;
}

const PHOTO_CATEGORIES: ('Todos' | CaprinePhotoCategory)[] = [
  'Todos',
  'Escore Corporal',
  'Podologia / Casco',
  'Aprisco & Instalações',
  'Ocorrência Clínica',
  'Matriz & Cria'
];

function getPhotoCategory(p: CaprinePhotoEntry): string {
  return p.categoryTag || p.category || 'Geral';
}

function getPhotoDescription(p: CaprinePhotoEntry): string {
  return p.description || p.notes || '';
}

export const CaprinePhotoDiaryView: React.FC<Props> = ({ photos, animals, onSavePhoto }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('Todos');
  const [formError, setFormError] = useState('');
  const [newPhoto, setNewPhoto] = useState<Partial<CaprinePhotoEntry>>({});

  const filteredPhotos =
    selectedTag === 'Todos' ? photos : photos.filter(p => getPhotoCategory(p) === selectedTag);

  const handleOpenModal = () => {
    setFormError('');
    setNewPhoto({
      id: `pho-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: '',
      categoryTag: 'Escore Corporal',
      animalId: '',
      photoUrl: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(prev => ({
          ...prev,
          photoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.title?.trim()) {
      setFormError('Informe o título do registro fotográfico.');
      return;
    }
    if (!newPhoto.photoUrl?.trim()) {
      setFormError('Capture uma foto, selecione um arquivo da galeria ou informe uma URL.');
      return;
    }
    const tag = (newPhoto.categoryTag as CaprinePhotoCategory) || 'Escore Corporal';
    const desc = newPhoto.description || '';
    onSavePhoto({
      id: newPhoto.id || `pho-${Date.now()}`,
      date: newPhoto.date || new Date().toISOString().split('T')[0],
      title: newPhoto.title.trim(),
      categoryTag: tag,
      category: tag,
      animalId: newPhoto.animalId || undefined,
      photoUrl: newPhoto.photoUrl.trim(),
      description: desc,
      notes: desc
    });
    setIsModalOpen(false);
    setFormError('');
  };

  const inputCls =
    'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            Diário Fotográfico &amp; Evolução Visual
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Registro cronológico de podologia, ocorrências clínicas, apriscos e escore corporal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Foto
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {PHOTO_CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedTag(cat)}
            className={`h-8 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedTag === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center text-xs text-slate-500 dark:text-zinc-400">
          Nenhum registro fotográfico encontrado para esta categoria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhotos.map(p => {
            const animal = animals.find(a => a.id === p.animalId);
            const desc = getPhotoDescription(p);
            return (
              <div
                key={p.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden"
              >
                <div className="relative h-44 bg-slate-100 dark:bg-zinc-800">
                  <img src={p.photoUrl} alt={p.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2.5 right-2.5 bg-zinc-950/75 text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                    {getPhotoCategory(p)}
                  </span>
                </div>

                <div className="p-3.5 space-y-1.5">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 block">
                    {p.date}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {p.title}
                  </h3>
                  {animal && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      {animal.earTag} — {animal.name}
                    </p>
                  )}
                  {desc && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-3 pt-1">
                      {desc}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Nova Entrada no Diário Fotográfico
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Título do Registro *
                </label>
                <input
                  type="text"
                  required
                  value={newPhoto.title || ''}
                  onChange={e => setNewPhoto({ ...newPhoto, title: e.target.value })}
                  className={inputCls}
                  placeholder="Ex: Curativo de casco, avaliação ECC..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={newPhoto.categoryTag || 'Escore Corporal'}
                    onChange={e =>
                      setNewPhoto({
                        ...newPhoto,
                        categoryTag: e.target.value as CaprinePhotoCategory
                      })
                    }
                    className={inputCls}
                  >
                    <option value="Escore Corporal">Escore Corporal</option>
                    <option value="Podologia / Casco">Podologia / Casco</option>
                    <option value="Aprisco & Instalações">Aprisco &amp; Instalações</option>
                    <option value="Ocorrência Clínica">Ocorrência Clínica</option>
                    <option value="Matriz & Cria">Matriz &amp; Cria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={newPhoto.date || ''}
                    onChange={e => setNewPhoto({ ...newPhoto, date: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Caprino Vinculado (Opcional)
                </label>
                <select
                  value={newPhoto.animalId || ''}
                  onChange={e => setNewPhoto({ ...newPhoto, animalId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Sem vínculo individual</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.earTag} — {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Foto / Imagem *
                </label>

                {newPhoto.photoUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 h-36">
                    <img
                      src={newPhoto.photoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setNewPhoto(prev => ({ ...prev, photoUrl: '' }))}
                      className="absolute top-2 right-2 h-7 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById('caprine-photo-input')?.click()}
                      className="w-full border border-dashed border-slate-300 dark:border-zinc-700 rounded-lg p-4 text-center hover:bg-slate-50 dark:hover:bg-zinc-800/40 cursor-pointer flex flex-col items-center gap-1"
                    >
                      <Camera className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                        Tirar foto ou escolher da galeria
                      </span>
                    </button>

                    <input
                      type="text"
                      value={newPhoto.photoUrl || ''}
                      onChange={e => setNewPhoto({ ...newPhoto, photoUrl: e.target.value })}
                      className={inputCls}
                      placeholder="Ou informe a URL da imagem (https://...)"
                    />
                  </div>
                )}

                <input
                  type="file"
                  id="caprine-photo-input"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Descrição / Observações
                </label>
                <textarea
                  rows={2}
                  value={newPhoto.description || ''}
                  onChange={e => setNewPhoto({ ...newPhoto, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Evolução clínica, cicatrização ou observações técnicas..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Salvar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
