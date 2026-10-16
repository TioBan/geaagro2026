import React, { useState } from 'react';
import { BuffaloAnimal } from '../../types/buffalo';
import { Dna, Award, Search, ArrowRight, UserCheck, Shield } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Top Selector */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 block">
            Genética &amp; Linhagens Bubalinas
          </span>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Dna className="w-5 h-5 text-teal-600" />
            <span>Árvore Genealógica de 3 Gerações</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500">Selecionar Búfalo:</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-800 dark:text-zinc-200"
          >
            {animals.map((a) => (
              <option key={a.id} value={a.id}>
                {a.identificationNumber} - {a.name} ({a.breed} • {a.bloodDegree})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedAnimal && (
        <div className="space-y-6">
          {/* Card Central do Animal Selecionado */}
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 border border-teal-500/30 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-teal-500/30 text-teal-300 rounded-full font-bold text-xs">
                  {selectedAnimal.breed}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-md font-bold text-xs">
                  {selectedAnimal.bloodDegree}
                </span>
              </div>
              <h3 className="text-2xl font-black">{selectedAnimal.name}</h3>
              <p className="text-xs text-slate-300">
                Brinco: <strong>{selectedAnimal.identificationNumber}</strong> • Reg. ABCB: <strong>{selectedAnimal.registrationCodeABCB || 'N/D'}</strong>
              </p>
              {selectedAnimal.geneticLineage && (
                <p className="text-xs text-teal-300 font-semibold pt-1">
                  Linhagem: {selectedAnimal.geneticLineage}
                </p>
              )}
            </div>

            <button
              onClick={() => onSelectAnimalForTwin(selectedAnimal.id)}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Ver Gêmeo Digital Completo
            </button>
          </div>

          {/* Estrutura da Árvore Genealógica (Nós de 3 Gerações) */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              <span>Pedigree Ascendente (Pais e Avós)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ramo Paterno */}
              <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-blue-200 dark:border-blue-900/50 pb-2">
                  <span className="text-xs font-black uppercase text-blue-700 dark:text-blue-400">Linha Paterna (Sire)</span>
                  <span className="text-[10px] font-bold text-slate-500">50% da Carga Genética</span>
                </div>

                <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-blue-100 dark:border-blue-950 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Pai (1ª Geração)</span>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {selectedAnimal.sireName || 'Imperador de Marajó'}
                  </div>
                  <span className="text-[11px] text-teal-600 font-semibold block">
                    Reg: {selectedAnimal.sireRegistration || 'ABCB-MR-60112'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-blue-50 dark:border-blue-950 shadow-2xs">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Avô Paterno</span>
                    <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                      {selectedAnimal.paternalGrandsire || 'Sultan da Índia 102'}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-blue-50 dark:border-blue-950 shadow-2xs">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Avó Paterna</span>
                    <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                      {selectedAnimal.paternalGranddam || 'Rainha do Nilo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ramo Materno */}
              <div className="p-5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-900/50 pb-2">
                  <span className="text-xs font-black uppercase text-rose-700 dark:text-rose-400">Linha Materna (Dam)</span>
                  <span className="text-[10px] font-bold text-slate-500">50% da Carga Genética</span>
                </div>

                <div className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-rose-100 dark:border-rose-950 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Mãe (1ª Geração)</span>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {selectedAnimal.damName || 'Estrela Negra do Vale'}
                  </div>
                  <span className="text-[11px] text-teal-600 font-semibold block">
                    Reg: {selectedAnimal.damRegistration || 'ABCB-MR-71044'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-rose-50 dark:border-rose-950 shadow-2xs">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Avô Materno</span>
                    <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                      {selectedAnimal.maternalGrandsire || 'Gran Murrah Nacional'}
                    </span>
                  </div>
                  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-rose-50 dark:border-rose-950 shadow-2xs">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">Avó Materna</span>
                    <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                      {selectedAnimal.maternalGranddam || 'Pretinha do Pantanal'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diferenciais Genéticos da Raça */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs text-slate-700 dark:text-zinc-300 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">
                Padrão Racial &amp; Características Hereditárias:
              </span>
              <p>
                Os búfalos da raça <strong>{selectedAnimal.breed}</strong> possuem alta herdabilidade para teor de sólidos totais (gordura e caseínas), com conformação de úbere adaptada e docilidade para ordenha com ou sem bezerro ao pé.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
