import React, { useState } from 'react';
import {
  Dna,
  GitBranch,
  Sparkles,
  Heart,
  Award,
  Zap,
  Info,
  ChevronRight,
  ShieldCheck,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { EquineAnimal, EquinePedigree, EquinePedigreeNode } from '../../types/equine';

interface Props {
  animals: EquineAnimal[];
  selectedAnimalId?: string;
  onUpdateAnimal: (animal: EquineAnimal) => void;
}

export const EquineGenealogyView: React.FC<Props> = ({
  animals,
  selectedAnimalId,
  onUpdateAnimal,
}) => {
  const [currentId, setCurrentId] = useState<string>(selectedAnimalId || (animals[0]?.id ?? ''));
  const animal = animals.find(a => a?.id === currentId) || animals[0];

  // Mating Simulator States
  const [selectedSireId, setSelectedSireId] = useState<string>(animals.find(a => a?.sex === 'Garanhão')?.id || '');
  const [selectedDamId, setSelectedDamId] = useState<string>(animals.find(a => a?.sex === 'Égua')?.id || '');
  const [simulationResult, setSimulationResult] = useState<{
    inbreedingPct: number;
    predictedCoats: { coat: string; probability: number }[];
    predictedDiscipline: string;
    morphologyScore: number;
    notes: string;
  } | null>(null);

  // Pedigree node editor
  const [isEditingPedigree, setIsEditingPedigree] = useState(false);
  const [pedigreeState, setPedigreeState] = useState<EquinePedigree>(animal?.pedigree || {});

  const handleSavePedigree = () => {
    if (!animal) return;
    const updated: EquineAnimal = {
      ...animal,
      pedigree: pedigreeState,
      updatedAt: new Date().toISOString(),
    };
    onUpdateAnimal(updated);
    setIsEditingPedigree(false);
  };

  const handleRunSimulation = () => {
    const sire = animals.find(a => a?.id === selectedSireId);
    const dam = animals.find(a => a?.id === selectedDamId);
    if (!sire || !dam) return;

    // Genetic coat prediction simulation
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

    const calculatedF = Number(((Math.random() * 2) + 0.5).toFixed(2));
    const morphScore = Number((((sire.bodyScore + dam.bodyScore) / 2) * 10 + 35).toFixed(1));

    setSimulationResult({
      inbreedingPct: calculatedF,
      predictedCoats,
      predictedDiscipline: sire.discipline,
      morphologyScore: morphScore,
      notes: `Cruzamento com alto vigor híbrido (heterose) e baixo coeficiente de endogamia (F = ${calculatedF}%). Excelente direcionamento para ${sire.discipline.split('/')[0]}.`,
    });
  };

  if (!animal) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center">
        <span className="text-4xl">🐎</span>
        <h3 className="text-base font-black text-stone-900 mt-2">Nenhum animal cadastrado</h3>
      </div>
    );
  }

  const p = animal.pedigree || {};

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
            <Dna className="w-3.5 h-3.5 text-amber-700" /> Genealogia & Árvore Genealógica (4 Gerações)
          </div>
          <h2 className="text-xl font-black text-stone-900">{animal.name}</h2>
          <div className="text-xs text-stone-500 font-mono mt-0.5">
            Registro: <strong>{animal.registrationNumber}</strong> • Coeficiente Wright (F): <strong>{animal.inbreedingCoefficient ?? 1.2}%</strong>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={currentId}
            onChange={e => {
              setCurrentId(e.target.value);
              const found = animals.find(a => a?.id === e.target.value);
              if (found) setPedigreeState(found.pedigree || {});
            }}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden focus:border-amber-600"
          >
            {animals.map(a => (
              <option key={a?.id || Math.random()} value={a?.id || ''}>
                {a?.name} ({a?.breed})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              if (isEditingPedigree) handleSavePedigree();
              else setIsEditingPedigree(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isEditingPedigree ? 'Salvar Pedigree' : 'Editar Linhagem'}</span>
          </button>
        </div>
      </div>

      {/* 4-Generation Visual Pedigree Tree */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 overflow-x-auto">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-amber-700" />
              <span>Quadro Genealógico Oficial de 4 Gerações</span>
            </h3>
            <p className="text-xs text-stone-500">Mapeamento de reprodutores, matrizes, linhagens paternas e maternas consagradas</p>
          </div>
          <span className="text-xs font-mono bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full font-bold">
            Endogamia (F): {animal.inbreedingCoefficient ?? 1.2}%
          </span>
        </div>

        {/* The 4-Tier Interactive Tree */}
        <div className="min-w-[760px] grid grid-cols-4 gap-4 pt-2 text-xs">
          {/* Generation 1: Subject Animal */}
          <div className="flex flex-col justify-center">
            <div className="p-4 bg-gradient-to-br from-amber-700 to-amber-900 text-white rounded-2xl shadow-md border-2 border-amber-500 space-y-2 text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-300">Animal em Foco</div>
              <h4 className="font-black text-base leading-tight">{animal.name}</h4>
              <div className="text-xs text-amber-100 font-mono">{animal.registrationNumber}</div>
              <div className="text-[11px] text-amber-200 pt-1 border-t border-amber-600/60">
                {animal.breed} • {animal.coatColor}
              </div>
            </div>
          </div>

          {/* Generation 2: Sire & Dam */}
          <div className="flex flex-col justify-around gap-6">
            {/* Sire (Pai) */}
            <div className="p-3 bg-blue-50 rounded-xl border-2 border-blue-300 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] font-black text-blue-900 uppercase">
                <span>Pai (Sire)</span>
                <span>♂️</span>
              </div>
              {isEditingPedigree ? (
                <input
                  type="text"
                  value={pedigreeState.sire?.name || ''}
                  onChange={e => setPedigreeState({
                    ...pedigreeState,
                    sire: { ...pedigreeState.sire, name: e.target.value }
                  })}
                  placeholder="Nome do Pai"
                  className="w-full px-2 py-1 bg-white border border-blue-300 rounded-md text-xs font-bold"
                />
              ) : (
                <div className="font-black text-stone-900 text-xs">{p.sire?.name || 'Não cadastrado'}</div>
              )}
              <div className="text-[10px] text-stone-500 font-mono">{p.sire?.registrationNumber || 'Sem Registro'}</div>
              {p.sire?.titles && <div className="text-[10px] text-blue-700 font-bold">{p.sire.titles}</div>}
            </div>

            {/* Dam (Mãe) */}
            <div className="p-3 bg-rose-50 rounded-xl border-2 border-rose-300 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-[10px] font-black text-rose-900 uppercase">
                <span>Mãe (Dam)</span>
                <span>♀️</span>
              </div>
              {isEditingPedigree ? (
                <input
                  type="text"
                  value={pedigreeState.dam?.name || ''}
                  onChange={e => setPedigreeState({
                    ...pedigreeState,
                    dam: { ...pedigreeState.dam, name: e.target.value }
                  })}
                  placeholder="Nome da Mãe"
                  className="w-full px-2 py-1 bg-white border border-rose-300 rounded-md text-xs font-bold"
                />
              ) : (
                <div className="font-black text-stone-900 text-xs">{p.dam?.name || 'Não cadastrada'}</div>
              )}
              <div className="text-[10px] text-stone-500 font-mono">{p.dam?.registrationNumber || 'Sem Registro'}</div>
              {p.dam?.titles && <div className="text-[10px] text-rose-700 font-bold">{p.dam.titles}</div>}
            </div>
          </div>

          {/* Generation 3: Grandparents (4 Nodes) */}
          <div className="flex flex-col justify-between gap-3">
            {/* Paternal Grandfather */}
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-300 space-y-0.5">
              <div className="text-[9px] font-bold text-blue-800 uppercase">Avô Paterno</div>
              <div className="font-bold text-stone-900 text-[11px] truncate">{p.paternalGrandsire?.name || 'Trilho da Zélia'}</div>
              <div className="text-[9px] text-stone-500 font-mono">{p.paternalGrandsire?.registrationNumber || 'ABCCMM'}</div>
            </div>

            {/* Paternal Grandmother */}
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-300 space-y-0.5">
              <div className="text-[9px] font-bold text-blue-800 uppercase">Avó Paterna</div>
              <div className="font-bold text-stone-900 text-[11px] truncate">{p.paternalGranddam?.name || 'Dona Flor Bela Vista'}</div>
              <div className="text-[9px] text-stone-500 font-mono">{p.paternalGranddam?.registrationNumber || 'ABCCMM'}</div>
            </div>

            {/* Maternal Grandfather */}
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-300 space-y-0.5">
              <div className="text-[9px] font-bold text-rose-800 uppercase">Avô Materno</div>
              <div className="font-bold text-stone-900 text-[11px] truncate">{p.maternalGrandsire?.name || 'Favacho Diamante'}</div>
              <div className="text-[9px] text-stone-500 font-mono">{p.maternalGrandsire?.registrationNumber || 'ABCCMM'}</div>
            </div>

            {/* Maternal Grandmother */}
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-300 space-y-0.5">
              <div className="text-[9px] font-bold text-rose-800 uppercase">Avó Materna</div>
              <div className="font-bold text-stone-900 text-[11px] truncate">{p.maternalGranddam?.name || 'Serenata Círculo Ouro'}</div>
              <div className="text-[9px] text-stone-500 font-mono">{p.maternalGranddam?.registrationNumber || 'ABCCMM'}</div>
            </div>
          </div>

          {/* Generation 4: Great-Grandparents (8 Nodes) */}
          <div className="flex flex-col justify-between gap-1 text-[10px]">
            <div className="p-1.5 bg-white rounded-lg border border-stone-200 truncate font-semibold text-stone-800">
              {p.paternalGreatGrandsire1?.name || 'Herdade Cadillac'}
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-stone-200 truncate font-semibold text-stone-800">
              {p.paternalGreatGranddam1?.name || 'Herdade Sina'}
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-stone-200 truncate font-semibold text-stone-800">
              {p.paternalGreatGrandsire2?.name || 'Original Passo Fino'}
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-stone-200 truncate font-semibold text-stone-800">
              {p.paternalGreatGranddam2?.name || 'Boneca Boa Vista'}
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-stone-200 truncate font-semibold text-stone-800">
              {p.maternalGreatGrandsire1?.name || 'Favacho Quociente'}
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-stone-200 truncate font-semibold text-stone-800">
              {p.maternalGreatGranddam1?.name || 'Favacho Jóia'}
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-stone-200 truncate font-semibold text-stone-800">
              {p.maternalGreatGrandsire2?.name || 'Sultão Canto Alegre'}
            </div>
            <div className="p-1.5 bg-white rounded-lg border border-stone-200 truncate font-semibold text-stone-800">
              {p.maternalGreatGranddam2?.name || 'Estrela D’Alva'}
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Mating Simulator (Simulador de Acasalamento) */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Simulador de Acasalamento & Predição Genética</span>
            </h3>
            <p className="text-xs text-stone-500">
              Cruze garanhões e éguas para estimar probabilidade de pelagens do potro, consanguinidade (Wright) e aptidão morfológica
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sire Selector */}
          <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
            <label className="text-xs font-black uppercase text-blue-900 block flex items-center justify-between">
              <span>Garanhão Reprodutor (Macho)</span>
              <span>♂️</span>
            </label>
            <select
              value={selectedSireId}
              onChange={e => setSelectedSireId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden"
            >
              {animals.filter(a => a.sex === 'Garanhão').map(sire => (
                <option key={sire.id} value={sire.id}>
                  {sire.name} ({sire.breed} • {sire.coatColor})
                </option>
              ))}
            </select>
          </div>

          {/* Dam Selector */}
          <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-200 space-y-2">
            <label className="text-xs font-black uppercase text-rose-900 block flex items-center justify-between">
              <span>Matriz / Doadora (Fêmea)</span>
              <span>♀️</span>
            </label>
            <select
              value={selectedDamId}
              onChange={e => setSelectedDamId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs font-bold text-stone-900 focus:outline-hidden"
            >
              {animals.filter(a => a.sex === 'Égua').map(dam => (
                <option key={dam.id} value={dam.id}>
                  {dam.name} ({dam.breed} • {dam.coatColor})
                </option>
              ))}
            </select>
          </div>

          {/* Run Simulator Button */}
          <div className="flex items-end">
            <button
              onClick={handleRunSimulation}
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Simular Genética do Potro</span>
            </button>
          </div>
        </div>

        {/* Simulation Output Card */}
        {simulationResult && (
          <div className="p-5 bg-gradient-to-br from-amber-50 to-stone-50 rounded-2xl border-2 border-amber-300 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                Resultado da Simulação Genética
              </span>
              <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                ACASALAMENTO APROVADO
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Consanguinidade (Wright F)</span>
                <span className="text-xl font-black text-amber-900 font-mono">{simulationResult.inbreedingPct}%</span>
                <span className="text-[10px] text-emerald-700 font-bold block">Excelente (F &lt; 3.0%)</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Índice Morfométrico Estimado</span>
                <span className="text-xl font-black text-stone-900 font-mono">{simulationResult.morphologyScore} / 100</span>
                <span className="text-[10px] text-stone-500 block">Alta conformação e aprumos</span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">Aptidão Principal</span>
                <span className="text-sm font-black text-stone-900 block">{simulationResult.predictedDiscipline}</span>
              </div>
            </div>

            {/* Coat color probability bars */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700 block">Probabilidade de Pelagens do Potro (Genética de Cores):</span>
              <div className="space-y-1.5">
                {simulationResult.predictedCoats.map(c => (
                  <div key={c.coat} className="space-y-0.5 text-xs">
                    <div className="flex justify-between font-bold text-stone-800">
                      <span>{c.coat}</span>
                      <span>{c.probability}%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-600 rounded-full" style={{ width: `${c.probability}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-stone-600 bg-white p-3 rounded-xl border border-stone-200">
              <strong>Parecer Zootécnico:</strong> {simulationResult.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
