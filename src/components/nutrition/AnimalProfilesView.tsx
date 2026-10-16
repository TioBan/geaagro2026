import React, { useState } from 'react';
import { AnimalProfile, AnimalSpecies } from '../../types/animalNutrition';
import {
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Users,
  Scale,
  Activity,
  Heart,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react';

interface Props {
  profiles: AnimalProfile[];
  onSaveProfile: (profile: AnimalProfile) => void;
  onDeleteProfile: (id: string) => void;
  onFormulateForProfile: (profile: AnimalProfile) => void;
}

export const AnimalProfilesView: React.FC<Props> = ({
  profiles,
  onSaveProfile,
  onDeleteProfile,
  onFormulateForProfile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecies, setFilterSpecies] = useState<AnimalSpecies | 'todas'>('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AnimalProfile | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<AnimalSpecies>('bovinos_leite');
  const [category, setCategory] = useState('');
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState<'macho' | 'femea' | 'misto'>('femea');
  const [ageMonths, setAgeMonths] = useState<number>(36);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(600);
  const [bodyConditionScore, setBodyConditionScore] = useState<number>(3.25);
  const [count, setCount] = useState<number>(50);
  const [lotNumber, setLotNumber] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [productionType, setProductionType] = useState<'leite' | 'carne' | 'ovos' | 'manutencao'>('leite');
  const [targetMilkLitersDay, setTargetMilkLitersDay] = useState<number>(30.0);
  const [milkFatPct, setMilkFatPct] = useState<number>(3.8);
  const [targetAdgKgDay, setTargetAdgKgDay] = useState<number>(1.4);
  const [eggsPerDayPct, setEggsPerDayPct] = useState<number>(92);
  const [targetDmiKgDay, setTargetDmiKgDay] = useState<number>(22.0);

  const openNewModal = () => {
    setEditingProfile(null);
    setName('');
    setSpecies('bovinos_leite');
    setCategory('Vacas em Lactação Alta');
    setBreed('Holandesa');
    setSex('femea');
    setAgeMonths(36);
    setCurrentWeightKg(620);
    setBodyConditionScore(3.25);
    setCount(50);
    setLotNumber(`LOTE-${Date.now().toString().slice(-4)}`);
    setFarmLocation('Galpão Principal');
    setProductionType('leite');
    setTargetMilkLitersDay(32.0);
    setMilkFatPct(3.8);
    setTargetAdgKgDay(1.4);
    setEggsPerDayPct(90);
    setTargetDmiKgDay(23.0);
    setIsModalOpen(true);
  };

  const openEditModal = (p: AnimalProfile) => {
    setEditingProfile(p);
    setName(p.name);
    setSpecies(p.species);
    setCategory(p.category);
    setBreed(p.breed);
    setSex(p.sex);
    setAgeMonths(p.ageMonths);
    setCurrentWeightKg(p.currentWeightKg);
    setBodyConditionScore(p.bodyConditionScore);
    setCount(p.count);
    setLotNumber(p.lotNumber);
    setFarmLocation(p.farmLocation || '');
    setProductionType(p.productionGoal.type as any);
    setTargetMilkLitersDay(p.productionGoal.targetMilkLitersDay || 30);
    setMilkFatPct(p.productionGoal.milkFatPct || 3.8);
    setTargetAdgKgDay(p.productionGoal.targetAdgKgDay || 1.4);
    setEggsPerDayPct(p.productionGoal.eggsPerDayPct || 90);
    setTargetDmiKgDay(p.targetDmiKgDay);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: AnimalProfile = {
      id: editingProfile ? editingProfile.id : `animal_${Date.now()}`,
      name,
      species,
      category,
      breed,
      sex,
      ageMonths: Number(ageMonths),
      currentWeightKg: Number(currentWeightKg),
      bodyConditionScore: Number(bodyConditionScore),
      count: Number(count),
      lotNumber,
      farmLocation,
      productionGoal: {
        type: productionType,
        targetMilkLitersDay: productionType === 'leite' ? Number(targetMilkLitersDay) : undefined,
        milkFatPct: productionType === 'leite' ? Number(milkFatPct) : undefined,
        targetAdgKgDay: productionType === 'carne' ? Number(targetAdgKgDay) : undefined,
        eggsPerDayPct: productionType === 'ovos' ? Number(eggsPerDayPct) : undefined,
      },
      targetDmiKgDay: Number(targetDmiKgDay),
    };
    onSaveProfile(newProfile);
    setIsModalOpen(false);
  };

  const filtered = profiles.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lotNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpecies = filterSpecies === 'todas' || p.species === filterSpecies;
    return matchSearch && matchSpecies;
  });

  return (
    <div id="animal-profiles-view" className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar lote, raça ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={filterSpecies}
            onChange={(e) => setFilterSpecies(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="todas">Todas as Espécies</option>
            <option value="bovinos_leite">Bovinos Leite</option>
            <option value="bovinos_corte">Bovinos Corte</option>
            <option value="bezerros">Bezerros</option>
            <option value="bubalinos">Bubalinos</option>
            <option value="caprinos">Caprinos</option>
            <option value="ovinos">Ovinos</option>
            <option value="suinos">Suínos</option>
            <option value="aves_corte">Aves Corte</option>
            <option value="aves_postura">Aves Postura</option>
            <option value="equinos">Equinos</option>
            <option value="peixes">Piscicultura</option>
          </select>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 whitespace-nowrap transition-all"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Lote / Rebanho
        </button>
      </div>

      {/* Profiles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((profile) => (
          <div
            key={profile.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {profile.species.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {profile.lotNumber}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mt-2.5">{profile.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {profile.category} &bull; <strong className="text-slate-300">{profile.breed}</strong>
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center text-xs">
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Cabeças</span>
                  <strong className="text-white text-xs">{profile.count}</strong>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Peso Vivo</span>
                  <strong className="text-white text-xs">{profile.currentWeightKg} kg</strong>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">ECC</span>
                  <strong className="text-amber-400 text-xs">{profile.bodyConditionScore.toFixed(2)}</strong>
                </div>
              </div>

              {/* Production Goal Display */}
              <div className="mt-3 bg-slate-800/40 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Meta Produtiva:</span>
                  <strong className="text-emerald-400 font-semibold">
                    {profile.productionGoal.type === 'leite' && `${profile.productionGoal.targetMilkLitersDay} L/dia (${profile.productionGoal.milkFatPct}% Gordura)`}
                    {profile.productionGoal.type === 'carne' && `${profile.productionGoal.targetAdgKgDay} kg/dia (GMD)`}
                    {profile.productionGoal.type === 'ovos' && `${profile.productionGoal.eggsPerDayPct}% de Postura`}
                  </strong>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-400">CMS Estimado:</span>
                  <span className="text-slate-200">{profile.targetDmiKgDay} kg MS/cab/dia</span>
                </div>
              </div>
            </div>

            {/* Actions Bottom Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(profile)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-all"
                  title="Editar Lote"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteProfile(profile.id)}
                  className="p-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 rounded-md transition-all"
                  title="Excluir"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => onFormulateForProfile(profile)}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 text-xs font-bold rounded-lg flex items-center gap-1 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Formular Dieta
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Animal Lot Registration */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                {editingProfile ? 'Editar Cadastro de Lote' : 'Novo Lote / Perfil Animal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Nome do Lote / Identificação *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Lote 01 - Vacas Alta Produção"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Espécie *</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="bovinos_leite">Bovinos de Leite</option>
                    <option value="bovinos_corte">Bovinos de Corte</option>
                    <option value="bezerros">Bezerros / Creep-Feeding</option>
                    <option value="bubalinos">Bubalinos</option>
                    <option value="caprinos">Caprinos</option>
                    <option value="ovinos">Ovinos</option>
                    <option value="suinos">Suínos</option>
                    <option value="aves_corte">Aves de Corte</option>
                    <option value="aves_postura">Aves de Postura</option>
                    <option value="equinos">Equinos</option>
                    <option value="peixes">Peixes / Piscicultura</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Categoria Zootécnica</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Vacas em Lactação (30-40L)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Raça / Cruzamento</label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="Ex: Holandesa, Girolando, Nelore"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Sexo</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="femea">Fêmeas</option>
                    <option value="macho">Machos</option>
                    <option value="misto">Misto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Nº de Animais</label>
                  <input
                    type="number"
                    min="1"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Peso Vivo Médio (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentWeightKg}
                    onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Escore Corporal (ECC)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="1"
                    max="5"
                    value={bodyConditionScore}
                    onChange={(e) => setBodyConditionScore(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Idade (Meses)</label>
                  <input
                    type="number"
                    value={ageMonths}
                    onChange={(e) => setAgeMonths(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Production Goal Section */}
              <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60 space-y-3">
                <span className="text-emerald-400 font-bold block">Objetivo Produtivo & Consumo</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Tipo de Produção</label>
                    <select
                      value={productionType}
                      onChange={(e) => setProductionType(e.target.value as any)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="leite">Produção de Leite</option>
                      <option value="carne">Produção de Carne (GMD)</option>
                      <option value="ovos">Produção de Ovos (% Postura)</option>
                      <option value="manutencao">Manutenção / Reprodução</option>
                    </select>
                  </div>

                  {productionType === 'leite' && (
                    <>
                      <div>
                        <label className="text-slate-400 block mb-1">Produção Alvo (Litros/dia)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={targetMilkLitersDay}
                          onChange={(e) => setTargetMilkLitersDay(Number(e.target.value))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">% Gordura do Leite</label>
                        <input
                          type="number"
                          step="0.1"
                          value={milkFatPct}
                          onChange={(e) => setMilkFatPct(Number(e.target.value))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </>
                  )}

                  {productionType === 'carne' && (
                    <div>
                      <label className="text-slate-400 block mb-1">GMD Alvo (kg/dia)</label>
                      <input
                        type="number"
                        step="0.05"
                        value={targetAdgKgDay}
                        onChange={(e) => setTargetAdgKgDay(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {productionType === 'ovos' && (
                    <div>
                      <label className="text-slate-400 block mb-1">% Postura Diária Alvo</label>
                      <input
                        type="number"
                        step="0.5"
                        value={eggsPerDayPct}
                        onChange={(e) => setEggsPerDayPct(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-slate-400 block mb-1">CMS Estimado (kg MS/dia)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={targetDmiKgDay}
                      onChange={(e) => setTargetDmiKgDay(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Código / Nº do Lote</label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Localização na Fazenda</label>
                  <input
                    type="text"
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    placeholder="Ex: Piquete 04, Galpão Free-Stall"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-lg shadow-emerald-500/20"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
