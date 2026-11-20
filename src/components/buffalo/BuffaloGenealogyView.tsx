import React, { useState } from 'react';
import { BuffaloAnimal } from '../../types/buffalo';
import { Dna, ArrowUpRight } from 'lucide-react';

interface BuffaloGenealogyViewProps {
  animals: BuffaloAnimal[];
  onSelectAnimalForTwin: (id: string) => void;
}

export const BuffaloGenealogyView: React.FC<BuffaloGenealogyViewProps> = ({
  animals,
  onSelectAnimalForTwin
}) => {
  const [selectedId, setSelectedId] = useState<string>(animals[0]?.id || '');
  const selectedAnimal = animals.find(a => a.id === selectedId) || animals[0];

  return (
    <div className="space-y-4">
      {/* Seletor */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Dna className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Árvore Genealógica &amp; Registro ABCB</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Pedigree ascendente de 3 gerações e linhagens bubalinas
          </p>
        </div>

        {animals.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs text-slate-500 dark:text-zinc-400 whitespace-nowrap">Animal:</label>
            <select
              value={selectedAnimal?.id || ''}
              onChange={(e) => setSelectedId(e.target.value)}
              className="h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-slate-900 dark:text-zinc-100 cursor-pointer"
            >
              {animals.map(a => (
                <option key={a.id} value={a.id}>
                  {a.identificationNumber} - {a.name} ({a.breed})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedAnimal ? (
        <div className="space-y-4">
          {/* Resumo do Animal Selecionado */}
          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                <span className="font-medium text-teal-600 dark:text-teal-400">{selectedAnimal.breed}</span>
                <span aria-hidden="true">·</span>
                <span>{selectedAnimal.bloodDegree}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">ABCB: {selectedAnimal.registrationCodeABCB || 'Não informado'}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {selectedAnimal.identificationNumber} · {selectedAnimal.name}
              </h3>
              {selectedAnimal.geneticLineage && (
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  Linhagem: {selectedAnimal.geneticLineage}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onSelectAnimalForTwin(selectedAnimal.id)}
              className="h-8 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0 transition-colors"
            >
              <span>Abrir Gêmeo 360°</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </section>

          {/* Pedigree Ascendente */}
          <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Pedigree Ascendente (Pais e Avós)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Linha Paterna */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800 text-xs">
                  <span className="font-semibold text-sky-700 dark:text-sky-400">Linha Paterna (Sire)</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">50% genética</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pai (1ª Geração)</span>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedAnimal.sireName || 'Não informado'}
                  </div>
                  {selectedAnimal.sireRegistration && (
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      Reg.: {selectedAnimal.sireRegistration}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/80 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Avô Paterno</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200">
                      {selectedAnimal.paternalGrandsire || 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Avó Paterna</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200">
                      {selectedAnimal.paternalGranddam || 'Não informado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Linha Materna */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800 text-xs">
                  <span className="font-semibold text-rose-700 dark:text-rose-400">Linha Materna (Dam)</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">50% genética</span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Mãe (1ª Geração)</span>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedAnimal.damName || 'Não informado'}
                  </div>
                  {selectedAnimal.damRegistration && (
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      Reg.: {selectedAnimal.damRegistration}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/80 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Avô Materno</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200">
                      {selectedAnimal.maternalGrandsire || 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Avó Materna</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200">
                      {selectedAnimal.maternalGranddam || 'Não informado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800 leading-relaxed">
              <strong className="text-slate-800 dark:text-zinc-200">Padrão racial ({selectedAnimal.breed}):</strong>{' '}
              elevada herdabilidade para teor de sólidos totais (gordura e caseína), longevidade produtiva e adaptação a áreas tropicais úmidas.
            </p>
          </section>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-10 text-center space-y-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Nenhum búfalo cadastrado</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            Cadastre animais na aba Cadastro para consultar a árvore genealógica e o registro ABCB.
          </p>
        </div>
      )}
    </div>
  );
};
