import React, { useMemo, useState } from 'react';
import {
  Animal,
  HealthRecord,
  MilkRecord,
  ReproductionRecord,
  WeightRecord,
} from '../../types/livestock';
import { Plus } from 'lucide-react';

interface CommonViewProps {
  animals: Animal[];
  onUpdateAnimal: (animal: Animal) => Promise<void>;
  onOpenAddAnimal: () => void;
}

const inputCls =
  'w-full h-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500';

const EmptyHerdNotice: React.FC<{ label: string; onOpenAddAnimal: () => void }> = ({
  label,
  onOpenAddAnimal,
}) => (
  <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg py-10 px-4 text-center">
    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
      Nenhum bovino cadastrado para {label}
    </p>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
      Cadastre os animais do rebanho para lançar eventos, acompanhar indicadores e alimentar o Gêmeo Digital.
    </p>
    <button
      type="button"
      onClick={onOpenAddAnimal}
      className="mt-4 h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md inline-flex items-center gap-1.5 transition-colors"
    >
      <Plus className="w-3.5 h-3.5" />
      Cadastrar Primeiro Animal
    </button>
  </div>
);

/* ========================================================= */
/* 1. CORTE & PESAGENS (GMD)                                 */
/* ========================================================= */
export const BeefWeightView: React.FC<CommonViewProps> = ({
  animals,
  onUpdateAnimal,
  onOpenAddAnimal,
}) => {
  const [animalId, setAnimalId] = useState(animals[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState<number>(420);
  const [bcs, setBcs] = useState<number>(3.5);

  const selectedId = animals.some((a) => a.id === animalId) ? animalId : animals[0]?.id || '';

  const allWeights = useMemo(() => {
    const rows: Array<{ animal: Animal; record: WeightRecord }> = [];
    animals.forEach((a) => {
      (a.weightHistory || []).forEach((rec) => {
        rows.push({ animal: a, record: rec });
      });
    });
    return rows.sort((a, b) => b.record.date.localeCompare(a.record.date));
  }, [animals]);

  const stats = useMemo(() => {
    const avgWeight =
      animals.length > 0
        ? animals.reduce((s, a) => s + (a.currentWeight || 0), 0) / animals.length
        : 0;
    const totalArrobas = animals.reduce((s, a) => s + ((a.currentWeight || 0) * 0.5) / 15, 0);
    const gmds = allWeights.map((r) => r.record.gmd).filter((v): v is number => typeof v === 'number');
    const avgGmd = gmds.length > 0 ? gmds.reduce((s, v) => s + v, 0) / gmds.length : null;
    return { avgWeight, totalArrobas, avgGmd };
  }, [animals, allWeights]);

  if (animals.length === 0) {
    return <EmptyHerdNotice label="controle de pesagens e GMD" onOpenAddAnimal={onOpenAddAnimal} />;
  }

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = animals.find((a) => a.id === selectedId);
    if (!target || weight <= 0) return;

    const sortedPrev = [...(target.weightHistory || [])].sort((a, b) => a.date.localeCompare(b.date));
    const last = sortedPrev[sortedPrev.length - 1];
    let computedGmd: number | undefined;
    if (last) {
      const days = Math.max(
        1,
        Math.round((new Date(date).getTime() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24))
      );
      if (days > 0 && last.date !== date) {
        computedGmd = Math.round(((weight - last.weight) / days) * 100) / 100;
      }
    }

    const newRec: WeightRecord = {
      id: `w-${Date.now()}`,
      date,
      weight: Number(weight),
      gmd: computedGmd,
      bodyConditionScore: Number(bcs),
    };

    const updated: Animal = {
      ...target,
      currentWeight: Number(weight),
      weightHistory: [...(target.weightHistory || []), newRec],
    };
    await onUpdateAnimal(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Peso Médio do Rebanho</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {stats.avgWeight.toFixed(1)} kg
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">GMD Médio Calculado</span>
          <strong className="text-xl font-bold text-emerald-700 dark:text-emerald-400 block mt-1 tabular-nums">
            {stats.avgGmd !== null ? `${stats.avgGmd.toFixed(2)} kg/d` : '—'}
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Estoque em Arrobas (50% RC)</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {stats.totalArrobas.toFixed(1)} @
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Pesagens Registradas</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {allWeights.length}
          </strong>
        </div>
      </div>

      {/* Quick Log Weighing Form */}
      <form
        onSubmit={handleAddWeight}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3"
      >
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Lançar Nova Pesagem</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end text-xs">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Animal</label>
            <select value={selectedId} onChange={(e) => setAnimalId(e.target.value)} className={inputCls}>
              {animals.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.number} · {a.name} ({a.currentWeight} kg)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Peso (kg) / ECC</label>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="number"
                step="0.5"
                min="1"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className={`${inputCls} tabular-nums`}
              />
              <input
                type="number"
                step="0.25"
                min="1"
                max="5"
                value={bcs}
                onChange={(e) => setBcs(Number(e.target.value))}
                className={`${inputCls} tabular-nums`}
                title="Escore Corporal (1 a 5)"
              />
            </div>
          </div>
          <button
            type="submit"
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Registrar Peso
          </button>
        </div>
      </form>

      {/* Weighing History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Histórico de Pesagens & GMD</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-2 px-4 font-medium">Data</th>
                <th className="py-2 px-3 font-medium">Animal</th>
                <th className="py-2 px-3 font-medium">Categoria</th>
                <th className="py-2 px-3 font-medium text-right">Peso</th>
                <th className="py-2 px-3 font-medium text-right">GMD</th>
                <th className="py-2 px-4 font-medium text-right">ECC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 tabular-nums">
              {allWeights.map(({ animal, record }) => (
                <tr key={record.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">{record.date}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                    #{animal.number} · {animal.name}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{animal.category}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-900 dark:text-white">
                    {record.weight} kg
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-emerald-700 dark:text-emerald-400">
                    {record.gmd !== undefined ? `${record.gmd >= 0 ? '+' : ''}${record.gmd.toFixed(2)} kg/d` : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right text-slate-700 dark:text-slate-300">
                    {record.bodyConditionScore.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ========================================================= */
/* 2. LEITE & CONTROLE LEITEIRO                              */
/* ========================================================= */
export const DairyMilkView: React.FC<CommonViewProps> = ({
  animals,
  onUpdateAnimal,
  onOpenAddAnimal,
}) => {
  const dairyCandidates = useMemo(() => {
    const females = animals.filter((a) => a.sex === 'F');
    return females.length > 0 ? females : animals;
  }, [animals]);

  const [animalId, setAnimalId] = useState(dairyCandidates[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [volume, setVolume] = useState<number>(24.5);
  const [fatPct, setFatPct] = useState<number>(3.8);
  const [proteinPct, setProteinPct] = useState<number>(3.3);
  const [ccs, setCcs] = useState<number>(180);

  const selectedId = dairyCandidates.some((a) => a.id === animalId)
    ? animalId
    : dairyCandidates[0]?.id || '';

  const allMilk = useMemo(() => {
    const rows: Array<{ animal: Animal; record: MilkRecord }> = [];
    animals.forEach((a) => {
      (a.milkHistory || []).forEach((rec) => rows.push({ animal: a, record: rec }));
    });
    return rows.sort((a, b) => b.record.date.localeCompare(a.record.date));
  }, [animals]);

  if (animals.length === 0) {
    return <EmptyHerdNotice label="controle leiteiro e tanque" onOpenAddAnimal={onOpenAddAnimal} />;
  }

  const totalLiters = allMilk.reduce((s, r) => s + r.record.volume, 0);
  const avgLiters = allMilk.length > 0 ? totalLiters / allMilk.length : null;
  const ccsVals = allMilk.map((r) => r.record.ccs).filter((v): v is number => typeof v === 'number');
  const avgCcs = ccsVals.length > 0 ? Math.round(ccsVals.reduce((s, v) => s + v, 0) / ccsVals.length) : null;

  const handleAddMilk = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = animals.find((a) => a.id === selectedId);
    if (!target || volume <= 0) return;

    const newRec: MilkRecord = {
      id: `m-${Date.now()}`,
      date,
      volume: Number(volume),
      fatPercentage: Number(fatPct),
      proteinPercentage: Number(proteinPct),
      ccs: Number(ccs),
    };

    await onUpdateAnimal({
      ...target,
      milkHistory: [newRec, ...(target.milkHistory || [])],
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Volume Acumulado</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {totalLiters.toFixed(1)} L
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Média por Ordenha/Dia</span>
          <strong className="text-xl font-bold text-emerald-700 dark:text-emerald-400 block mt-1 tabular-nums">
            {avgLiters !== null ? `${avgLiters.toFixed(1)} L` : '—'}
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">CCS Média (mil/mL)</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {avgCcs !== null ? avgCcs : '—'}
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Controles Lançados</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {allMilk.length}
          </strong>
        </div>
      </div>

      <form
        onSubmit={handleAddMilk}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3"
      >
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Registrar Controle Leiteiro</h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 items-end text-xs">
          <div className="col-span-2">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Matriz / Vaca</label>
            <select value={selectedId} onChange={(e) => setAnimalId(e.target.value)} className={inputCls}>
              {dairyCandidates.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.number} · {a.name} ({a.breed})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Volume (L)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className={`${inputCls} tabular-nums`}
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Gord % / CCS</label>
            <div className="grid grid-cols-2 gap-1.5">
              <input
                type="number"
                step="0.1"
                value={fatPct}
                onChange={(e) => setFatPct(Number(e.target.value))}
                className={`${inputCls} tabular-nums`}
                title="% Gordura"
              />
              <input
                type="number"
                step="10"
                value={ccs}
                onChange={(e) => setCcs(Number(e.target.value))}
                className={`${inputCls} tabular-nums`}
                title="CCS (mil células/mL)"
              />
            </div>
          </div>
          <button
            type="submit"
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Lançar Ordenha
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-xs">
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Proteína (%)</label>
            <input
              type="number"
              step="0.1"
              value={proteinPct}
              onChange={(e) => setProteinPct(Number(e.target.value))}
              className={`${inputCls} tabular-nums`}
            />
          </div>
        </div>
      </form>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Histórico de Produção Leiteira</h4>
        </div>
        {allMilk.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Nenhum controle leiteiro registrado até o momento.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2 px-4 font-medium">Data</th>
                  <th className="py-2 px-3 font-medium">Vaca</th>
                  <th className="py-2 px-3 font-medium text-right">Volume</th>
                  <th className="py-2 px-3 font-medium text-right">Gordura</th>
                  <th className="py-2 px-3 font-medium text-right">Proteína</th>
                  <th className="py-2 px-4 font-medium text-right">CCS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 tabular-nums">
                {allMilk.map(({ animal, record }) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">{record.date}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                      #{animal.number} · {animal.name}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                      {record.volume.toFixed(1)} L
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      {record.fatPercentage !== undefined ? `${record.fatPercentage.toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      {record.proteinPercentage !== undefined ? `${record.proteinPercentage.toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-700 dark:text-slate-300">
                      {record.ccs !== undefined ? `${record.ccs} mil` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================================= */
/* 3. REPRODUÇÃO & IATF                                      */
/* ========================================================= */
export const ReproductionView: React.FC<CommonViewProps> = ({
  animals,
  onUpdateAnimal,
  onOpenAddAnimal,
}) => {
  const [animalId, setAnimalId] = useState(animals[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<ReproductionRecord['type']>('IATF');
  const [bullId, setBullId] = useState('');
  const [result, setResult] = useState('Em andamento');
  const [notes, setNotes] = useState('');

  const selectedId = animals.some((a) => a.id === animalId) ? animalId : animals[0]?.id || '';

  const allRepro = useMemo(() => {
    const rows: Array<{ animal: Animal; record: ReproductionRecord }> = [];
    animals.forEach((a) => {
      (a.reproHistory || []).forEach((rec) => rows.push({ animal: a, record: rec }));
    });
    return rows.sort((a, b) => b.record.date.localeCompare(a.record.date));
  }, [animals]);

  if (animals.length === 0) {
    return <EmptyHerdNotice label="gestão reprodutiva e IATF" onOpenAddAnimal={onOpenAddAnimal} />;
  }

  const totalIA = allRepro.filter((r) => r.record.type === 'IA' || r.record.type === 'IATF').length;
  const diagTotal = allRepro.filter((r) => r.record.type === 'Diagnóstico Gestação');
  const diagPos = diagTotal.filter((r) => (r.record.result || '').toLowerCase().includes('prenh')).length;
  const pregnancyRate = diagTotal.length > 0 ? Math.round((diagPos / diagTotal.length) * 100) : null;
  const births = allRepro.filter((r) => r.record.type === 'Parto').length;

  const handleAddRepro = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = animals.find((a) => a.id === selectedId);
    if (!target) return;

    const newRec: ReproductionRecord = {
      id: `rep-${Date.now()}`,
      date,
      type,
      bullId: bullId.trim() || undefined,
      result: result.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    await onUpdateAnimal({
      ...target,
      reproHistory: [newRec, ...(target.reproHistory || [])],
    });
    setBullId('');
    setNotes('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Eventos Reprodutivos</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {allRepro.length}
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Inseminações (IA / IATF)</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {totalIA}
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Taxa de Prenhez (DG)</span>
          <strong className="text-xl font-bold text-emerald-700 dark:text-emerald-400 block mt-1 tabular-nums">
            {pregnancyRate !== null ? `${pregnancyRate}%` : '—'}
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Partos Registrados</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {births}
          </strong>
        </div>
      </div>

      <form
        onSubmit={handleAddRepro}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3"
      >
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Lançar Evento Reprodutivo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 items-end text-xs">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Matriz</label>
            <select value={selectedId} onChange={(e) => setAnimalId(e.target.value)} className={inputCls}>
              {animals.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.number} · {a.name} ({a.category})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ReproductionRecord['type'])}
              className={inputCls}
            >
              <option value="IATF">IATF</option>
              <option value="IA">Inseminação (IA)</option>
              <option value="Monta Natural">Monta Natural</option>
              <option value="Cio">Detecção de Cio</option>
              <option value="Diagnóstico Gestação">Diagnóstico Gestação</option>
              <option value="Parto">Parto</option>
              <option value="Aborto">Aborto</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Touro / Sêmen</label>
            <input
              type="text"
              value={bullId}
              onChange={(e) => setBullId(e.target.value)}
              placeholder="Ex: REM Dheef"
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Registrar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Resultado</label>
            <select value={result} onChange={(e) => setResult(e.target.value)} className={inputCls}>
              <option value="Em andamento">Em andamento</option>
              <option value="Prenhe (Positivo)">Prenhe (Positivo)</option>
              <option value="Vazia (Negativo)">Vazia (Negativo)</option>
              <option value="Nascido Vivo">Nascido Vivo</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Observações</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Protocolo hormonal, escore uterino, facilidade de parto..."
              className={inputCls}
            />
          </div>
        </div>
      </form>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Histórico Reprodutivo</h4>
        </div>
        {allRepro.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Nenhum evento reprodutivo registrado até o momento.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2 px-4 font-medium">Data</th>
                  <th className="py-2 px-3 font-medium">Animal</th>
                  <th className="py-2 px-3 font-medium">Evento</th>
                  <th className="py-2 px-3 font-medium">Touro / Sêmen</th>
                  <th className="py-2 px-3 font-medium">Resultado</th>
                  <th className="py-2 px-4 font-medium">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allRepro.map(({ animal, record }) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 tabular-nums">{record.date}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                      #{animal.number} · {animal.name}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{record.type}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{record.bullId || '—'}</td>
                    <td className="py-2.5 px-3 font-medium text-emerald-700 dark:text-emerald-400">
                      {record.result || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{record.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================================= */
/* 4. SANIDADE, VACINAS & CARÊNCIAS                          */
/* ========================================================= */
export const HealthSanitationView: React.FC<CommonViewProps> = ({
  animals,
  onUpdateAnimal,
  onOpenAddAnimal,
}) => {
  const [animalId, setAnimalId] = useState(animals[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<HealthRecord['type']>('Vacina');
  const [product, setProduct] = useState('');
  const [description, setDescription] = useState('');
  const [gracePeriodDays, setGracePeriodDays] = useState<number>(0);

  const selectedId = animals.some((a) => a.id === animalId) ? animalId : animals[0]?.id || '';

  const allHealth = useMemo(() => {
    const rows: Array<{ animal: Animal; record: HealthRecord }> = [];
    animals.forEach((a) => {
      (a.healthHistory || []).forEach((rec) => rows.push({ animal: a, record: rec }));
    });
    return rows.sort((a, b) => b.record.date.localeCompare(a.record.date));
  }, [animals]);

  if (animals.length === 0) {
    return <EmptyHerdNotice label="controle sanitário e vacinações" onOpenAddAnimal={onOpenAddAnimal} />;
  }

  const now = Date.now();
  const activeGraceCount = allHealth.filter(({ record }) => {
    if (!record.gracePeriodDays || record.gracePeriodDays <= 0) return false;
    const end = new Date(record.date).getTime() + record.gracePeriodDays * 86400000;
    return end > now;
  }).length;

  const handleAddHealth = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = animals.find((a) => a.id === selectedId);
    if (!target || !description.trim()) return;

    const newRec: HealthRecord = {
      id: `hlt-${Date.now()}`,
      date,
      type,
      description: description.trim(),
      product: product.trim() || undefined,
      gracePeriodDays: Number(gracePeriodDays) || 0,
    };

    await onUpdateAnimal({
      ...target,
      healthHistory: [newRec, ...(target.healthHistory || [])],
    });
    setProduct('');
    setDescription('');
    setGracePeriodDays(0);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Ocorrências Registradas</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {allHealth.length}
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Vacinações</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {allHealth.filter((r) => r.record.type === 'Vacina').length}
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Vermífugos & Tratamentos</span>
          <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {allHealth.filter((r) => r.record.type === 'Vermífugo' || r.record.type === 'Tratamento').length}
          </strong>
        </div>
        <div className="p-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">Em Período de Carência</span>
          <strong
            className={`text-xl font-bold block mt-1 tabular-nums ${
              activeGraceCount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
            }`}
          >
            {activeGraceCount}
          </strong>
        </div>
      </div>

      <form
        onSubmit={handleAddHealth}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3"
      >
        <h3 className="text-xs font-semibold text-slate-900 dark:text-white">Registrar Manejo Sanitário</h3>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-2.5 items-end text-xs">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Animal</label>
            <select value={selectedId} onChange={(e) => setAnimalId(e.target.value)} className={inputCls}>
              {animals.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.number} · {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as HealthRecord['type'])}
              className={inputCls}
            >
              <option value="Vacina">Vacina</option>
              <option value="Vermífugo">Vermífugo</option>
              <option value="Tratamento">Tratamento</option>
              <option value="Exame">Exame</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Carência (dias)</label>
            <input
              type="number"
              min="0"
              value={gracePeriodDays}
              onChange={(e) => setGracePeriodDays(Number(e.target.value))}
              className={`${inputCls} tabular-nums`}
            />
          </div>
          <button
            type="submit"
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-md inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Lançar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">Produto / Princípio Ativo</label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="Ex: Ivermectina 3,15%, Vacina Clostridiose"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Descrição / Protocolo *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Reforço anual, controle endoparasitas..."
              className={inputCls}
            />
          </div>
        </div>
      </form>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Histórico Sanitário & Carências</h4>
        </div>
        {allHealth.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Nenhum manejo sanitário registrado até o momento.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2 px-4 font-medium">Data</th>
                  <th className="py-2 px-3 font-medium">Animal</th>
                  <th className="py-2 px-3 font-medium">Tipo</th>
                  <th className="py-2 px-3 font-medium">Produto & Protocolo</th>
                  <th className="py-2 px-4 font-medium text-right">Carência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {allHealth.map(({ animal, record }) => {
                  const graceEnd = record.gracePeriodDays
                    ? new Date(new Date(record.date).getTime() + record.gracePeriodDays * 86400000)
                    : null;
                  const isActiveGrace = graceEnd ? graceEnd.getTime() > now : false;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 tabular-nums">{record.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                        #{animal.number} · {animal.name}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{record.type}</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {record.product ? <strong>{record.product}</strong> : null}
                        {record.product ? ' — ' : ''}
                        {record.description}
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums">
                        {!record.gracePeriodDays ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium">Zero</span>
                        ) : isActiveGrace && graceEnd ? (
                          <span className="text-amber-700 dark:text-amber-400 font-semibold">
                            Até {graceEnd.toLocaleDateString('pt-BR')}
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">Cumprida ({record.gracePeriodDays}d)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
