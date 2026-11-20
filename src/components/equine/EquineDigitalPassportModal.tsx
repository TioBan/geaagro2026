import React from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  QrCode,
  Dna,
  Syringe,
  Hammer,
  Scale,
} from 'lucide-react';
import {
  EquineAnimal,
  EquineHealthRecord,
  EquineFarrieryRecord,
  EquineBiometricsRecord,
} from '../../types/equine';
import { EquinoIcon } from '../icons/EquinoIcon';

interface Props {
  animal: EquineAnimal;
  healthRecords: EquineHealthRecord[];
  farrieryRecords: EquineFarrieryRecord[];
  biometricsRecords: EquineBiometricsRecord[];
  onClose: () => void;
}

export const EquineDigitalPassportModal: React.FC<Props> = ({
  animal,
  healthRecords,
  farrieryRecords,
  biometricsRecords,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const vaccines = healthRecords.filter(h => h.type === 'Vacinação');
  const exams = healthRecords.filter(h => h.type === 'Exame Laboratorial');
  const latestBiometrics = biometricsRecords[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto print:bg-white print:p-0">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-0">
        {/* Modal Toolbar (hidden on print) */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Passaporte Digital Equino — {animal.name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 space-y-6">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
                <EquinoIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Documento de Identificação & Sanidade Equina
                </div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">
                  {animal.name}
                </h1>
                <div className="text-xs text-slate-600 tabular-nums">
                  Passaporte: <span className="font-mono font-semibold">{animal.passportNumber || 'Em emissão'}</span> · Registro: <span className="font-semibold">{animal.registrationNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border border-slate-200 rounded-lg px-3 py-2 shrink-0">
              <QrCode className="w-9 h-9 text-slate-900" />
              <div className="text-[10px] leading-tight">
                <div className="font-semibold text-slate-900">ISO 11784 / 11785</div>
                <div className="font-mono text-slate-600">{animal.microchip || 'Sem microchip'}</div>
                <div className="text-emerald-700 font-medium">Emitido em {new Date().toLocaleDateString('pt-BR')}</div>
              </div>
            </div>
          </div>

          {/* Identity & Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div className="h-40 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
              {animal.photoUrl ? (
                <img src={animal.photoUrl} alt={animal.name} className="w-full h-full object-cover" />
              ) : (
                <EquinoIcon className="w-10 h-10 text-slate-300" />
              )}
            </div>

            <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Raça</span>
                <span className="font-semibold text-slate-900">{animal.breed}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Pelagem</span>
                <span className="font-semibold text-slate-900">{animal.coatColor}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Sexo</span>
                <span className="font-semibold text-slate-900">{animal.sex}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Nascimento</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {animal.birthDate ? new Date(animal.birthDate).toLocaleDateString('pt-BR') : '—'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Categoria</span>
                <span className="font-semibold text-slate-900">{animal.category}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Modalidade</span>
                <span className="font-semibold text-slate-900">{animal.discipline}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Criador / Haras</span>
                <span className="font-semibold text-slate-900">{animal.breeder || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Proprietário</span>
                <span className="font-semibold text-slate-900">{animal.owner || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-slate-500 block">Associação</span>
                <span className="font-semibold text-slate-900">{animal.association || '—'}</span>
              </div>
            </div>
          </div>

          {/* Biometrics Strip */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>Resenha Biométrica Atual</span>
              {latestBiometrics && (
                <span className="text-[10px] font-normal text-slate-500 ml-auto tabular-nums">
                  Última avaliação: {new Date(latestBiometrics.date).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 divide-x divide-slate-200 text-xs tabular-nums">
              <div className="p-2.5">
                <span className="text-[10px] text-slate-500 block">Peso Vivo</span>
                <span className="font-semibold">{animal.weightKg} kg</span>
              </div>
              <div className="p-2.5">
                <span className="text-[10px] text-slate-500 block">Cernelha</span>
                <span className="font-semibold">{animal.heightM.toFixed(2)} m</span>
              </div>
              <div className="p-2.5">
                <span className="text-[10px] text-slate-500 block">Perím. Torácico</span>
                <span className="font-semibold">{animal.chestCircumferenceCm || '—'} cm</span>
              </div>
              <div className="p-2.5">
                <span className="text-[10px] text-slate-500 block">Escore Henneke</span>
                <span className="font-semibold">{animal.bodyScore} / 9</span>
              </div>
            </div>
          </div>

          {/* Pedigree */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5" />
              <span>Genealogia Oficial</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-xs">
              <div className="p-3 space-y-1">
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Linhagem Paterna (Pai)</div>
                <div className="font-semibold text-slate-900">{animal.pedigree?.sire?.name || 'Não informado'}</div>
                <div className="text-[11px] text-slate-600">
                  Avô: {animal.pedigree?.paternalGrandsire?.name || '—'} · Avó: {animal.pedigree?.paternalGranddam?.name || '—'}
                </div>
              </div>
              <div className="p-3 space-y-1">
                <div className="text-[10px] uppercase text-slate-500 font-semibold">Linhagem Materna (Mãe)</div>
                <div className="font-semibold text-slate-900">{animal.pedigree?.dam?.name || 'Não informada'}</div>
                <div className="text-[11px] text-slate-600">
                  Avô: {animal.pedigree?.maternalGrandsire?.name || '—'} · Avó: {animal.pedigree?.maternalGranddam?.name || '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Sanitary & Podology Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Syringe className="w-3.5 h-3.5" />
                <span>Vacinas & Exames MAPA ({vaccines.length + exams.length})</span>
              </div>
              <div className="p-3 space-y-2 text-xs">
                {vaccines.length + exams.length === 0 ? (
                  <p className="text-slate-500">Nenhum registro vacinal ou exame oficial cadastrado.</p>
                ) : (
                  [...exams, ...vaccines].slice(0, 5).map(rec => (
                    <div key={rec.id} className="flex justify-between gap-2 border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 truncate">{rec.title}</div>
                        <div className="text-[10px] text-slate-500 truncate">{rec.veterinarian}</div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600 shrink-0 tabular-nums">
                        {new Date(rec.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Hammer className="w-3.5 h-3.5" />
                <span>Histórico Podológico ({farrieryRecords.length})</span>
              </div>
              <div className="p-3 space-y-2 text-xs">
                {farrieryRecords.length === 0 ? (
                  <p className="text-slate-500">Nenhum ferrageamento registrado.</p>
                ) : (
                  farrieryRecords.slice(0, 5).map(rec => (
                    <div key={rec.id} className="flex justify-between gap-2 border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900 truncate">{rec.horseshoeType}</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {rec.farrierName} · {rec.hoofCondition}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600 shrink-0 tabular-nums">
                        {new Date(rec.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
            <span>Documento gerado eletronicamente para conferência de manejo, transporte e provas.</span>
            <span className="font-mono">ID: {animal.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
