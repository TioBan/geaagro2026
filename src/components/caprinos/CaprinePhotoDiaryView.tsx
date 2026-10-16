// @ts-nocheck
import React, { useState } from 'react';
import { CaprinePhotoEntry, CaprineAnimal } from '../../types/caprine';
import { Camera, Plus, Calendar, Filter, Sparkles, Image as ImageIcon, X } from 'lucide-react';

interface Props {
  photos: CaprinePhotoEntry[];
  animals: CaprineAnimal[];
  onSavePhoto: (photo: CaprinePhotoEntry) => void;
}

export const CaprinePhotoDiaryView: React.FC<Props> = ({ photos, animals, onSavePhoto }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('Todos');
  const [newPhoto, setNewPhoto] = useState<Partial<CaprinePhotoEntry>>({
    id: `pho-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    title: '',
    categoryTag: 'Escore Corporal',
    photoUrl: '',
    description: ''
  });

  const categories = ['Todos', 'Escore Corporal', 'Podologia / Casco', 'Aprisco & Instalações', 'Ocorrência Clínica', 'Matriz & Cria'];

  const filteredPhotos = selectedTag === 'Todos'
    ? photos
    : photos.filter(p => p.categoryTag === selectedTag);

  const handleOpenModal = () => {
    setNewPhoto({
      id: `pho-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: '',
      categoryTag: 'Escore Corporal',
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
    if (!newPhoto.title) {
      alert('Informe o título da foto.');
      return;
    }
    if (!newPhoto.photoUrl) {
      alert('Tire uma foto, faça o upload de uma imagem ou forneça um link válido.');
      return;
    }
    onSavePhoto(newPhoto as CaprinePhotoEntry);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Camera className="w-6 h-6 text-amber-500" />
            Diário Fotográfico do Caprinocultor & Evolução Visual
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Registro fotográfico cronológico de sanidade, podologia, evolução de apriscos e escore corporal de reprodutores e matrizes.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Foto no Diário
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedTag(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedTag === cat
                ? 'bg-stone-900 text-white dark:bg-emerald-600'
                : 'bg-white dark:bg-zinc-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-zinc-700 hover:bg-stone-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map(p => {
          const animal = animals.find(a => a.id === p.animalId);
          return (
            <div
              key={p.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-all space-y-3 p-4"
            >
              <div className="relative h-48 rounded-xl overflow-hidden bg-stone-100 dark:bg-zinc-800">
                <img src={p.photoUrl} alt={p.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 bg-stone-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                  {p.categoryTag}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-stone-400 font-mono block">{p.date}</span>
                <h3 className="font-extrabold text-stone-900 dark:text-white text-base mt-0.5">{p.title}</h3>
                {animal && (
                  <p className="text-xs text-emerald-600 font-bold mt-1">
                    Caprino: {animal.earTag} - {animal.name}
                  </p>
                )}
                {p.description && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 line-clamp-3">
                    {p.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Photo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-500" />
                Adicionar Entrada no Diário Fotográfico
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Título do Registro *</label>
                <input
                  type="text"
                  required
                  value={newPhoto.title || ''}
                  onChange={e => setNewPhoto({ ...newPhoto, title: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  placeholder="Ex: Curativo do Casco E.D., Acompanhamento ECC..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Categoria *</label>
                  <select
                    value={newPhoto.categoryTag || 'Escore Corporal'}
                    onChange={e => setNewPhoto({ ...newPhoto, categoryTag: e.target.value as any })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                  >
                    <option value="Escore Corporal">Escore Corporal</option>
                    <option value="Podologia / Casco">Podologia / Casco</option>
                    <option value="Aprisco & Instalações">Aprisco & Instalações</option>
                    <option value="Ocorrência Clínica">Ocorrência Clínica</option>
                    <option value="Matriz & Cria">Matriz & Cria</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={newPhoto.date || ''}
                    onChange={e => setNewPhoto({ ...newPhoto, date: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Caprino Vinculado (Opcional)</label>
                <select
                  value={newPhoto.animalId || ''}
                  onChange={e => setNewPhoto({ ...newPhoto, animalId: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                >
                  <option value="">-- Sem vínculo individual --</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>{a.earTag} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Foto ou Imagem do Registro *
                </label>
                
                {newPhoto.photoUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-800 h-40 group">
                    <img 
                      src={newPhoto.photoUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-100 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setNewPhoto(prev => ({ ...prev, photoUrl: '' }))}
                        className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold shadow-md text-xs transition-transform transform hover:scale-110 flex items-center gap-1"
                      >
                        <X className="w-4 h-4" /> Remover Foto
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div 
                      onClick={() => document.getElementById('camera-file-input')?.click()}
                      className="border-2 border-dashed border-stone-300 dark:border-zinc-700 rounded-xl p-5 text-center hover:bg-stone-50 dark:hover:bg-zinc-800/40 cursor-pointer transition-all space-y-2 group"
                    >
                      <Camera className="w-8 h-8 text-amber-500 mx-auto transition-transform group-hover:scale-110" />
                      <div>
                        <strong className="text-stone-800 dark:text-stone-200 block text-xs">
                          Tirar Foto (Câmera) ou Abrir Galeria
                        </strong>
                        <span className="text-stone-400 text-[10px]">
                          Suporta captura em tempo real e arquivos do rolo da câmera
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-stone-400 text-[9px] my-1 font-bold">
                      <div className="h-px bg-stone-200 dark:bg-zinc-800 flex-1"></div>
                      <span>OU SE PREFERIR, INSIRA O LINK ABAIXO</span>
                      <div className="h-px bg-stone-200 dark:bg-zinc-800 flex-1"></div>
                    </div>

                    <input
                      type="text"
                      value={newPhoto.photoUrl || ''}
                      onChange={e => setNewPhoto({ ...newPhoto, photoUrl: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 text-xs"
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                )}

                <input
                  type="file"
                  id="camera-file-input"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Descrição / Anotações</label>
                <textarea
                  rows={3}
                  value={newPhoto.description || ''}
                  onChange={e => setNewPhoto({ ...newPhoto, description: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  placeholder="Descreva a evolução do quadro, cicatrização ou observações técnicas..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold"
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
