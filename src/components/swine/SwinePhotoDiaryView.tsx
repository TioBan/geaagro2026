import React, { useState } from 'react';
import {
  Camera,
  Plus,
  Tag,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Eye,
  Trash2,
} from 'lucide-react';
import {
  SwinePhotoRecord,
  SwineAnimal,
} from '../../types/swine';
import { DEFAULT_SWINE_PHOTOS } from '../../data/swineDefaultData';

interface SwinePhotoDiaryViewProps {
  animals: SwineAnimal[];
}

export const SwinePhotoDiaryView: React.FC<SwinePhotoDiaryViewProps> = ({
  animals,
}) => {
  const [entries, setEntries] = useState<SwinePhotoRecord[]>(DEFAULT_SWINE_PHOTOS);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [swineId, setSwineId] = useState('sow_01');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SwinePhotoRecord['category']>('Leitegada');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&auto=format&fit=crop&q=80');

  const filteredEntries = entries.filter(e => {
    return selectedTag === 'all' || e.category === selectedTag;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: SwinePhotoRecord = {
      id: `photo_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      swineId,
      title: title.trim(),
      description: description.trim(),
      imageUrl: photoUrl,
      category,
    };

    setEntries([newEntry, ...entries]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-pink-600" />
            <span>Diário Fotográfico & Evidências a Campo</span>
          </h2>
          <p className="text-xs text-gray-500">
            Registro visual auditável de partos, escore corporal, lesões clínicas, ultrassonografias e inspeções de galpão.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Foto / Evidência</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'all', label: 'Todas as Fotos' },
          { id: 'Leitegada', label: 'Leitegada & Maternidade' },
          { id: 'Animal', label: 'Animal / Escore Corporal' },
          { id: 'Baia', label: 'Baias & Galpão' },
          { id: 'Lesão/Necropsia', label: 'Lesões / Necrópsia' },
          { id: 'Manejo', label: 'Manejo Operacional' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTag(t.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedTag === t.id
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Photo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(filteredEntries || []).filter(p => p && p.id).map(photo => {
          const matchedAnimal = (animals || []).find(a => a?.id === photo.swineId);
          return (
            <div
              key={photo.id}
              className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden hover:border-pink-300 transition-all flex flex-col"
            >
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-full">
                  {photo.category}
                </span>
                {matchedAnimal && (
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-pink-600 text-white text-[10px] font-black rounded-full shadow-xs">
                    {matchedAnimal.code}
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                    <span>{photo.date}</span>
                    <span>{photo.shedId || 'Galpão Geral'}</span>
                  </div>
                  <h3 className="text-sm font-black text-gray-900">{photo.title}</h3>
                  {photo.description && (
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{photo.description}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-pink-600 font-bold">✓ Auditado no Gêmeo Digital</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-gray-900">Registrar Foto / Evidência</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Título da Evidência *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Parto da Matriz MTZ-1042"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Animal Relacionado</label>
                  <select
                    value={swineId}
                    onChange={e => setSwineId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
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
                  <label className="text-xs font-bold text-gray-700 block mb-1">Categoria / Tag</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="Leitegada">Leitegada</option>
                    <option value="Animal">Animal / Escore</option>
                    <option value="Baia">Baia / Gaiola</option>
                    <option value="Lesão/Necropsia">Lesão / Necropsia</option>
                    <option value="Instalação">Instalação</option>
                    <option value="Manejo">Manejo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">URL da Imagem</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Descrição Técnica</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 text-white text-xs font-bold rounded-xl shadow-xs"
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
