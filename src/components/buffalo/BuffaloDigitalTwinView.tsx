import React, { useState } from 'react';
import { BuffaloAnimal, BuffaloPhoto } from '../../types/buffalo';
import { calculateMozzarellaYieldLitersPerKg } from '../../data/buffaloData';
import {
  Activity,
  Milk,
  Scale,
  ShieldCheck,
  HeartPulse,
  Camera,
  Plus,
  ArrowLeft,
  X
} from 'lucide-react';

interface BuffaloDigitalTwinViewProps {
  animals: BuffaloAnimal[];
  selectedAnimalId: string;
  onSelectAnimal: (id: string) => void;
  onBackToRegistry: () => void;
  onUpdateAnimal: (animal: BuffaloAnimal) => void;
}

const inputCls =
  'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-teal-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const BuffaloDigitalTwinView: React.FC<BuffaloDigitalTwinViewProps> = ({
  animals,
  selectedAnimalId,
  onSelectAnimal,
  onBackToRegistry,
  onUpdateAnimal
}) => {
  const animal = animals.find(a => a?.id === selectedAnimalId) || animals[0];

  const [activeSubTab, setActiveSubTab] = useState<
    'biometria' | 'leite' | 'peso_gmd' | 'reproducao' | 'sanidade' | 'fotos'
  >('biometria');

  // Modal Pesagem
  const [showWeighingModal, setShowWeighingModal] = useState(false);
  const [newWeightKg, setNewWeightKg] = useState(0);
  const [newBcs, setNewBcs] = useState(3.5);
  const [weighingNotes, setWeighingNotes] = useState('');

  // Modal Leite
  const [showMilkModal, setShowMilkModal] = useState(false);
  const [newMilkLiters, setNewMilkLiters] = useState(0);
  const [newFatPct, setNewFatPct] = useState(7.8);
  const [newProteinPct, setNewProteinPct] = useState(4.4);
  const [newCcs, setNewCcs] = useState(110);

  // Modal Foto
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoTag, setPhotoTag] = useState<BuffaloPhoto['tag']>('Identificação');

  if (!animal) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-10 text-center space-y-2.5">
        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
          Nenhum búfalo selecionado para o Gêmeo Digital 360°
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Cadastre ao menos um animal no registro individual para abrir o passaporte completo.
        </p>
        <button
          type="button"
          onClick={onBackToRegistry}
          className="h-8 px-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
        >
          Ir para o Cadastro
        </button>
      </div>
    );
  }

  const openWeighingModal = () => {
    setNewWeightKg(animal.currentWeightKg || 0);
    setNewBcs(animal.bodyConditionScore || 3.5);
    setWeighingNotes('');
    setShowWeighingModal(true);
  };

  const openMilkModal = () => {
    setNewMilkLiters(animal.averageDailyMilkLiters || 0);
    setNewFatPct(animal.averageFatPct || 7.8);
    setNewProteinPct(animal.averageProteinPct || 4.4);
    setNewCcs(110);
    setShowMilkModal(true);
  };

  const openPhotoModal = () => {
    setPhotoUrl('');
    setPhotoCaption('');
    setPhotoTag('Identificação');
    setShowPhotoModal(true);
  };

  const handleAddWeighing = (e: React.FormEvent) => {
    e.preventDefault();
    const weighings = animal.weighings || [];
    const lastWeight = weighings.length > 0 ? weighings[weighings.length - 1].weightKg : animal.currentWeightKg || 0;
    const diff = Number(newWeightKg) - lastWeight;
    const gmd = diff > 0 ? Number((diff / 30).toFixed(2)) : 0;

    const newEntry = {
      id: `w-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: Number(newWeightKg),
      bodyConditionScore: Number(newBcs),
      dailyGainKg: gmd,
      notes: weighingNotes.trim() || undefined
    };

    onUpdateAnimal({
      ...animal,
      currentWeightKg: Number(newWeightKg),
      bodyConditionScore: Number(newBcs),
      weighings: [...weighings, newEntry]
    });
    setShowWeighingModal(false);
  };

  const handleAddMilk = (e: React.FormEvent) => {
    e.preventDefault();
    const fat = Number(newFatPct) || 0;
    const protein = Number(newProteinPct) || 0;
    const liters = Number(newMilkLiters) || 0;
    const yieldLitersPerKg = fat > 0 && protein > 0 ? calculateMozzarellaYieldLitersPerKg(fat, protein) : 0;
    const estimatedMozzarella = yieldLitersPerKg > 0 ? Number((liters / yieldLitersPerKg).toFixed(2)) : 0;

    const newRecord = {
      id: `m-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      milkingSession: 'Total do Dia' as const,
      productionLiters: liters,
      fatPercentage: fat,
      proteinPercentage: protein,
      lactosePercentage: 4.9,
      totalSolidsPercentage: Number((fat + protein + 5.9).toFixed(1)),
      somaticCellCountThousands: Number(newCcs) || 0,
      totalBacterialCountThousands: 15,
      cmtScore: 'Negativo' as const,
      estimatedMozzarellaYieldKg: estimatedMozzarella
    };

    onUpdateAnimal({
      ...animal,
      averageDailyMilkLiters: liters,
      averageFatPct: fat,
      averageProteinPct: protein,
      milkRecords: [...(animal.milkRecords || []), newRecord]
    });
    setShowMilkModal(false);
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;
    const entry: BuffaloPhoto = {
      id: `ph-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      url: photoUrl.trim(),
      caption: photoCaption.trim() || `Registro visual — ${animal.name}`,
      tag: photoTag
    };
    onUpdateAnimal({
      ...animal,
      photos: [entry, ...(animal.photos || [])]
    });
    setShowPhotoModal(false);
  };

  const tabs: { id: typeof activeSubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'biometria', label: 'Biometria & Pedigree', icon: Activity },
    { id: 'leite', label: `Lactação (${animal.milkRecords?.length || 0})`, icon: Milk },
    { id: 'peso_gmd', label: `Pesagens (${animal.weighings?.length || 0})`, icon: Scale },
    { id: 'reproducao', label: `Reprodução (${animal.reproductionRecords?.length || 0})`, icon: HeartPulse },
    { id: 'sanidade', label: `Sanidade (${animal.healthRecords?.length || 0})`, icon: ShieldCheck },
    { id: 'fotos', label: `Fotos (${animal.photos?.length || 0})`, icon: Camera }
  ];

  const yieldLitersPerKg =
    animal.averageFatPct && animal.averageProteinPct
      ? calculateMozzarellaYieldLitersPerKg(animal.averageFatPct, animal.averageProteinPct)
      : 0;

  return (
    <div className="space-y-4">
      {/* Barra superior com voltar e seletor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBackToRegistry}
            title="Voltar ao Cadastro"
            className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 inline-flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-teal-600 dark:text-teal-400">Passaporte Digital 360°</p>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              <span className="tabular-nums">{animal.identificationNumber}</span> · {animal.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">Animal:</label>
          <select
            value={animal.id}
            onChange={(e) => onSelectAnimal(e.target.value)}
            className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-900 dark:text-zinc-100 cursor-pointer"
          >
            {animals.map(a => (
              <option key={a.id} value={a.id}>
                {a.identificationNumber} - {a.name} ({a.breed})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cartão Resumo do Passaporte (Superfície única Light/Dark/AMOLED) */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
              {animal.photos && animal.photos.length > 0 ? (
                <img
                  src={animal.photos[0].url}
                  alt={animal.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Activity className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              )}
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                <span className="font-medium text-teal-600 dark:text-teal-400">{animal.breed}</span>
                <span aria-hidden="true">·</span>
                <span>{animal.bloodDegree}</span>
                <span aria-hidden="true">·</span>
                <span>{animal.status}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">{animal.name}</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                Brinco {animal.identificationNumber} · RFID {animal.rfidCode || 'Não informado'} · Lote{' '}
                {animal.batchName || 'Geral'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden shrink-0">
            <div className="px-3.5 py-2.5 text-center">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Peso / ECC</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums block">
                {animal.currentWeightKg} kg
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                ECC {animal.bodyConditionScore}/5
              </span>
            </div>
            <div className="px-3.5 py-2.5 text-center">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Leite Diário</span>
              <span className="text-sm font-semibold text-teal-600 dark:text-teal-400 tabular-nums block">
                {animal.averageDailyMilkLiters ? `${animal.averageDailyMilkLiters} L` : '—'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                {animal.averageFatPct ? `${animal.averageFatPct}% gord.` : 'Sem leite'}
              </span>
            </div>
            <div className="px-3.5 py-2.5 text-center">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Conforto</span>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums block">
                {animal.thermalComfortScore || 90}%
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">Índice térmico</span>
            </div>
          </div>
        </div>

        {/* Sub-abas do Passaporte */}
        <div className="flex items-center gap-1 overflow-x-auto px-3 pt-1.5 border-t border-slate-200 dark:border-zinc-800 no-scrollbar">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = activeSubTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveSubTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 1. Biometria & Pedigree */}
      {activeSubTab === 'biometria' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ficha Biométrica &amp; Identidade</h3>
            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Brinco</dt>
                <dd className="font-semibold text-slate-900 dark:text-white tabular-nums">
                  {animal.identificationNumber}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Registro ABCB</dt>
                <dd className="font-medium text-slate-800 dark:text-zinc-200">
                  {animal.registrationCodeABCB || 'Não informado'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Pelagem</dt>
                <dd className="font-medium text-slate-800 dark:text-zinc-200">{animal.coatColor}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Aptidão</dt>
                <dd className="font-medium text-teal-600 dark:text-teal-400">{animal.purpose}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Peso ao Nascer</dt>
                <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                  {animal.birthWeightKg ? `${animal.birthWeightKg} kg` : 'Não informado'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Data de Nascimento</dt>
                <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                  {animal.birthDate || '—'}
                </dd>
              </div>
            </dl>
            {animal.notes && (
              <p className="text-xs text-slate-600 dark:text-zinc-300 pt-2.5 border-t border-slate-100 dark:border-zinc-800">
                <strong className="text-slate-800 dark:text-zinc-200">Observações:</strong> {animal.notes}
              </p>
            )}
          </section>

          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Genealogia Registrada</h3>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              <div className="pb-2.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pai (Sire)</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {animal.sireName || 'Não informado'}
                </span>
                {animal.paternalGrandsire && (
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                    Avô Paterno: {animal.paternalGrandsire}
                  </span>
                )}
              </div>
              <div className="py-2.5">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Mãe (Dam)</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {animal.damName || 'Não informado'}
                </span>
                {animal.maternalGrandsire && (
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                    Avô Materno: {animal.maternalGrandsire}
                  </span>
                )}
              </div>
              {animal.geneticLineage && (
                <div className="pt-2.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Linhagem Genética</span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200">{animal.geneticLineage}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* 2. Lactação & Mozzarella */}
      {activeSubTab === 'leite' && (
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Controles Leiteiros &amp; Qualidade</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Rendimento de Mozzarella D.O.P. e composição físico-química
              </p>
            </div>
            <button
              type="button"
              onClick={openMilkModal}
              className="h-8 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Ordenha</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg">
            <div className="p-3">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Média Diária</span>
              <span className="text-base font-semibold text-slate-900 dark:text-white tabular-nums">
                {animal.averageDailyMilkLiters ? `${animal.averageDailyMilkLiters} L` : '—'}
              </span>
            </div>
            <div className="p-3">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Gordura</span>
              <span className="text-base font-semibold text-slate-900 dark:text-white tabular-nums">
                {animal.averageFatPct ? `${animal.averageFatPct}%` : '—'}
              </span>
            </div>
            <div className="p-3">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Proteína</span>
              <span className="text-base font-semibold text-slate-900 dark:text-white tabular-nums">
                {animal.averageProteinPct ? `${animal.averageProteinPct}%` : '—'}
              </span>
            </div>
            <div className="p-3">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Rendimento Queijeiro</span>
              <span className="text-base font-semibold text-teal-600 dark:text-teal-400 tabular-nums">
                {yieldLitersPerKg > 0 ? `${yieldLitersPerKg} L/kg` : '—'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
                <tr>
                  <th className="py-2 pr-3 font-medium">Data</th>
                  <th className="py-2 px-3 font-medium">Sessão</th>
                  <th className="py-2 px-3 font-medium text-right">Produção (L)</th>
                  <th className="py-2 px-3 font-medium text-right">Gordura</th>
                  <th className="py-2 px-3 font-medium text-right">Proteína</th>
                  <th className="py-2 px-3 font-medium text-right">Sólidos</th>
                  <th className="py-2 px-3 font-medium text-right">CCS</th>
                  <th className="py-2 pl-3 font-medium text-right">Mozzarella Est.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                {(animal.milkRecords || []).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-500 dark:text-zinc-400">
                      Nenhum controle leiteiro registrado para este animal.
                    </td>
                  </tr>
                ) : (
                  (animal.milkRecords || []).map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white">{m.date}</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-300">{m.milkingSession}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-teal-600 dark:text-teal-400">
                        {m.productionLiters} L
                      </td>
                      <td className="py-2.5 px-3 text-right">{m.fatPercentage ?? '—'}%</td>
                      <td className="py-2.5 px-3 text-right">{m.proteinPercentage ?? '—'}%</td>
                      <td className="py-2.5 px-3 text-right">{m.totalSolidsPercentage ?? '—'}%</td>
                      <td className="py-2.5 px-3 text-right">{m.somaticCellCountThousands ?? '—'}</td>
                      <td className="py-2.5 pl-3 text-right font-semibold text-slate-900 dark:text-white">
                        {m.estimatedMozzarellaYieldKg ?? '—'} kg
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 3. Pesagens & GMD */}
      {activeSubTab === 'peso_gmd' && (
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Histórico de Pesagens &amp; GMD</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Curva ponderal e condição corporal</p>
            </div>
            <button
              type="button"
              onClick={openWeighingModal}
              className="h-8 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Pesagem</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
                <tr>
                  <th className="py-2 pr-3 font-medium">Data</th>
                  <th className="py-2 px-3 font-medium text-right">Peso (kg)</th>
                  <th className="py-2 px-3 font-medium text-right">ECC</th>
                  <th className="py-2 px-3 font-medium text-right">GMD</th>
                  <th className="py-2 pl-3 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
                {(animal.weighings || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 dark:text-zinc-400">
                      Nenhuma pesagem registrada.
                    </td>
                  </tr>
                ) : (
                  (animal.weighings || []).map(w => (
                    <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white">{w.date}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-teal-600 dark:text-teal-400">
                        {w.weightKg} kg
                      </td>
                      <td className="py-2.5 px-3 text-right">{w.bodyConditionScore} / 5</td>
                      <td className="py-2.5 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                        {w.dailyGainKg ? `+${w.dailyGainKg} kg/dia` : '—'}
                      </td>
                      <td className="py-2.5 pl-3 text-slate-500 dark:text-zinc-400">
                        {w.notes || 'Pesagem de rotina'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 4. Reprodução */}
      {activeSubTab === 'reproducao' && (
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Linha do Tempo Reprodutiva</h3>
          {(animal.reproductionRecords || []).length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-6 text-center">
              Nenhum evento reprodutivo registrado. Lance eventos na aba Reprodução.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {(animal.reproductionRecords || []).map(r => (
                <div key={r.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{r.eventType}</span>
                      <span className="text-slate-500 dark:text-zinc-400 tabular-nums">{r.date}</span>
                    </div>
                    {r.notes && <p className="text-slate-600 dark:text-zinc-400 mt-0.5">{r.notes}</p>}
                  </div>
                  {r.dgResult && (
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{r.dgResult}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 5. Sanidade */}
      {activeSubTab === 'sanidade' && (
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Passaporte Sanitário</h3>
          {(animal.healthRecords || []).length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-6 text-center">
              Nenhuma vacina ou tratamento registrado. Lance ocorrências na aba Sanidade.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {(animal.healthRecords || []).map(h => (
                <div key={h.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{h.productName}</span>
                      <span className="text-slate-500 dark:text-zinc-400">· {h.type}</span>
                      <span className="text-slate-500 dark:text-zinc-400 tabular-nums">· {h.date}</span>
                    </div>
                    <p className="text-slate-600 dark:text-zinc-400 mt-0.5">
                      Dose {h.dosage} ({h.route}) · Resp.: {h.veterinarian || '—'}
                    </p>
                  </div>
                  <span className="font-medium text-teal-600 dark:text-teal-400">{h.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 6. Fotos */}
      {activeSubTab === 'fotos' && (
        <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Galeria Individual</h3>
            <button
              type="button"
              onClick={openPhotoModal}
              className="h-8 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Foto</span>
            </button>
          </div>

          {(animal.photos || []).length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-6 text-center">
              Nenhuma fotografia anexada a este búfalo.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(animal.photos || []).map(p => (
                <figure
                  key={p.id}
                  className="border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-zinc-950"
                >
                  <div className="aspect-4/3 bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                    <img
                      src={p.url}
                      alt={p.caption}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <figcaption className="p-2.5 text-xs space-y-0.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>{p.tag}</span>
                      <span className="tabular-nums">{p.date}</span>
                    </div>
                    <p className="text-slate-800 dark:text-zinc-200 font-medium">{p.caption}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Modal Nova Pesagem */}
      {showWeighingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Registrar Nova Pesagem</h3>
              <button
                type="button"
                onClick={() => setShowWeighingModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddWeighing} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls}>Peso (kg) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.5"
                    value={newWeightKg}
                    onChange={(e) => setNewWeightKg(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>ECC (1 a 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newBcs}
                    onChange={(e) => setNewBcs(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Observações</label>
                <input
                  type="text"
                  value={weighingNotes}
                  onChange={(e) => setWeighingNotes(e.target.value)}
                  placeholder="Ex: Pesagem pós-desmame"
                  className={inputCls}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowWeighingModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Controle Leiteiro */}
      {showMilkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Registrar Controle Leiteiro</h3>
              <button
                type="button"
                onClick={() => setShowMilkModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddMilk} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls}>Produção do Dia (L) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={newMilkLiters}
                    onChange={(e) => setNewMilkLiters(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>CCS (mil/mL)</label>
                  <input
                    type="number"
                    min="0"
                    value={newCcs}
                    onChange={(e) => setNewCcs(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Gordura (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="15"
                    value={newFatPct}
                    onChange={(e) => setNewFatPct(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Proteína (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newProteinPct}
                    onChange={(e) => setNewProteinPct(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowMilkModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Foto */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Adicionar Foto ao Passaporte</h3>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddPhoto} className="space-y-3">
              <div>
                <label className={labelCls}>Enviar imagem do dispositivo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  className="block w-full text-xs text-slate-500 file:mr-2 file:h-7 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-100 dark:file:bg-zinc-800 file:text-slate-700 dark:file:text-zinc-200 cursor-pointer"
                />
              </div>
              <div>
                <label className={labelCls}>Ou informe a URL da imagem</label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls}>Categoria</label>
                  <select
                    value={photoTag}
                    onChange={(e) => setPhotoTag(e.target.value as BuffaloPhoto['tag'])}
                    className={inputCls}
                  >
                    <option value="Identificação">Identificação</option>
                    <option value="Parto">Parto</option>
                    <option value="Úbere / Lactação">Úbere / Lactação</option>
                    <option value="Casco">Casco</option>
                    <option value="Lesão">Lesão</option>
                    <option value="Piquete / Banho">Piquete / Banho</option>
                    <option value="Instalação">Instalação</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Legenda</label>
                  <input
                    type="text"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    placeholder="Descrição curta"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!photoUrl.trim()}
                  className="h-8 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium cursor-pointer"
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
