import React, { useMemo, useState } from 'react';
import { BuffaloAnimal, BuffaloPhoto } from '../../types/buffalo';
import {
  Camera,
  Plus,
  X,
  ArrowUpRight,
  Trash2,
  Upload,
  Maximize2,
} from 'lucide-react';

interface BuffaloPhotoDiaryViewProps {
  animals: BuffaloAnimal[];
  onUpdateAnimal: (animal: BuffaloAnimal) => void;
  onOpenDigitalTwin: (animalId: string) => void;
}

const PHOTO_TAGS: BuffaloPhoto['tag'][] = [
  'Identificação',
  'Parto',
  'Úbere / Lactação',
  'Casco',
  'Lesão',
  'Piquete / Banho',
  'Instalação',
];

interface FlatPhoto extends BuffaloPhoto {
  animalId: string;
  animalName: string;
  animalBrinco: string;
}

export const BuffaloPhotoDiaryView: React.FC<BuffaloPhotoDiaryViewProps> = ({
  animals,
  onUpdateAnimal,
  onOpenDigitalTwin,
}) => {
  const [tagFilter, setTagFilter] = useState<string>('todas');
  const [animalFilter, setAnimalFilter] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<FlatPhoto | null>(null);
  const [confirmDeleteKey, setConfirmDeleteKey] = useState<string | null>(null);

  // Form state
  const [targetAnimalId, setTargetAnimalId] = useState<string>(animals[0]?.id || '');
  const [photoTag, setPhotoTag] = useState<BuffaloPhoto['tag']>('Identificação');
  const [photoDate, setPhotoDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [photoCaption, setPhotoCaption] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const allPhotos = useMemo<FlatPhoto[]>(() => {
    return animals
      .flatMap((a) =>
        a.photos.map((p) => ({
          ...p,
          animalId: a.id,
          animalName: a.name,
          animalBrinco: a.identificationNumber,
        }))
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [animals]);

  const filteredPhotos = useMemo(() => {
    return allPhotos.filter((p) => {
      const matchesTag = tagFilter === 'todas' || p.tag === tagFilter;
      const matchesAnimal = animalFilter === 'todos' || p.animalId === animalFilter;
      return matchesTag && matchesAnimal;
    });
  }, [allPhotos, tagFilter, animalFilter]);

  const openAddModal = () => {
    setTargetAnimalId(animals[0]?.id || '');
    setPhotoTag('Identificação');
    setPhotoDate(new Date().toISOString().split('T')[0]);
    setPhotoCaption('');
    setPhotoUrl('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setFormError('Selecione uma imagem de até 4 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setFormError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    const animal = animals.find((a) => a.id === targetAnimalId);
    if (!animal) {
      setFormError('Selecione um animal do rebanho.');
      return;
    }
    if (!photoUrl.trim()) {
      setFormError('Envie uma imagem do dispositivo ou informe uma URL válida.');
      return;
    }

    const newPhoto: BuffaloPhoto = {
      id: `photo-${Date.now()}`,
      date: photoDate || new Date().toISOString().split('T')[0],
      url: photoUrl.trim(),
      caption: photoCaption.trim() || `${photoTag} — ${animal.name}`,
      tag: photoTag,
    };

    onUpdateAnimal({
      ...animal,
      photos: [newPhoto, ...animal.photos],
    });
    setIsModalOpen(false);
  };

  const handleDeletePhoto = (photo: FlatPhoto) => {
    const animal = animals.find((a) => a.id === photo.animalId);
    if (!animal) return;
    onUpdateAnimal({
      ...animal,
      photos: animal.photos.filter((p) => p.id !== photo.id),
    });
    setConfirmDeleteKey(null);
    if (selectedPhoto?.id === photo.id) setSelectedPhoto(null);
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho e Filtros */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Diário Fotográfico &amp; Evidências de Campo
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Registro cronológico de identificação, partos, úbere, cascos e condições de piquete ({allPhotos.length} fotos).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={animalFilter}
            onChange={(e) => setAnimalFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-teal-500"
          >
            <option value="todos">Todos os animais</option>
            {animals.map((a) => (
              <option key={a.id} value={a.id}>
                #{a.identificationNumber} {a.name}
              </option>
            ))}
          </select>

          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-teal-500"
          >
            <option value="todas">Todas as tags</option>
            {PHOTO_TAGS.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={openAddModal}
            disabled={animals.length === 0}
            className="h-8 px-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar Foto
          </button>
        </div>
      </div>

      {/* Galeria de Fotos */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-2">
          <Camera className="w-7 h-7 text-slate-300 dark:text-zinc-600 mx-auto" />
          <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
            Nenhum registro fotográfico encontrado para os filtros selecionados.
          </p>
          {animals.length > 0 && (
            <button
              type="button"
              onClick={openAddModal}
              className="h-7 px-3 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Registrar primeira foto
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhotos.map((photo) => {
            const deleteKey = `${photo.animalId}-${photo.id}`;
            return (
              <article
                key={deleteKey}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div
                    onClick={() => setSelectedPhoto(photo)}
                    className="relative aspect-video bg-slate-950 border-b border-slate-200 dark:border-zinc-800 cursor-pointer overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/85 text-white text-[10px] font-medium rounded">
                      {photo.tag}
                    </span>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-900/85 text-white text-[10px] font-medium rounded inline-flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" />
                      Ampliar
                    </span>
                  </div>

                  <div className="p-3.5 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {photo.animalName} (#{photo.animalBrinco})
                      </span>
                      <span className="shrink-0">{photo.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                      {photo.caption}
                    </p>
                  </div>
                </div>

                <div className="px-3.5 pb-3.5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenDigitalTwin(photo.animalId)}
                    className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                  >
                    Gêmeo 360°
                    <ArrowUpRight className="w-3 h-3" />
                  </button>

                  {confirmDeleteKey === deleteKey ? (
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo)}
                      className="h-7 px-2.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium cursor-pointer"
                    >
                      Confirmar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteKey(deleteKey)}
                      className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 inline-flex items-center justify-center text-slate-500 dark:text-zinc-400 cursor-pointer"
                      title="Remover foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal Adicionar Foto */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Registrar Foto no Diário
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePhoto} className="p-4 space-y-3">
              {formError && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Animal *
                  </label>
                  <select
                    value={targetAnimalId}
                    onChange={(e) => setTargetAnimalId(e.target.value)}
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  >
                    {animals.map((a) => (
                      <option key={a.id} value={a.id}>
                        #{a.identificationNumber} — {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Categoria / Tag
                  </label>
                  <select
                    value={photoTag}
                    onChange={(e) => setPhotoTag(e.target.value as BuffaloPhoto['tag'])}
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  >
                    {PHOTO_TAGS.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Data do Registro
                  </label>
                  <input
                    type="date"
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                    Carregar Arquivo (até 4 MB)
                  </label>
                  <label className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 hover:border-teal-500 rounded-lg text-xs text-slate-700 dark:text-zinc-300 inline-flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span className="truncate">Selecionar imagem...</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                  Ou informe a URL da Imagem
                </label>
                <input
                  type="text"
                  value={photoUrl.startsWith('data:') ? '' : photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              {photoUrl && (
                <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 bg-slate-950">
                  <img
                    src={photoUrl}
                    alt="Pré-visualização"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                  Legenda / Observação Clínica
                </label>
                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="Ex: Avaliação de úbere pós-ordenha da manhã"
                  className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg cursor-pointer"
                >
                  Salvar Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-3xl w-full overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                  {selectedPhoto.animalName} (#{selectedPhoto.animalBrinco}) • {selectedPhoto.tag}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">{selectedPhoto.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-slate-950 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            <div className="px-4 py-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-600 dark:text-zinc-300">{selectedPhoto.caption}</p>
              <button
                type="button"
                onClick={() => {
                  const id = selectedPhoto.animalId;
                  setSelectedPhoto(null);
                  onOpenDigitalTwin(id);
                }}
                className="h-7 px-3 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                Abrir Gêmeo 360°
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
