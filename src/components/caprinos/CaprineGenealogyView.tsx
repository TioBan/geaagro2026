import React, { useState } from 'react';
import { CaprineAnimal } from '../../types/caprine';
import { Dna, GitBranch, Award, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
}

export const CaprineGenealogyView: React.FC<Props> = ({ animals }) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(animals[0]?.id || '');
  const [sireSearch, setSireSearch] = useState('');
  const [damSearch, setDamSearch] = useState('');

  const selectedAnimal = animals.find(a => a.id === selectedAnimalId) || animals[0];

  const sireObj = animals.find(
    a =>
      a.id === selectedAnimal?.fatherId ||
      (selectedAnimal?.fatherName && a.name === selectedAnimal.fatherName)
  );
  const damObj = animals.find(
    a =>
      a.id === selectedAnimal?.motherId ||
      (selectedAnimal?.motherName && a.name === selectedAnimal.motherName)
  );

  const sireCandidate = animals.find(a => a.id === sireSearch);
  const damCandidate = animals.find(a => a.id === damSearch);

  let simulatedInbreeding = 0;
  if (sireCandidate && damCandidate) {
    if (sireCandidate.fatherId && sireCandidate.fatherId === damCandidate.fatherId) {
      simulatedInbreeding += 12.5;
    }
    if (sireCandidate.motherId && sireCandidate.motherId === damCandidate.motherId) {
      simulatedInbreeding += 12.5;
    }
    if (
      sireCandidate.id === damCandidate.fatherId ||
      damCandidate.id === sireCandidate.motherId
    ) {
      simulatedInbreeding += 25.0;
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Dna className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
            Genealogia &amp; Controle de Consanguinidade
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Ascendentes (pais e avós), grau de sangue (PO, PC, F1) e simulação de cruzamentos.
          </p>
        </div>

        {animals.length > 0 && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 shrink-0">
              Caprino:
            </label>
            <select
              value={selectedAnimal?.id || ''}
              onChange={e => setSelectedAnimalId(e.target.value)}
              className="flex-1 sm:w-64 h-8 px-2.5 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 rounded-lg text-xs font-medium border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {animals.map(a => (
                <option key={a.id} value={a.id}>
                  {a.earTag} — {a.name} ({a.bloodDegree})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pedigree Card */}
      {selectedAnimal ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 px-2 py-0.5 rounded-md">
                  {selectedAnimal.earTag}
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400">
                  {selectedAnimal.breed} · {selectedAnimal.bloodDegree}
                </span>
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 mt-1">
                {selectedAnimal.name}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Linhagem: {selectedAnimal.geneticLineage || 'Não informada'}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Consanguinidade Estimada
              </span>
              <span className="text-lg font-semibold tabular-nums text-violet-600 dark:text-violet-400">
                {(selectedAnimal.inbreedingCoeff ?? 0).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* 3-Tier Hairline Pedigree */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Tier 1: Subject */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-violet-200 dark:border-violet-900/50 flex flex-col justify-center space-y-1.5">
              <span className="text-[11px] font-medium text-violet-600 dark:text-violet-400">
                Indivíduo Selecionado
              </span>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                {selectedAnimal.name}
              </h3>
              <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                {selectedAnimal.earTag}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-200 dark:border-zinc-800">
                Grau: {selectedAnimal.bloodDegree}
              </p>
            </div>

            {/* Tier 2: Parents */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-violet-600 dark:text-violet-400">
                    Pai (Reprodutor)
                  </span>
                  <Award className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  {selectedAnimal.fatherName || sireObj?.name || 'Não informado'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {sireObj ? `${sireObj.breed} (${sireObj.bloodDegree})` : 'Registro externo'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Mãe (Matriz)
                  </span>
                  <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  {selectedAnimal.motherName || damObj?.name || 'Não informada'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {damObj ? `${damObj.breed} (${damObj.bloodDegree})` : 'Registro externo'}
                </p>
              </div>
            </div>

            {/* Tier 3: Grandparents */}
            <div className="grid grid-cols-1 gap-2 text-xs">
              {[
                { label: 'Avô Paterno', value: selectedAnimal.paternalGrandfather },
                { label: 'Avó Paterna', value: selectedAnimal.paternalGrandmother },
                { label: 'Avô Materno', value: selectedAnimal.maternalGrandfather },
                { label: 'Avó Materna', value: selectedAnimal.maternalGrandmother }
              ].map(gp => (
                <div
                  key={gp.label}
                  className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800"
                >
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                    {gp.label}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200">
                    {gp.value || 'Não informado'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
          Cadastre animais no plantel para visualizar a árvore genealógica.
        </div>
      )}

      {/* Mating Compatibility Simulator */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Simulador de Acasalamento &amp; Prevenção de Inbreeding
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Selecione reprodutor e matriz para estimar o coeficiente de consanguinidade das crias.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Bode Reprodutor (Pai)
            </label>
            <select
              value={sireSearch}
              onChange={e => setSireSearch(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Selecionar reprodutor...</option>
              {animals
                .filter(a => a.sex === 'Macho (Bode)')
                .map(b => (
                  <option key={b.id} value={b.id}>
                    {b.earTag} — {b.name} ({b.breed})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Cabra Matriz (Mãe)
            </label>
            <select
              value={damSearch}
              onChange={e => setDamSearch(e.target.value)}
              className="w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Selecionar matriz...</option>
              {animals
                .filter(a => a.sex === 'Fêmea')
                .map(m => (
                  <option key={m.id} value={m.id}>
                    {m.earTag} — {m.name} ({m.breed})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {sireCandidate && damCandidate && (
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                {sireCandidate.name} × {damCandidate.name}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                {sireCandidate.breed === damCandidate.breed
                  ? `Cruzamento puro (${sireCandidate.breed})`
                  : `Cruzamento industrial (${sireCandidate.breed} × ${damCandidate.breed}) · Vigor híbrido`}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {simulatedInbreeding > 5 ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              )}
              <div className="text-right">
                <div
                  className={`text-xs font-semibold tabular-nums ${
                    simulatedInbreeding > 5
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  Consanguinidade: {simulatedInbreeding.toFixed(1)}%
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {simulatedInbreeding > 5
                    ? 'Risco de depressão endogâmica'
                    : 'Acasalamento recomendado'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
