import React, { useState, useEffect, useMemo } from 'react';
import { Dna, GitBranch, Sparkles, Save, Zap, X } from 'lucide-react';
import { EquineAnimal, EquinePedigree } from '../../types/equine';
import { EquinoIcon } from '../icons/EquinoIcon';

interface Props {
  animals: EquineAnimal[];
  selectedAnimalId?: string;
  onUpdateAnimal: (animal: EquineAnimal) => void;
}

const inputCls =
  'w-full h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500';

export const EquineGenealogyView: React.FC<Props> = ({
  animals,
  selectedAnimalId,
  onUpdateAnimal,
}) => {
  const safeAnimals = useMemo(() => (animals || []).filter(a => a && a.id), [animals]);
  const [currentId, setCurrentId] = useState<string>(selectedAnimalId || safeAnimals[0]?.id || '');

  useEffect(() => {
    if (selectedAnimalId && safeAnimals.some(a => a.id === selectedAnimalId)) {
      setCurrentId(selectedAnimalId);
    } else if (!safeAnimals.some(a => a.id === currentId)) {
      setCurrentId(safeAnimals[0]?.id || '');
    }
  }, [selectedAnimalId, safeAnimals, currentId]);

  const animal = safeAnimals.find(a => a.id === currentId) || safeAnimals[0];

  const stallions = useMemo(() => safeAnimals.filter(a => a.sex === 'Garanhão'), [safeAnimals]);
  const mares = useMemo(() => safeAnimals.filter(a => a.sex === 'Égua'), [safeAnimals]);

  const [selectedSireId, setSelectedSireId] = useState<string>(stallions[0]?.id || '');
  const [selectedDamId, setSelectedDamId] = useState<string>(mares[0]?.id || '');
  const [simulationResult, setSimulationResult] = useState<{
    inbreedingPct: number;
    predictedCoats: { coat: string; probability: number }[];
    predictedDiscipline: string;
    morphologyScore: number;
    notes: string;
  } | null>(null);

  const [isEditingPedigree, setIsEditingPedigree] = useState(false);
  const [pedigreeState, setPedigreeState] = useState<EquinePedigree>(animal?.pedigree || {});

  useEffect(() => {
    setPedigreeState(animal?.pedigree || {});
    setIsEditingPedigree(false);
  }, [animal?.id]);

  useEffect(() => {
    if (!stallions.some(s => s.id === selectedSireId)) {
      setSelectedSireId(stallions[0]?.id || '');
    }
    if (!mares.some(m => m.id === selectedDamId)) {
      setSelectedDamId(mares[0]?.id || '');
    }
  }, [stallions, mares, selectedSireId, selectedDamId]);

  const handleSavePedigree = () => {
    if (!animal) return;
    onUpdateAnimal({
      ...animal,
      pedigree: pedigreeState,
      updatedAt: new Date().toISOString(),
    });
    setIsEditingPedigree(false);
  };

  const handleRunSimulation = () => {
    const sire = safeAnimals.find(a => a.id === selectedSireId);
    const dam = safeAnimals.find(a => a.id === selectedDamId);
    if (!sire || !dam) return;

    let predictedCoats = [
      { coat: 'Castanha', probability: 45 },
      { coat: 'Alazã', probability: 30 },
      { coat: 'Preta', probability: 15 },
      { coat: 'Tordilha', probability: 10 },
    ];

    if (sire.coatColor === 'Pampa' || dam.coatColor === 'Pampa') {
      predictedCoats = [
        { coat: 'Pampa de Preto / Castanho', probability: 50 },
        { coat: 'Castanha', probability: 30 },
        { coat: 'Alazã', probability: 20 },
      ];
    } else if (sire.coatColor === 'Tordilha' || dam.coatColor === 'Tordilha') {
      predictedCoats = [
        { coat: 'Tordilha (Gene Dominante G)', probability: 50 },
        { coat: 'Castanha', probability: 25 },
        { coat: 'Alazã', probability: 25 },
      ];
    }

    const sameBreedBonus = sire.breed === dam.breed ? 1.15 : 0.65;
    const sharedSire =
      sire.pedigree?.sire?.name &&
      dam.pedigree?.sire?.name &&
      sire.pedigree.sire.name.toLowerCase() === dam.pedigree.sire.name.toLowerCase();
    const calculatedF = sharedSire ? 12.5 : Number(sameBreedBonus.toFixed(2));
    const morphScore = Number(
      Math.min(99, ((sire.bodyScore + dam.bodyScore) / 2) * 10 + 35).toFixed(1)
    );

    setSimulationResult({
      inbreedingPct: calculatedF,
      predictedCoats,
      predictedDiscipline: sire.discipline,
      morphologyScore: morphScore,
      notes: sharedSire
        ? `Atenção: ambos compartilham o mesmo pai (${sire.pedigree?.sire?.name}), elevando a consanguinidade estimada (F = ${calculatedF}%).`
        : `Cruzamento com baixo coeficiente de endogamia estimado (F = ${calculatedF}%) e boa complementação para ${sire.discipline.split('/')[0].trim()}.`,
    });
  };

  if (!animal) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-2">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 mx-auto flex items-center justify-center">
          <EquinoIcon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nenhum equino cadastrado
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          Cadastre animais no Plantel para mapear árvores genealógicas e simular acasalamentos.
        </p>
      </div>
    );
  }

  const p = animal.pedigree || {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Dna className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Genealogia & Simulador de Acasalamento</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
            {animal.name} · Registro {animal.registrationNumber} · Endogamia (F):{' '}
            {animal.inbreedingCoefficient !== undefined ? `${animal.inbreedingCoefficient}%` : 'Não informada'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={animal.id}
            onChange={e => setCurrentId(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            {safeAnimals.map((a, idx) => (
              <option key={a.id || idx} value={a.id}>
                {a.name} ({a.breed})
              </option>
            ))}
          </select>

          {isEditingPedigree ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setPedigreeState(animal.pedigree || {});
                  setIsEditingPedigree(false);
                }}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancelar</span>
              </button>
              <button
                type="button"
                onClick={handleSavePedigree}
                className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Pedigree</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingPedigree(true)}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <GitBranch className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Editar Linhagem</span>
            </button>
          )}
        </div>
      </div>

      {/* 4-Generation Pedigree Tree */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 overflow-x-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <GitBranch className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Quadro Genealógico (4 Gerações)</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Linhagens paterna e materna registradas
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-zinc-300 tabular-nums">
            Wright (F): {animal.inbreedingCoefficient !== undefined ? `${animal.inbreedingCoefficient}%` : '—'}
          </span>
        </div>

        <div className="min-w-[760px] grid grid-cols-4 gap-3 text-xs">
          {/* Gen 1: Subject */}
          <div className="flex flex-col justify-center">
            <div className="p-3.5 rounded-xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 space-y-1">
              <div className="text-[10px] uppercase tracking-wider opacity-70">Animal em Foco</div>
              <div className="font-semibold text-sm leading-tight">{animal.name}</div>
              <div className="text-[11px] font-mono opacity-80">{animal.registrationNumber}</div>
              <div className="text-[11px] opacity-75 pt-1 border-t border-white/15 dark:border-zinc-300">
                {animal.breed} · {animal.coatColor}
              </div>
            </div>
          </div>

          {/* Gen 2: Parents */}
          <div className="flex flex-col justify-around gap-4">
            {/* Sire */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 border-l-2 border-l-sky-500 bg-slate-50/50 dark:bg-zinc-950/50 space-y-1">
              <div className="text-[10px] font-semibold uppercase text-sky-700 dark:text-sky-400">
                Pai (Sire)
              </div>
              {isEditingPedigree ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={pedigreeState.sire?.name || ''}
                    onChange={e =>
                      setPedigreeState({
                        ...pedigreeState,
                        sire: { ...pedigreeState.sire, name: e.target.value },
                      })
                    }
                    placeholder="Nome do Pai"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={pedigreeState.sire?.registrationNumber || ''}
                    onChange={e =>
                      setPedigreeState({
                        ...pedigreeState,
                        sire: {
                          ...pedigreeState.sire,
                          name: pedigreeState.sire?.name || '',
                          registrationNumber: e.target.value,
                        },
                      })
                    }
                    placeholder="Registro"
                    className={inputCls}
                  />
                </div>
              ) : (
                <>
                  <div className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {p.sire?.name || 'Não informado'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                    {p.sire?.registrationNumber || 'Sem registro'}
                  </div>
                </>
              )}
            </div>

            {/* Dam */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 border-l-2 border-l-rose-500 bg-slate-50/50 dark:bg-zinc-950/50 space-y-1">
              <div className="text-[10px] font-semibold uppercase text-rose-700 dark:text-rose-400">
                Mãe (Dam)
              </div>
              {isEditingPedigree ? (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={pedigreeState.dam?.name || ''}
                    onChange={e =>
                      setPedigreeState({
                        ...pedigreeState,
                        dam: { ...pedigreeState.dam, name: e.target.value },
                      })
                    }
                    placeholder="Nome da Mãe"
                    className={inputCls}
                  />
                  <input
                    type="text"
                    value={pedigreeState.dam?.registrationNumber || ''}
                    onChange={e =>
                      setPedigreeState({
                        ...pedigreeState,
                        dam: {
                          ...pedigreeState.dam,
                          name: pedigreeState.dam?.name || '',
                          registrationNumber: e.target.value,
                        },
                      })
                    }
                    placeholder="Registro"
                    className={inputCls}
                  />
                </div>
              ) : (
                <>
                  <div className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {p.dam?.name || 'Não informada'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                    {p.dam?.registrationNumber || 'Sem registro'}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Gen 3: Grandparents */}
          <div className="flex flex-col justify-between gap-2.5">
            {(
              [
                { key: 'paternalGrandsire', label: 'Avô Paterno', tone: 'text-sky-700 dark:text-sky-400' },
                { key: 'paternalGranddam', label: 'Avó Paterna', tone: 'text-sky-700 dark:text-sky-400' },
                { key: 'maternalGrandsire', label: 'Avô Materno', tone: 'text-rose-700 dark:text-rose-400' },
                { key: 'maternalGranddam', label: 'Avó Materna', tone: 'text-rose-700 dark:text-rose-400' },
              ] as const
            ).map(gp => {
              const node = p[gp.key];
              const editNode = pedigreeState[gp.key];
              return (
                <div
                  key={gp.key}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 space-y-0.5"
                >
                  <div className={`text-[10px] font-medium ${gp.tone}`}>{gp.label}</div>
                  {isEditingPedigree ? (
                    <input
                      type="text"
                      value={editNode?.name || ''}
                      onChange={e =>
                        setPedigreeState({
                          ...pedigreeState,
                          [gp.key]: { ...editNode, name: e.target.value },
                        })
                      }
                      placeholder={gp.label}
                      className={inputCls}
                    />
                  ) : (
                    <div className="font-medium text-slate-900 dark:text-zinc-100 truncate">
                      {node?.name || 'Não informado'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Gen 4: Great-Grandparents */}
          <div className="flex flex-col justify-between gap-1 text-[11px]">
            {(
              [
                'paternalGreatGrandsire1',
                'paternalGreatGranddam1',
                'paternalGreatGrandsire2',
                'paternalGreatGranddam2',
                'maternalGreatGrandsire1',
                'maternalGreatGranddam1',
                'maternalGreatGrandsire2',
                'maternalGreatGranddam2',
              ] as const
            ).map((key, idx) => (
              <div
                key={key}
                className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 truncate"
              >
                {p[key]?.name || `Bisavô/Bisavó ${idx + 1} (—)`}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Virtual Mating Simulator */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Simulador de Acasalamento & Predição de Pelagem</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Selecione um garanhão e uma matriz do plantel para estimar consanguinidade, pelagens e aptidão
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Garanhão Reprodutor
            </label>
            <select
              value={selectedSireId}
              onChange={e => setSelectedSireId(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              {stallions.length === 0 ? (
                <option value="">Nenhum garanhão cadastrado</option>
              ) : (
                stallions.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.breed} · {s.coatColor})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Matriz / Doadora
            </label>
            <select
              value={selectedDamId}
              onChange={e => setSelectedDamId(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              {mares.length === 0 ? (
                <option value="">Nenhuma égua cadastrada</option>
              ) : (
                mares.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.breed} · {m.coatColor})
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={handleRunSimulation}
            disabled={!selectedSireId || !selectedDamId}
            className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simular Cruzamento</span>
          </button>
        </div>

        {simulationResult && (
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg bg-slate-50/50 dark:bg-zinc-950/50">
              <div className="p-3">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Consanguinidade (F)</span>
                <span className="text-base font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                  {simulationResult.inbreedingPct}%
                </span>
              </div>
              <div className="p-3">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Índice Morfométrico</span>
                <span className="text-base font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                  {simulationResult.morphologyScore} / 100
                </span>
              </div>
              <div className="p-3">
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Aptidão Prevista</span>
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block mt-0.5 truncate">
                  {simulationResult.predictedDiscipline}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Probabilidade de Pelagens do Potro
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {simulationResult.predictedCoats.map(c => (
                  <div key={c.coat} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-700 dark:text-zinc-300">{c.coat}</span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                        {c.probability}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-600 dark:bg-amber-500 rounded-full"
                        style={{ width: `${c.probability}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-300">
              <strong>Parecer Zootécnico:</strong> {simulationResult.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
