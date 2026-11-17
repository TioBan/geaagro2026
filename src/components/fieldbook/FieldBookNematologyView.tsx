import React, { useState } from 'react';
import { Building2, Leaf, Microscope, Plus } from 'lucide-react';
import { Field } from '../../types/fieldbook';
import { INITIAL_NEMATODE_FIELDS, NEMATODE_SPECIES_CATALOG } from '../../data/nematologyData';

interface FieldBookNematologyViewProps {
  fields: Field[];
  handleNavigateToRegister: () => void;
  handleAddNematicideOperation: (fieldId: string, product: string, dosage: string) => void;
}

export const FieldBookNematologyView: React.FC<FieldBookNematologyViewProps> = ({
  fields,
  handleNavigateToRegister,
  handleAddNematicideOperation,
}) => {
  const [selectedNemaFieldId, setSelectedNemaFieldId] = useState<string>(fields[0]?.id || '');
  const selectedField = fields.find(f => f.id === selectedNemaFieldId) || fields[0];

  if (!selectedField) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-10 text-center space-y-3 animate-fade-in">
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
          <Microscope className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-white text-base">Nenhum talhão cadastrado</h4>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          Cadastre os talhões da propriedade para vincular análises nematológicas e prescrições de controle biológico no Caderno de Campo.
        </p>
        <button
          onClick={handleNavigateToRegister}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
        >
          <Building2 className="w-4 h-4" />
          <span>Cadastrar Talhões na Fazenda</span>
        </button>
      </div>
    );
  }

  const matchedNemaField = INITIAL_NEMATODE_FIELDS.find(
    nf =>
      nf.fieldName?.toLowerCase().includes(selectedField.name.toLowerCase()) ||
      selectedField.name.toLowerCase().includes(nf.fieldName?.toLowerCase() || '') ||
      nf.id === selectedField.id
  );

  const dominantSpecies = matchedNemaField
    ? NEMATODE_SPECIES_CATALOG.find(s => s.id === matchedNemaField.dominantSpeciesId)
    : undefined;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Microscope className="w-6 h-6 text-emerald-600" />
            Monitoramento &amp; Controle de Nematoides
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            Integração fitossanitária de análises nematológicas com o Caderno de Campo.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300 whitespace-nowrap">Filtrar Talhão:</label>
          <select
            value={selectedNemaFieldId || selectedField.id}
            onChange={e => setSelectedNemaFieldId(e.target.value)}
            className="w-full md:w-64 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {fields.map(f => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.crop})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!matchedNemaField ? (
        <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800">
            <Microscope className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-white">Nenhum laudo nematológico cadastrado</h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
            Não existem amostras laboratoriais ou laudos de nematoides registrados para o talhão <strong>{selectedField.name}</strong>.
          </p>
          <div className="pt-2">
            <button
              onClick={() => handleAddNematicideOperation(selectedField.id, 'Manejo Biológico Preventivo', '2.0 L/ha')}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Planejar Manejo Preventivo no Caderno</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800/60 pb-4">
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Diagnóstico Técnico Recente</h4>
                <p className="text-xs text-slate-400">Coleta vinculada ao talhão {selectedField.name}.</p>
              </div>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full border ${
                  matchedNemaField.currentRisk === 'Alta' || matchedNemaField.currentRisk === 'Muito Alta'
                    ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30'
                    : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30'
                }`}
              >
                Risco: {matchedNemaField.currentRisk || 'Não Definido'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Espécie Dominante</span>
                <strong className="text-sm text-slate-800 dark:text-white italic block truncate" title={dominantSpecies?.scientificName || '--'}>
                  {dominantSpecies?.scientificName || '--'}
                </strong>
                <span className="text-[10px] text-slate-400 block">({dominantSpecies?.commonName || 'Não identificada'})</span>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">População Solo (200cm³)</span>
                <strong className="text-lg text-slate-800 dark:text-white block font-black">
                  {matchedNemaField.labResults[0]?.populationSoil200cm3 ?? 0}
                </strong>
                <span className="text-[10px] text-slate-400 block">Indivíduos Ativos</span>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">População Raiz (10g)</span>
                <strong className="text-lg text-slate-800 dark:text-white block font-black">
                  {matchedNemaField.labResults[0]?.populationRoot10g ?? 0}
                </strong>
                <span className="text-[10px] text-slate-400 block">Presença Intradérmica</span>
              </div>

              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fator Reprodução (FR)</span>
                <strong className={`text-lg block font-black ${(matchedNemaField.reproductionFactor || 0) < 1 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {matchedNemaField.reproductionFactor ?? 0}
                </strong>
                <span className="text-[10px] text-slate-400 block">
                  {(matchedNemaField.reproductionFactor || 0) < 1 ? 'População em queda' : 'População em alta'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-100 dark:border-zinc-800/60 pb-4">
                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  Prescrição de Manejo Integrado
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Mapeamento biológico de combate ativo</p>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Planeje a aplicação biológica e rotação antagonista diretamente no Caderno de Campo para o talhão <strong>{selectedField.name}</strong>.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/60 mt-4">
              <button
                onClick={() => handleAddNematicideOperation(selectedField.id, 'Nematicida Biológico', '2.0 L/ha')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Planejar Nematicida no Caderno</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldBookNematologyView;
