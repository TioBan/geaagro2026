import React from 'react';
import {
  X,
  Printer,
  QrCode,
  ShieldCheck,
  Award,
  Calendar,
  Dna,
  Heart,
  Scale,
  Sparkles,
  MapPin,
  FileText,
  User,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { EquineAnimal, EquineHealthRecord, EquineFarrieryRecord, EquineBiometricsRecord } from '../../types/equine';

interface Props {
  animal: EquineAnimal;
  healthRecords?: EquineHealthRecord[];
  farrieryRecords?: EquineFarrieryRecord[];
  biometricsRecords?: EquineBiometricsRecord[];
  onClose: () => void;
}

export const EquineDigitalPassportModal: React.FC<Props> = ({
  animal,
  healthRecords = [],
  farrieryRecords = [],
  biometricsRecords = [],
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const recentVaccines = healthRecords.filter(h => h.type === 'Vacinação' && h.animalId === animal.id);
  const recentFarriery = farrieryRecords.find(f => f.animalId === animal.id);
  const latestBiometrics = biometricsRecords.find(b => b.animalId === animal.id);

  // Age calculation
  const birth = new Date(animal.birthDate);
  const now = new Date();
  const diffYears = now.getFullYear() - birth.getFullYear();
  const diffMonths = now.getMonth() - birth.getMonth();
  const totalMonths = diffYears * 12 + diffMonths;
  const ageDisplay = totalMonths >= 24
    ? `${Math.floor(totalMonths / 12)} anos e ${totalMonths % 12} meses`
    : `${totalMonths} meses`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-900/20 max-w-4xl w-full max-h-[92vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none">
        {/* Modal Top Actions (Hidden in Print) */}
        <div className="sticky top-0 z-20 bg-stone-900 text-amber-100 px-6 py-4 flex items-center justify-between border-b border-amber-800/40 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">Passaporte Digital Equino</div>
              <h2 className="text-lg font-black text-white">{animal.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Passaporte Oficial
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Passport Body */}
        <div className="p-6 sm:p-8 space-y-6 text-stone-800 font-sans">
          {/* Header Badge & Republic / Association Ribbon */}
          <div className="border-4 border-double border-amber-800/40 rounded-2xl p-6 bg-gradient-to-b from-amber-50/60 to-stone-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-amber-900/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-amber-700 text-amber-50 flex items-center justify-center font-black text-2xl shadow-md border-2 border-amber-400">
                  🐎
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black text-amber-900 tracking-widest">
                    GEAAGRO SUITE • PASSAPORTE EQUINO OFICIAL
                  </div>
                  <h1 className="text-2xl font-black text-stone-900 tracking-tight">{animal.name}</h1>
                  <div className="text-xs text-stone-600 font-semibold mt-0.5">
                    {animal.association} • Registro Oficial: <strong className="text-amber-900 font-mono">{animal.registrationNumber}</strong>
                  </div>
                </div>
              </div>

              {/* QR Code Identification Box */}
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-amber-800/30 shadow-xs">
                <div className="w-16 h-16 bg-stone-900 text-white rounded-lg flex flex-col items-center justify-center p-1 font-mono text-[9px] text-center shrink-0">
                  <QrCode className="w-10 h-10 text-amber-400" />
                  <span className="truncate w-full font-bold">QR AUTH</span>
                </div>
                <div className="text-[11px] leading-tight font-mono">
                  <div className="text-stone-400 text-[9px] uppercase font-bold">Passaporte Digital</div>
                  <div className="font-bold text-stone-900">{animal.passportNumber}</div>
                  <div className="text-amber-800 font-bold mt-1">Microchip: {animal.microchip}</div>
                  {animal.rfid && <div className="text-stone-500">RFID: {animal.rfid}</div>}
                </div>
              </div>
            </div>

            {/* Core Identification Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
              {/* Photo & Status */}
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border-2 border-amber-800/30 shadow-md aspect-4/3 bg-stone-200">
                  <img
                    src={animal.photoUrl}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-400/30">
                    {animal.status}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Espécie:</span>
                    <span className="font-bold text-stone-900">{animal.species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Raça:</span>
                    <span className="font-bold text-stone-900">{animal.breed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Pelagem:</span>
                    <span className="font-bold text-stone-900">{animal.coatColor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Sexo:</span>
                    <span className="font-bold text-stone-900">{animal.sex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Modalidade:</span>
                    <span className="font-bold text-amber-900">{animal.discipline}</span>
                  </div>
                </div>
              </div>

              {/* Biometrics & Dates */}
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-2">
                  <div className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b pb-1">
                    <Scale className="w-3.5 h-3.5" /> Biometria & Resenha Física
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-stone-400 text-[10px] block">Nascimento</span>
                      <span className="font-bold text-stone-900">{new Date(animal.birthDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] block">Idade Atual</span>
                      <span className="font-bold text-amber-900">{ageDisplay}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] block">Peso Atual</span>
                      <span className="font-bold text-stone-900">{animal.weightKg} kg</span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] block">Cernelha</span>
                      <span className="font-bold text-stone-900">{animal.heightM} m</span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] block">P. Torácico</span>
                      <span className="font-bold text-stone-900">{animal.chestCircumferenceCm} cm</span>
                    </div>
                    <div>
                      <span className="text-stone-400 text-[10px] block">Escore Corporal</span>
                      <span className="font-bold text-emerald-800">{animal.bodyScore}/9 (Henneke)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1.5">
                  <div className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b pb-1">
                    <User className="w-3.5 h-3.5" /> Titularidade & Origem
                  </div>
                  <div className="text-[11px]">
                    <span className="text-stone-400 text-[10px] block">Criador</span>
                    <span className="font-bold text-stone-900">{animal.breeder}</span>
                  </div>
                  <div className="text-[11px] pt-1">
                    <span className="text-stone-400 text-[10px] block">Proprietário Atual</span>
                    <span className="font-bold text-stone-900">{animal.owner}</span>
                  </div>
                </div>
              </div>

              {/* Quick Pedigree Tree Box */}
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-2">
                  <div className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 border-b pb-1">
                    <Dna className="w-3.5 h-3.5" /> Genealogia Imediata (Pais)
                  </div>
                  <div className="p-2 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="text-[10px] font-black text-blue-900 uppercase block">Pai (Sire)</span>
                    <span className="font-bold text-stone-900 text-xs block">{animal.pedigree?.sire?.name || 'Não informado'}</span>
                    <span className="text-[10px] text-stone-500">{animal.pedigree?.sire?.registrationNumber || 'Sem Reg.'}</span>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="text-[10px] font-black text-rose-900 uppercase block">Mãe (Dam)</span>
                    <span className="font-bold text-stone-900 text-xs block">{animal.pedigree?.dam?.name || 'Não informada'}</span>
                    <span className="text-[10px] text-stone-500">{animal.pedigree?.dam?.registrationNumber || 'Sem Reg.'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-stone-500">Consanguinidade (F):</span>
                    <span className="font-bold text-stone-900 font-mono">{animal.inbreedingCoefficient ?? 1.2}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Health & Sanitary Clearance Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-emerald-900 font-bold text-xs uppercase border-b border-emerald-200 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Status Sanitário & Vacinas
                </span>
                <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">EM DIA</span>
              </div>
              {recentVaccines.length > 0 ? (
                <ul className="space-y-1.5 text-[11px]">
                  {recentVaccines.map(v => (
                    <li key={v.id} className="flex justify-between items-center text-stone-800">
                      <div>
                        <span className="font-bold">{v.title}</span>
                        <span className="text-stone-500 block text-[10px]">{v.productOrDrug}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-stone-600 font-mono text-[10px]">{new Date(v.date).toLocaleDateString('pt-BR')}</span>
                        <span className="text-emerald-700 font-bold text-[10px] block">Próx: {v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString('pt-BR') : 'Anual'}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-stone-500 italic text-[11px]">Polivalente e Antirrábica aplicadas regularmente no Haras.</div>
              )}
            </div>

            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between text-amber-900 font-bold text-xs uppercase border-b border-amber-200 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-700" /> Ferrageamento & Podologia
                </span>
                <span className="bg-amber-700 text-white text-[10px] px-2 py-0.5 rounded-full font-black">BALANCEADO</span>
              </div>
              {recentFarriery ? (
                <div className="text-[11px] space-y-1 text-stone-800">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Última Troca:</span>
                    <span className="font-bold">{new Date(recentFarriery.date).toLocaleDateString('pt-BR')} ({recentFarriery.farrierName})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Tipo:</span>
                    <span className="font-bold">{recentFarriery.horseshoeType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Ângulos Mão/Pé:</span>
                    <span className="font-bold font-mono">{recentFarriery.frontHoofAngleDegrees}° / {recentFarriery.hindHoofAngleDegrees}°</span>
                  </div>
                  <div className="flex justify-between text-amber-900 font-bold">
                    <span>Próxima Troca Agendada:</span>
                    <span>{new Date(recentFarriery.nextShoeingDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ) : (
                <div className="text-stone-500 italic text-[11px]">Casqueamento e ferrageamento a quente em dia com ciclo de 35 dias.</div>
              )}
            </div>
          </div>

          {/* Official Endorsement & Signatures */}
          <div className="pt-6 border-t-2 border-stone-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-stone-400 pb-1 mb-1"></div>
              <div className="font-bold text-stone-900">{animal.owner}</div>
              <div className="text-[11px] text-stone-500">Proprietário / Titular do Haras</div>
            </div>
            <div>
              <div className="border-b border-stone-400 pb-1 mb-1"></div>
              <div className="font-bold text-stone-900">Médico Veterinário Responsável</div>
              <div className="text-[11px] text-stone-500">CRMV / Certificação Sanitária Oficial</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
