import React from 'react';
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
  Milk,
  Syringe,
  Camera,
  Dna,
  Heart,
  Scale
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

const FALLBACK_GOAT_IMG =
  'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=600&q=80';

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
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-1.5">
        <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
          Nenhum caprino selecionado ou plantel vazio.
        </p>
        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
          Cadastre animais na aba Cadastro RFID para visualizar o passaporte individual 360°.
        </p>
      </div>
    );
  }

  const animalMilk = milkLogs.filter(m => m.animalId === currentAnimal.id);
  const animalWeighings = weighings.filter(w => w.animalId === currentAnimal.id);
  const animalHealth = healthRecords.filter(h => h.animalId === currentAnimal.id);
  const animalRepro = reproductionRecords.filter(r => r.animalId === currentAnimal.id);
  const animalPhotos = photos.filter(p => p.animalId === currentAnimal.id);

  const totalMilkLiters = animalMilk.reduce((acc, curr) => acc + curr.totalLiters, 0);
  const avgMilkLiters = animalMilk.length > 0 ? (totalMilkLiters / animalMilk.length).toFixed(1) : '0.0';
  const famacha = currentAnimal.famachaScore || 1;

  return (
    <div className="space-y-5">
      {/* Header + Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Gêmeo Digital do Caprino 360°
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Passaporte individual com biometria, pedigree, produção, sanidade e galeria.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 shrink-0">
            Animal:
          </label>
          <select
            value={currentAnimal.id}
            onChange={e => onSelectAnimal(e.target.value)}
            className="flex-1 sm:w-64 h-8 px-2.5 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 font-medium rounded-lg text-xs border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {animals.map(a => (
              <option key={a.id} value={a.id}>
                {a.earTag} — {a.name} ({a.breed})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Single-Elevation Passport Card */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={currentAnimal.photoUrl || FALLBACK_GOAT_IMG}
              alt={currentAnimal.name}
              className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-zinc-700 shrink-0"
            />
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded-md">
                  {currentAnimal.earTag}
                </span>
                <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                  {currentAnimal.status}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {currentAnimal.breed}
                </span>
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 truncate">
                {currentAnimal.name}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                RFID: {currentAnimal.rfidCode}
              </p>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                {currentAnimal.category} · {currentAnimal.sex} · Lote: {currentAnimal.lot}
              </p>
            </div>
          </div>

          {/* Right Lineage Summary */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs border-t md:border-t-0 md:border-l border-slate-200 dark:border-zinc-800 pt-3 md:pt-0 md:pl-5 shrink-0">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pai</span>
              <span className="font-medium text-slate-900 dark:text-zinc-100">
                {currentAnimal.fatherName || 'Não informado'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Mãe</span>
              <span className="font-medium text-slate-900 dark:text-zinc-100">
                {currentAnimal.motherName || 'Não informada'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Grau de Sangue
              </span>
              <span className="font-medium text-slate-900 dark:text-zinc-100">
                {currentAnimal.bloodDegree}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Nascimento
              </span>
              <span className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
                {currentAnimal.birthDate || '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Hairline Biometric KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-200 dark:border-zinc-800 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 bg-slate-50/50 dark:bg-zinc-950/30">
          <div className="px-4 py-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Peso Vivo</span>
            <span className="text-base font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
              {currentAnimal.weightKg} kg
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              ECC {currentAnimal.bodyConditionScore}
            </span>
          </div>
          <div className="px-4 py-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">FAMACHA</span>
            <span
              className={`text-base font-semibold tabular-nums ${
                famacha >= 3
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              Grau {famacha}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              {famacha >= 3 ? 'Requer atenção' : 'Mucosa saudável'}
            </span>
          </div>
          <div className="px-4 py-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Leite Médio</span>
            <span className="text-base font-semibold tabular-nums text-sky-600 dark:text-sky-400">
              {avgMilkLiters} L/dia
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">
              {animalMilk.length} ordenha(s)
            </span>
          </div>
          <div className="px-4 py-3">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
              Eventos Registrados
            </span>
            <span className="text-base font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
              {animalWeighings.length + animalHealth.length + animalRepro.length}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">
              {animalWeighings.length} pes. · {animalRepro.length} repr.
            </span>
          </div>
        </div>
      </div>

      {/* Detail Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pedigree Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Dna className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            Árvore Genealógica (3 Gerações)
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
              <span className="text-[11px] text-violet-600 dark:text-violet-400 font-medium block">
                Pai (Reprodutor)
              </span>
              <span className="font-semibold text-slate-900 dark:text-zinc-100 block mt-0.5">
                {currentAnimal.fatherName || 'Não informado'}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">
                Mãe (Matriz)
              </span>
              <span className="font-semibold text-slate-900 dark:text-zinc-100 block mt-0.5">
                {currentAnimal.motherName || 'Não informada'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Avô Pat.</span>
              <span className="font-medium text-slate-800 dark:text-zinc-200">
                {currentAnimal.paternalGrandfather || '--'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Avó Pat.</span>
              <span className="font-medium text-slate-800 dark:text-zinc-200">
                {currentAnimal.paternalGrandmother || '--'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Avô Mat.</span>
              <span className="font-medium text-slate-800 dark:text-zinc-200">
                {currentAnimal.maternalGrandfather || '--'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Avó Mat.</span>
              <span className="font-medium text-slate-800 dark:text-zinc-200">
                {currentAnimal.maternalGrandmother || '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Milk & Weighings Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Milk className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Produção Leiteira &amp; Pesagens
          </h3>

          {animalMilk.length === 0 && animalWeighings.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-3">
              Nenhum registro de ordenha ou pesagem vinculado a este animal.
            </p>
          ) : (
            <div className="space-y-3">
              {animalMilk.length > 0 && (
                <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                  {animalMilk.slice(0, 4).map(m => (
                    <div key={m.id} className="py-2 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-medium font-mono text-slate-900 dark:text-zinc-100">
                          {m.date}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block tabular-nums">
                          Manhã {m.morningLiters}L · Tarde {m.afternoonLiters}L
                        </span>
                      </div>
                      <div className="text-right tabular-nums">
                        <span className="font-semibold text-sky-600 dark:text-sky-400">
                          {m.totalLiters} L
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                          Gord. {m.fatPct ?? '--'}% · Prot. {m.proteinPct ?? '--'}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {animalWeighings.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" />
                    Últimas Pesagens
                  </span>
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                    {animalWeighings.slice(0, 3).map(w => (
                      <div key={w.id} className="py-1.5 flex items-center justify-between tabular-nums">
                        <span className="font-mono text-slate-600 dark:text-zinc-400">{w.date}</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {w.weightKg} kg {w.gmdGramsDay ? `(${w.gmdGramsDay} g/d)` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Health & Reproduction Card */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Syringe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Sanidade &amp; Histórico Reprodutivo
          </h3>

          {animalHealth.length === 0 && animalRepro.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-3">
              Sem ocorrências sanitárias ou eventos reprodutivos registrados.
            </p>
          ) : (
            <div className="space-y-3">
              {animalHealth.length > 0 && (
                <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                  {animalHealth.slice(0, 4).map(h => (
                    <div key={h.id} className="py-2 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-900 dark:text-zinc-100">
                          {h.productName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                          {h.date}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {h.type} · {h.dosage} · {h.veterinarian}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {animalRepro.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Reprodução
                  </span>
                  <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                    {animalRepro.slice(0, 3).map(r => (
                      <div key={r.id} className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-800 dark:text-zinc-200 font-medium">
                          {r.eventType}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                          {r.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Photo Gallery */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Galeria do Diário Fotográfico
          </h3>

          {animalPhotos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {animalPhotos.map(p => (
                <div
                  key={p.id}
                  className="rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800"
                >
                  <img src={p.photoUrl} alt={p.title} className="w-full h-24 object-cover" />
                  <div className="p-2">
                    <span className="font-medium text-xs text-slate-900 dark:text-zinc-100 block truncate">
                      {p.title}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 block">
                      {p.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-3">
              Nenhuma foto vinculada especificamente a este caprino.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
