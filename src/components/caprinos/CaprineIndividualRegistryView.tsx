import React, { useState } from 'react';
import {
  CaprineAnimal,
  CaprineBreed,
  CaprineCategory,
  CaprineSex,
  CaprineStatus,
  CaprineBloodDegree
} from '../../types/caprine';
import {
  Search,
  Filter,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  Eye,
  Tag,
  ShieldCheck,
  Building2,
  Calendar,
  X
} from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  onSaveAnimal: (animal: CaprineAnimal) => void;
  onDeleteAnimal: (id: string) => void;
  onSelectAnimalForTwin: (id: string) => void;
}

export const CaprineIndividualRegistryView: React.FC<Props> = ({
  animals,
  onSaveAnimal,
  onDeleteAnimal,
  onSelectAnimalForTwin
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('TODOS');
  const [breedFilter, setBreedFilter] = useState<string>('TODOS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Partial<CaprineAnimal> | null>(null);

  const filteredAnimals = animals.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.earTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.rfidCode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'TODOS' || a.category === categoryFilter;
    const matchesBreed = breedFilter === 'TODOS' || a.breed === breedFilter;
    const matchesStatus = statusFilter === 'TODOS' || a.status === statusFilter;

    return matchesSearch && matchesCategory && matchesBreed && matchesStatus;
  });

  const handleOpenAddModal = () => {
    const nextNum = animals.length + 101;
    setEditingAnimal({
      id: `cap-${Date.now()}`,
      earTag: `CAP-${nextNum}`,
      rfidCode: `982.000${Math.floor(100000000 + Math.random() * 900000000)}`,
      qrCode: `CAP${nextNum}-ANGLO`,
      name: '',
      breed: 'Anglo-Nubiana',
      sex: 'Fêmea',
      category: 'Cabra em Lactação',
      birthDate: new Date().toISOString().split('T')[0],
      weightKg: 50,
      bodyConditionScore: 3.5,
      famachaScore: 1,
      owner: 'Haras & Capril GeaAgro',
      lot: 'Lote Leiteiro A',
      status: 'Ativo',
      bloodDegree: 'PO (Puro de Origem)',
      geneticLineage: 'Seleção Nacional',
      photoUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=600&q=80'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (animal: CaprineAnimal) => {
    setEditingAnimal({ ...animal });
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnimal?.name || !editingAnimal?.earTag) {
      alert('Por favor, preencha o nome e número do brinco.');
      return;
    }

    onSaveAnimal(editingAnimal as CaprineAnimal);
    setIsModalOpen(false);
    setEditingAnimal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Cadastro Individual & Identidade Digital (RFID/NFC)
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Gestão do rebanho caprino com brinco eletrônico, QR Code, escore corporal (ECC) e linhagem genética.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Caprino
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por nome, brinco (ex: CAP-101) ou código RFID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white rounded-xl text-sm border border-stone-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white rounded-xl text-xs border border-stone-200 dark:border-zinc-700 font-medium"
          >
            <option value="TODOS">Todas Categorias</option>
            <option value="Cabra em Lactação">Cabra em Lactação</option>
            <option value="Cabra Seca">Cabra Seca</option>
            <option value="Matriz Gestante">Matriz Gestante</option>
            <option value="Reprodutor (Bode)">Reprodutor (Bode)</option>
            <option value="Cabrito Mamando">Cabrito Mamando</option>
            <option value="Cabrita de Reposição">Cabrita de Reposição</option>
            <option value="Cabrito Desmamado">Cabrito Desmamado</option>
          </select>

          <select
            value={breedFilter}
            onChange={e => setBreedFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white rounded-xl text-xs border border-stone-200 dark:border-zinc-700 font-medium"
          >
            <option value="TODOS">Todas Raças</option>
            <option value="Anglo-Nubiana">Anglo-Nubiana</option>
            <option value="Saanen">Saanen</option>
            <option value="Toggenburg">Toggenburg</option>
            <option value="Boer">Boer</option>
            <option value="Alpina">Alpina</option>
            <option value="Canindé">Canindé</option>
            <option value="Moxotó">Moxotó</option>
            <option value="SRD (Sem Raça Definida)">SRD</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white rounded-xl text-xs border border-stone-200 dark:border-zinc-700 font-medium"
          >
            <option value="TODOS">Todos Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Vendido">Vendido</option>
            <option value="Descartado">Descartado</option>
            <option value="Óbito">Óbito</option>
          </select>
        </div>
      </div>

      {/* Grid of Caprine Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnimals.map(animal => (
          <div
            key={animal.id}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Card Header Image & Badges */}
              <div className="relative h-44 bg-stone-100 dark:bg-zinc-800">
                <img
                  src={animal.photoUrl || 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=600&q=80'}
                  alt={animal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-xs font-mono font-bold px-3 py-1 rounded-full border border-white/20">
                  Brinco: {animal.earTag}
                </div>
                <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1">
                  <QrCode className="w-3 h-3" />
                  RFID Active
                </div>
                <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-stone-900 dark:text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  {animal.breed}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-base text-stone-900 dark:text-white">{animal.name}</h3>
                    <p className="text-xs text-stone-500 font-mono">RFID: {animal.rfidCode}</p>
                  </div>
                  <span className="text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                    {animal.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-stone-200/60 dark:border-zinc-700/60">
                  <div>
                    <span className="text-stone-400 block">Peso / ECC:</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{animal.weightKg} kg (ECC {animal.bodyConditionScore})</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Grau de Sangue:</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{animal.bloodDegree}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Lote:</span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">{animal.lot}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block">FAMACHA:</span>
                    <span className="font-bold text-emerald-600">Grau {animal.famachaScore || 1}</span>
                  </div>
                </div>

                {animal.notes && (
                  <p className="text-xs text-stone-500 line-clamp-2 italic">
                    "{animal.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="p-4 bg-stone-50/50 dark:bg-zinc-800/30 border-t border-stone-100 dark:border-zinc-800 flex justify-between items-center gap-2">
              <button
                onClick={() => onSelectAnimalForTwin(animal.id)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                Gêmeo 360°
              </button>

              <button
                onClick={() => handleOpenEditModal(animal)}
                className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
                title="Editar Cadastro"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (confirm(`Tem certeza que deseja excluir ${animal.name}?`)) {
                    onDeleteAnimal(animal.id);
                  }
                }}
                className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Animal Modal */}
      {isModalOpen && editingAnimal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full p-6 space-y-6 border border-stone-200 dark:border-zinc-800 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-800 pb-4">
              <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                {editingAnimal.id ? 'Editar Ficha Caprina' : 'Novo Cadastro de Caprino'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Nome do Animal *</label>
                  <input
                    type="text"
                    required
                    value={editingAnimal.name || ''}
                    onChange={e => setEditingAnimal({ ...editingAnimal, name: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                    placeholder="Ex: Estrela do Agreste"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Brinco / Identificação ID *</label>
                  <input
                    type="text"
                    required
                    value={editingAnimal.earTag || ''}
                    onChange={e => setEditingAnimal({ ...editingAnimal, earTag: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-mono font-bold"
                    placeholder="Ex: CAP-101"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Brinco Eletrônico (RFID/NFC)</label>
                  <input
                    type="text"
                    value={editingAnimal.rfidCode || ''}
                    onChange={e => setEditingAnimal({ ...editingAnimal, rfidCode: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Raça *</label>
                  <select
                    value={editingAnimal.breed || 'Anglo-Nubiana'}
                    onChange={e => setEditingAnimal({ ...editingAnimal, breed: e.target.value as CaprineBreed })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  >
                    <option value="Anglo-Nubiana">Anglo-Nubiana</option>
                    <option value="Saanen">Saanen</option>
                    <option value="Toggenburg">Toggenburg</option>
                    <option value="Boer">Boer</option>
                    <option value="Alpina">Alpina</option>
                    <option value="Canindé">Canindé</option>
                    <option value="Moxotó">Moxotó</option>
                    <option value="SRD (Sem Raça Definida)">SRD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Categoria Zootécnica *</label>
                  <select
                    value={editingAnimal.category || 'Cabra em Lactação'}
                    onChange={e => setEditingAnimal({ ...editingAnimal, category: e.target.value as CaprineCategory })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  >
                    <option value="Cabra em Lactação">Cabra em Lactação</option>
                    <option value="Cabra Seca">Cabra Seca</option>
                    <option value="Matriz Gestante">Matriz Gestante</option>
                    <option value="Reprodutor (Bode)">Reprodutor (Bode)</option>
                    <option value="Cabrito Mamando">Cabrito Mamando</option>
                    <option value="Cabrita de Reposição">Cabrita de Reposição</option>
                    <option value="Cabrito Desmamado">Cabrito Desmamado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Sexo *</label>
                  <select
                    value={editingAnimal.sex || 'Fêmea'}
                    onChange={e => setEditingAnimal({ ...editingAnimal, sex: e.target.value as CaprineSex })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  >
                    <option value="Fêmea">Fêmea</option>
                    <option value="Macho (Bode)">Macho (Bode)</option>
                    <option value="Macho Castrado">Macho Castrado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={editingAnimal.birthDate || ''}
                    onChange={e => setEditingAnimal({ ...editingAnimal, birthDate: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Peso Atual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingAnimal.weightKg || 50}
                    onChange={e => setEditingAnimal({ ...editingAnimal, weightKg: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Escore de Condição Corporal (ECC 1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editingAnimal.bodyConditionScore || 3.5}
                    onChange={e => setEditingAnimal({ ...editingAnimal, bodyConditionScore: parseFloat(e.target.value) || 3.5 })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Lote / Aprisco</label>
                  <input
                    type="text"
                    value={editingAnimal.lot || ''}
                    onChange={e => setEditingAnimal({ ...editingAnimal, lot: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                    placeholder="Ex: Lote Leiteiro A"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Grau de Sangue</label>
                  <select
                    value={editingAnimal.bloodDegree || 'PO (Puro de Origem)'}
                    onChange={e => setEditingAnimal({ ...editingAnimal, bloodDegree: e.target.value as CaprineBloodDegree })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  >
                    <option value="PO (Puro de Origem)">PO (Puro de Origem)</option>
                    <option value="PC (Puro por Cruza)">PC (Puro por Cruza)</option>
                    <option value="7/8">7/8</option>
                    <option value="3/4">3/4</option>
                    <option value="1/2 (F1)">1/2 (F1)</option>
                    <option value="SRD">SRD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">URL da Fotografia</label>
                  <input
                    type="text"
                    value={editingAnimal.photoUrl || ''}
                    onChange={e => setEditingAnimal({ ...editingAnimal, photoUrl: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Observações Técnicas</label>
                <textarea
                  rows={2}
                  value={editingAnimal.notes || ''}
                  onChange={e => setEditingAnimal({ ...editingAnimal, notes: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  placeholder="Anotações adicionais sobre saúde, aprumações ou temperamento..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-stone-700 dark:text-stone-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md"
                >
                  Salvar Caprino
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
