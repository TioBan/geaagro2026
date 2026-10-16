import React, { useState } from 'react';
import {
  CaprineAnimal,
  CaprineMilkRecord,
  CaprineWeighingRecord,
  CaprineHealthRecord,
  CaprineReproductionRecord,
  CaprinePhotoEntry
} from '../../types/caprine';
import {
  Sparkles,
  QrCode,
  ShieldCheck,
  Milk,
  Scale,
  Activity,
  Heart,
  Syringe,
  Camera,
  Calendar,
  FileText,
  Dna,
  Users,
  Award,
  ChevronRight
} from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  selectedAnimalId?: string;
  milkLogs: CaprineMilkRecord[];
  weighings: CaprineWeighingRecord[];
  healthRecords: CaprineHealthRecord[];
  reproductionRecords: CaprineReproductionRecord[];
  photos: CaprinePhotoEntry[];
  onSelectAnimal: (id: string) => void;
}

export const CaprineDigitalTwinView: React.FC<Props> = ({
  animals,
  selectedAnimalId,
  milkLogs,
  weighings,
  healthRecords,
  reproductionRecords,
  photos,
  onSelectAnimal
}) => {
  const currentAnimal = animals.find(a => a?.id === selectedAnimalId) || animals[0];

  if (!currentAnimal) {
    return (
      <div className="p-8 text-center text-stone-500">
        Nenhum caprino selecionado ou rebanho vazio.
      </div>
    );
  }

  // Filter records for current animal
  const animalMilk = milkLogs.filter(m => m?.animalId === currentAnimal.id);
  const animalWeighings = weighings.filter(w => w?.animalId === currentAnimal.id);
  const animalHealth = healthRecords.filter(h => h?.animalId === currentAnimal.id);
  const animalRepro = reproductionRecords.filter(r => r?.animalId === currentAnimal.id);
  const animalPhotos = photos.filter(p => p?.animalId === currentAnimal.id);

  // Total Milk liters
  const totalMilkLiters = animalMilk.reduce((acc, curr) => acc + curr.totalLiters, 0);
  const avgMilkLiters = animalMilk.length > 0 ? (totalMilkLiters / animalMilk.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Top Selector Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            Gêmeo Digital do Caprino 360° (Passaporte GeaAgro)
          </h1>
          <p className="text-xs text-stone-500">
            Ficha cibernética individual, histórico zootécnico, genealogia e rastreabilidade total.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Animal:</label>
          <select
            value={currentAnimal.id}
            onChange={e => onSelectAnimal(e.target.value)}
            className="flex-1 sm:w-64 p-2 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white font-bold rounded-xl text-xs border border-stone-200 dark:border-zinc-700"
          >
            {animals.map(a => (
              <option key={a?.id || Math.random()} value={a?.id || ''}>
                {a?.earTag} - {a?.name} ({a?.breed})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 360° Passport Header */}
      <div className="bg-gradient-to-br from-stone-900 via-zinc-900 to-emerald-950 rounded-2xl p-6 text-white shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Left: Photo & Identification */}
        <div className="flex items-center gap-4">
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-lg shrink-0">
            <img
              src={currentAnimal.photoUrl || 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=600&q=80'}
              alt={currentAnimal.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 right-1 bg-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded text-white">
              {currentAnimal.status}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                {currentAnimal.earTag}
              </span>
              <span className="text-xs text-stone-300 font-medium">{currentAnimal.breed}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{currentAnimal.name}</h2>
            <p className="text-xs text-stone-300 flex items-center gap-1 font-mono">
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              RFID: {currentAnimal.rfidCode}
            </p>
            <p className="text-xs text-stone-400">
              {currentAnimal.category} • {currentAnimal.sex}
            </p>
          </div>
        </div>

        {/* Center: Key Biometric Cards */}
        <div className="grid grid-cols-3 gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="text-center">
            <span className="text-[10px] text-stone-400 block uppercase">Peso Vivo</span>
            <span className="text-lg font-black text-emerald-400">{currentAnimal.weightKg} <span className="text-xs font-normal text-stone-300">kg</span></span>
            <span className="text-[9px] text-stone-400 block mt-0.5">ECC: {currentAnimal.bodyConditionScore}</span>
          </div>

          <div className="text-center border-x border-white/10 px-2">
            <span className="text-[10px] text-stone-400 block uppercase">FAMACHA</span>
            <span className={`text-lg font-black ${currentAnimal.famachaScore === 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
              Grau {currentAnimal.famachaScore || 1}
            </span>
            <span className="text-[9px] text-stone-400 block mt-0.5">Mucosa Ok</span>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-stone-400 block uppercase">Leite Média</span>
            <span className="text-lg font-black text-sky-400">{avgMilkLiters} <span className="text-xs font-normal text-stone-300">L/dia</span></span>
            <span className="text-[9px] text-stone-400 block mt-0.5">{animalMilk.length} ordenhas</span>
          </div>
        </div>

        {/* Right: Genealogy & Lot Details */}
        <div className="space-y-2 text-xs bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="flex justify-between">
            <span className="text-stone-400">Pai (Sire):</span>
            <span className="font-bold text-emerald-300">{currentAnimal.fatherName || 'Pai Registrado'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Mãe (Dam):</span>
            <span className="font-bold text-emerald-300">{currentAnimal.motherName || 'Mãe Registrada'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Grau de Sangue:</span>
            <span className="font-semibold text-stone-200">{currentAnimal.bloodDegree}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Lote / Aprisco:</span>
            <span className="font-semibold text-stone-200">{currentAnimal.lot}</span>
          </div>
        </div>
      </div>

      {/* Grid Layout: Genealogy, Production, Health, Photo Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genealogy Tree Card */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Dna className="w-5 h-5 text-purple-600" />
            Árvore Genealógica (Pedigree 3 Gerações)
          </h3>

          <div className="space-y-2 text-xs">
            {/* Parents Box */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-xl">
              <div>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-bold block">Pai (Macho Reprodutor)</span>
                <span className="font-bold text-stone-900 dark:text-white">{currentAnimal.fatherName || 'Bode Trovão PO'}</span>
                <span className="block text-[10px] text-stone-500">Boer / Anglo PO</span>
              </div>
              <div>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-bold block">Mãe (Matriz Leiteira)</span>
                <span className="font-bold text-stone-900 dark:text-white">{currentAnimal.motherName || 'Rainha do Sertão'}</span>
                <span className="block text-[10px] text-stone-500">Saanen / Anglo PO</span>
              </div>
            </div>

            {/* Grandparents Box */}
            <div className="grid grid-cols-4 gap-2 text-[11px] p-3 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200/60 dark:border-zinc-700/60">
              <div>
                <span className="text-[9px] text-stone-400 block">Avô Pat.</span>
                <span className="font-bold">{currentAnimal.paternalGrandfather || 'Imperador PO'}</span>
              </div>
              <div>
                <span className="text-[9px] text-stone-400 block">Avó Pat.</span>
                <span className="font-bold">{currentAnimal.paternalGrandmother || 'Princesa PO'}</span>
              </div>
              <div>
                <span className="text-[9px] text-stone-400 block">Avô Mat.</span>
                <span className="font-bold">{currentAnimal.maternalGrandfather || 'Sultão PO'}</span>
              </div>
              <div>
                <span className="text-[9px] text-stone-400 block">Avó Mat.</span>
                <span className="font-bold">{currentAnimal.maternalGrandmother || 'Nuvens PO'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Milk & Weight Logs Card */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Milk className="w-5 h-5 text-sky-600" />
            Produção Leiteira & Controle de Peso
          </h3>

          {animalMilk.length > 0 ? (
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-500 block">Registros de Ordenha Recentes:</span>
              <div className="divide-y divide-stone-100 dark:divide-zinc-800 text-xs">
                {animalMilk.map(m => (
                  <div key={m.id} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-stone-900 dark:text-white">{m.date}</span>
                      <span className="text-stone-500 text-[10px] block">Manhã: {m.morningLiters}L • Tarde: {m.afternoonLiters}L</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sky-600">{m.totalLiters} Litros</span>
                      <span className="text-[10px] text-stone-400 block">Gordura: {m.fatPct}% • Proteína: {m.proteinPct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-stone-500 italic bg-stone-50 dark:bg-zinc-800 p-3 rounded-xl">
              Nenhum registro de ordenha direto para este animal.
            </p>
          )}
        </div>

        {/* Health & Vaccination Timeline Card */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Syringe className="w-5 h-5 text-emerald-600" />
            Histórico Sanitário & Protocolos FAMACHA
          </h3>

          {animalHealth.length > 0 ? (
            <div className="space-y-3 text-xs">
              {animalHealth.map(h => (
                <div key={h.id} className="p-3 bg-stone-50 dark:bg-zinc-800/60 rounded-xl border border-stone-200/60 dark:border-zinc-700/60 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-stone-900 dark:text-white">{h.productName}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                      {h.date}
                    </span>
                  </div>
                  <p className="text-stone-500">{h.type} • Dosagem: {h.dosage} • Vet: {h.veterinarian}</p>
                  {h.notes && <p className="text-[11px] text-stone-600 dark:text-stone-400 italic">{h.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500 italic bg-stone-50 dark:bg-zinc-800 p-3 rounded-xl">
              Sem ocorrências sanitárias ativas registradas.
            </p>
          )}
        </div>

        {/* Photo Diary for Animal */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-500" />
            Galeria do Diário Fotográfico
          </h3>

          {animalPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {animalPhotos.map(p => (
                <div key={p.id} className="rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800 p-2 space-y-1">
                  <img src={p.photoUrl} alt={p.title} className="w-full h-24 object-cover rounded-lg" />
                  <span className="font-bold text-xs text-stone-900 dark:text-white block truncate">{p.title}</span>
                  <span className="text-[10px] text-stone-500 block">{p.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500 italic bg-stone-50 dark:bg-zinc-800 p-3 rounded-xl">
              Nenhuma foto vinculada especificamente a este caprino.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
