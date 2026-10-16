import React, { useState } from 'react';
import { CaprineAnimal } from '../../types/caprine';
import { Dna, GitBranch, Search, Award, AlertCircle, Sparkles, UserCheck } from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
}

export const CaprineGenealogyView: React.FC<Props> = ({ animals }) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(animals[0]?.id || '');
  const [sireSearch, setSireSearch] = useState('');
  const [damSearch, setDamSearch] = useState('');

  const selectedAnimal = animals.find(a => a?.id === selectedAnimalId) || animals[0];

  // Sire & Dam objects if in list
  const sireObj = animals.find(a => a?.id === selectedAnimal?.fatherId || (selectedAnimal?.fatherName && a?.name === selectedAnimal.fatherName));
  const damObj = animals.find(a => a?.id === selectedAnimal?.motherId || (selectedAnimal?.motherName && a?.name === selectedAnimal.motherName));

  // Simple inbreeding compatibility simulation
  const sireCandidate = animals.find(a => a?.id === sireSearch);
  const damCandidate = animals.find(a => a?.id === damSearch);

  let simulatedInbreeding = 0;
  if (sireCandidate && damCandidate) {
    if (sireCandidate.fatherId && sireCandidate.fatherId === damCandidate.fatherId) simulatedInbreeding += 12.5; // Meio-irmãos
    if (sireCandidate.motherId && sireCandidate.motherId === damCandidate.motherId) simulatedInbreeding += 12.5;
    if (sireCandidate.id === damCandidate.fatherId || damCandidate.id === sireCandidate.fatherId) simulatedInbreeding += 25.0; // Pai x Filha
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Dna className="w-6 h-6 text-purple-600" />
            Genealogia & Árvore Genealógica Caprina
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Controle de ascendants (Pais, Avós, Bisavós), grau de sangue (PO, PC, F1) e cálculo de consanguinidade (Inbreeding).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Selecionar Caprino:</label>
          <select
            value={selectedAnimal?.id || ''}
            onChange={e => setSelectedAnimalId(e.target.value)}
            className="p-2.5 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-white rounded-xl text-xs font-bold border border-stone-200 dark:border-zinc-700"
          >
            {animals.map(a => (
              <option key={a?.id || Math.random()} value={a?.id || ''}>
                {a?.earTag} - {a?.name} ({a?.bloodDegree})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Pedigree Interactive Tree */}
      {selectedAnimal && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-stone-100 dark:border-zinc-800 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-full">
                {selectedAnimal.earTag}
              </span>
              <h2 className="text-2xl font-black text-stone-900 dark:text-white mt-1">{selectedAnimal.name}</h2>
              <p className="text-xs text-stone-500">{selectedAnimal.breed} • {selectedAnimal.bloodDegree} • {selectedAnimal.geneticLineage}</p>
            </div>

            <div className="text-right bg-stone-50 dark:bg-zinc-800 p-3 rounded-xl border border-stone-200/60 dark:border-zinc-700/60">
              <span className="text-[10px] text-stone-400 block uppercase font-bold">Inbreeding Est.</span>
              <span className="text-lg font-black text-purple-600">{selectedAnimal.inbreedingCoeff || 0.0}%</span>
            </div>
          </div>

          {/* 3-Tier Visual Tree Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Level 1: Selected Animal */}
            <div className="p-5 bg-gradient-to-br from-purple-900 to-stone-900 text-white rounded-2xl shadow-md border border-purple-500/30 text-center space-y-2">
              <span className="text-[10px] uppercase font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-400/30">
                Indivíduo Progenitor
              </span>
              <h3 className="font-extrabold text-lg">{selectedAnimal.name}</h3>
              <p className="text-xs text-stone-300 font-mono">{selectedAnimal.earTag}</p>
              <div className="text-[11px] text-stone-300 pt-2 border-t border-white/10">
                Grau: {selectedAnimal.bloodDegree}
              </div>
            </div>

            {/* Level 2: Parents */}
            <div className="space-y-4">
              {/* Father */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">Pai (Bode Sire)</span>
                  <Award className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                  {selectedAnimal.fatherName || sireObj?.name || 'Bode Trovão PO'}
                </h4>
                <p className="text-[11px] text-stone-500">{sireObj ? `${sireObj.breed} (${sireObj.bloodDegree})` : 'Boer PO Importado'}</p>
              </div>

              {/* Mother */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Mãe (Matriz Dam)</span>
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                  {selectedAnimal.motherName || damObj?.name || 'Rainha do Sertão'}
                </h4>
                <p className="text-[11px] text-stone-500">{damObj ? `${damObj.breed} (${damObj.bloodDegree})` : 'Anglo-Nubiana PO'}</p>
              </div>
            </div>

            {/* Level 3: Grandparents */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-lg border border-stone-200/60 dark:border-zinc-700/60">
                <span className="text-[9px] text-stone-400 block font-bold">Avô Paterno:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{selectedAnimal.paternalGrandfather || 'Imperador Anglo PO'}</span>
              </div>
              <div className="p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-lg border border-stone-200/60 dark:border-zinc-700/60">
                <span className="text-[9px] text-stone-400 block font-bold">Avó Paterna:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{selectedAnimal.paternalGrandmother || 'Princesa da Serra'}</span>
              </div>
              <div className="p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-lg border border-stone-200/60 dark:border-zinc-700/60">
                <span className="text-[9px] text-stone-400 block font-bold">Avô Materno:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{selectedAnimal.maternalGrandfather || 'Sultão do Agreste'}</span>
              </div>
              <div className="p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-lg border border-stone-200/60 dark:border-zinc-700/60">
                <span className="text-[9px] text-stone-400 block font-bold">Avó Materna:</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{selectedAnimal.maternalGrandmother || 'Nuvens Brancas'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulator: Mating Compatibility & Inbreeding Prevention */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-emerald-600" />
          Simulador de Cruzamento & Prevenção de Inbreeding
        </h2>
        <p className="text-xs text-stone-500">
          Selecione o reprodutor e a matriz para prever o grau de consanguinidade das crias e o grau de sangue resultante.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Selecione o Bode (Pai):</label>
            <select
              value={sireSearch}
              onChange={e => setSireSearch(e.target.value)}
              className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
            >
              <option value="">-- Escolher Bode Reprodutor --</option>
              {animals.filter(a => a.sex === 'Macho (Bode)').map(b => (
                <option key={b.id} value={b.id}>{b.earTag} - {b.name} ({b.breed})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">Selecione a Cabra (Matriz):</label>
            <select
              value={damSearch}
              onChange={e => setDamSearch(e.target.value)}
              className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
            >
              <option value="">-- Escolher Matriz --</option>
              {animals.filter(a => a.sex === 'Fêmea').map(m => (
                <option key={m.id} value={m.id}>{m.earTag} - {m.name} ({m.breed})</option>
              ))}
            </select>
          </div>
        </div>

        {sireCandidate && damCandidate && (
          <div className="p-4 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200/80 dark:border-zinc-700/80 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                Cruzamento: {sireCandidate.name} x {damCandidate.name}
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Estimativa F1 / Mestiço Comercial • Heterose (Vigor Híbrido) Máxima
              </p>
            </div>

            <div className="text-right">
              <span className={`inline-block text-xs font-black px-3 py-1 rounded-full ${
                simulatedInbreeding > 5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                Consanguinidade: {simulatedInbreeding.toFixed(1)}%
              </span>
              <p className="text-[10px] text-stone-400 mt-1">
                {simulatedInbreeding > 5 ? '⚠️ Risco de depressão endogâmica' : '✅ Acasalamento seguro recomendado'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
