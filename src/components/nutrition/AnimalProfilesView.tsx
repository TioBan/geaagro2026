import React, { useMemo, useState } from 'react';
import { AnimalProfile, AnimalSpecies } from '../../types/animalNutrition';
import { getSpeciesLabel, SPECIES_OPTIONS } from './nutritionConstants';
import {
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  Search,
  X,
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
    setProductionType(
      p.productionGoal.type === 'trabalho' ? 'manutencao' : p.productionGoal.type
    );
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
      name: name.trim(),
      species,
      category: category.trim() || 'Geral',
      breed: breed.trim() || 'Mestiço',
      sex,
      ageMonths: Number(ageMonths),
      currentWeightKg: Number(currentWeightKg),
      bodyConditionScore: Number(bodyConditionScore),
      count: Math.max(1, Number(count)),
      lotNumber: lotNumber.trim() || `LOTE-${Date.now().toString().slice(-4)}`,
      farmLocation: farmLocation.trim(),
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

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return profiles.filter((p) => {
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.breed.toLowerCase().includes(q) ||
        p.lotNumber.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      const matchSpecies = filterSpecies === 'todas' || p.species === filterSpecies;
      return matchSearch && matchSpecies;
    });
  }, [profiles, searchTerm, filterSpecies]);

  const inputCls =
    'w-full h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500';

  return (
    <div id="animal-profiles-view" className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar lote, raça, categoria ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-8 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={filterSpecies}
            onChange={(e) => setFilterSpecies(e.target.value as AnimalSpecies | 'todas')}
            className="h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="todas">Todas as Espécies</option>
            {SPECIES_OPTIONS.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.shortLabel}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={openNewModal}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Lote / Perfil
        </button>
      </div>

      {/* Empty State or Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-10 px-4 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {profiles.length === 0
              ? 'Nenhum lote animal cadastrado'
              : 'Nenhum lote corresponde aos filtros informados'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Cadastre lotes com peso médio, escore corporal e meta produtiva para calcular exigências NRC/BR-CORTE automaticamente.
          </p>
          {profiles.length === 0 && (
            <button
              type="button"
              onClick={openNewModal}
              className="mt-4 h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Primeiro Lote
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((profile) => (
            <div
              key={profile.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-lg p-4 flex flex-col justify-between transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    {getSpeciesLabel(profile.species)}
                  </span>
                  <span className="font-mono text-[11px] tabular-nums">{profile.lotNumber}</span>
                </div>

                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5">
                  {profile.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {profile.category} · <strong className="font-medium text-slate-700 dark:text-slate-300">{profile.breed}</strong>
                </p>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs tabular-nums">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Cabeças</span>
                    <strong className="text-slate-900 dark:text-slate-100">{profile.count}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Peso Vivo</span>
                    <strong className="text-slate-900 dark:text-slate-100">{profile.currentWeightKg} kg</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">ECC</span>
                    <strong className="text-amber-700 dark:text-amber-400">{profile.bodyConditionScore.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 tabular-nums">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 dark:text-slate-400">Meta Produtiva</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 font-medium text-right">
                      {profile.productionGoal.type === 'leite' &&
                        `${profile.productionGoal.targetMilkLitersDay ?? 0} L/d (${profile.productionGoal.milkFatPct ?? 3.8}% G)`}
                      {profile.productionGoal.type === 'carne' &&
                        `${profile.productionGoal.targetAdgKgDay ?? 0} kg/d GMD`}
                      {profile.productionGoal.type === 'ovos' &&
                        `${profile.productionGoal.eggsPerDayPct ?? 0}% postura`}
                      {(profile.productionGoal.type === 'manutencao' || profile.productionGoal.type === 'trabalho') &&
                        'Manutenção / Reprodução'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">CMS Estimado</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {profile.targetDmiKgDay} kg MS/cab/dia
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {confirmDeleteId === profile.id ? (
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteProfile(profile.id);
                        setConfirmDeleteId(null);
                      }}
                      className="h-7 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="h-7 px-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-md"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(profile)}
                      className="h-7 w-7 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md transition-colors"
                      title="Editar lote"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(profile.id)}
                      className="h-7 w-7 inline-flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 rounded-md transition-colors"
                      title="Excluir lote"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onFormulateForProfile(profile)}
                  className="h-7 px-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium rounded-md inline-flex items-center gap-1 whitespace-nowrap transition-colors"
                >
                  Formular Dieta
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register / Edit Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full shadow-lg my-6 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {editingProfile ? 'Editar Cadastro de Lote' : 'Novo Lote / Perfil Animal'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar modal"
                className="h-7 w-7 inline-flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                    Nome do Lote / Identificação *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Lote 01 - Vacas Alta Produção"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                    Espécie *
                  </label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as AnimalSpecies)}
                    className={inputCls}
                  >
                    {SPECIES_OPTIONS.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                    Categoria Zootécnica
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Vacas em Lactação (30-40L)"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                    Raça / Cruzamento
                  </label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="Ex: Holandesa, Girolando, Nelore"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Sexo</label>
                  <select
                    value={sex}
                    onChange={(e) => setSex(e.target.value as 'macho' | 'femea' | 'misto')}
                    className={inputCls}
                  >
                    <option value="femea">Fêmeas</option>
                    <option value="macho">Machos</option>
                    <option value="misto">Misto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Nº de Animais</label>
                  <input
                    type="number"
                    min="1"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Peso Vivo Médio (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentWeightKg}
                    onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Escore Corporal (ECC)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="1"
                    max="5"
                    value={bodyConditionScore}
                    onChange={(e) => setBodyConditionScore(Number(e.target.value))}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Idade (Meses)</label>
                  <input
                    type="number"
                    value={ageMonths}
                    onChange={(e) => setAgeMonths(Number(e.target.value))}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                  Objetivo Produtivo & Consumo
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Tipo de Produção</label>
                    <select
                      value={productionType}
                      onChange={(e) =>
                        setProductionType(e.target.value as 'leite' | 'carne' | 'ovos' | 'manutencao')
                      }
                      className={inputCls}
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
                        <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                          Produção Alvo (L/dia)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          value={targetMilkLitersDay}
                          onChange={(e) => setTargetMilkLitersDay(Number(e.target.value))}
                          className={`${inputCls} tabular-nums`}
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                          % Gordura do Leite
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={milkFatPct}
                          onChange={(e) => setMilkFatPct(Number(e.target.value))}
                          className={`${inputCls} tabular-nums`}
                        />
                      </div>
                    </>
                  )}

                  {productionType === 'carne' && (
                    <div>
                      <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                        GMD Alvo (kg/dia)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={targetAdgKgDay}
                        onChange={(e) => setTargetAdgKgDay(Number(e.target.value))}
                        className={`${inputCls} tabular-nums`}
                      />
                    </div>
                  )}

                  {productionType === 'ovos' && (
                    <div>
                      <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                        % Postura Diária
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={eggsPerDayPct}
                        onChange={(e) => setEggsPerDayPct(Number(e.target.value))}
                        className={`${inputCls} tabular-nums`}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">
                      CMS Estimado (kg MS/dia)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={targetDmiKgDay}
                      onChange={(e) => setTargetDmiKgDay(Number(e.target.value))}
                      className={`${inputCls} tabular-nums`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Código / Nº do Lote</label>
                  <input
                    type="text"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Localização na Fazenda</label>
                  <input
                    type="text"
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    placeholder="Ex: Piquete 04, Galpão Free-Stall"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors"
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
