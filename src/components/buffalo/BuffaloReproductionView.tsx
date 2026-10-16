// @ts-nocheck
import React, { useState } from 'react';
import { BuffaloAnimal, BuffaloReproductionRecord } from '../../types/buffalo';
import {
  HeartPulse,
  Calendar,
  Plus,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Sparkles,
  Layers3,
  X
} from 'lucide-react';

interface BuffaloReproductionViewProps {
  animals: BuffaloAnimal[];
  onUpdateAnimal: (animal: BuffaloAnimal) => void;
  onOpenDigitalTwin: (animalId: string) => void;
}

export const BuffaloReproductionView: React.FC<BuffaloReproductionViewProps> = ({
  animals,
  onUpdateAnimal,
  onOpenDigitalTwin
}) => {
  const females = (animals || []).filter(a => a && a.sex === 'Fêmea');
  const pregnant = females.filter(a => a && (a.status === 'Gestante' || (a.reproductionRecords && a.reproductionRecords.length > 0 && a.reproductionRecords[a.reproductionRecords.length - 1]?.dgResult === 'Positivo (Gestante)')));
  const lactating = females.filter(a => a && a.status === 'Em Lactação');
  const dryCows = females.filter(a => a && (a.category === 'Matriz Seca' || a.category === 'Matriz Gestante Seca'));

  // Modal para Novo Evento Reprodutivo
  const [showModal, setShowModal] = useState(false);
  const [selectedFemaleId, setSelectedFemaleId] = useState<string>(females[0]?.id || '');
  const [eventType, setEventType] = useState<BuffaloReproductionRecord['eventType']>('Protocolo IATF');
  const [eventDate, setEventDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bullSemen, setBullSemen] = useState('SEMEN-MURRAH-IND-90');
  const [protocolName, setProtocolName] = useState('IATF Ovsynch Bubalino + eCG (400 UI)');
  const [dgResult, setDgResult] = useState<'Positivo (Gestante)' | 'Negativo (Vazia)' | 'Dúvida / Reexaminar'>('Positivo (Gestante)');
  const [calvingType, setCalvingType] = useState<'Eutócico (Normal)' | 'Distócico Leve' | 'Distócico Cirúrgico'>('Eutócico (Normal)');
  const [calfSex, setCalfSex] = useState<'Fêmea' | 'Macho'>('Fêmea');
  const [calfWeight, setCalfWeight] = useState(38);
  const [notes, setNotes] = useState('');

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCow = animals.find(a => a.id === selectedFemaleId);
    if (!targetCow) return;

    const newRecord: BuffaloReproductionRecord = {
      id: `rep-${Date.now()}`,
      date: eventDate,
      eventType,
      bullOrSemenCode: eventType.includes('Inseminação') || eventType.includes('IATF') || eventType.includes('Monta') ? bullSemen : undefined,
      protocolName: eventType.includes('IATF') ? protocolName : undefined,
      dgResult: eventType.includes('Diagnóstico') ? dgResult : undefined,
      calvingType: eventType.includes('Parto') ? calvingType : undefined,
      calfSex: eventType.includes('Parto') ? calfSex : undefined,
      calfBirthWeightKg: eventType.includes('Parto') ? Number(calfWeight) : undefined,
      notes
    };

    let newStatus = targetCow.status;
    if (eventType === 'Diagnóstico de Gestação (DG)' && dgResult === 'Positivo (Gestante)') {
      newStatus = 'Gestante';
    } else if (eventType === 'Parto') {
      newStatus = 'Em Lactação';
    }

    const updated: BuffaloAnimal = {
      ...targetCow,
      status: newStatus,
      reproductionRecords: [...targetCow.reproductionRecords, newRecord]
    };

    onUpdateAnimal(updated);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Métricas Reprodutivas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total de Fêmeas Aptas</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{females.length}</div>
          <span className="text-xs text-teal-600 font-bold">{pregnant.length} confirmadas gestantes</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Taxa de Prenhez do Rebanho</span>
          <div className="text-3xl font-black text-emerald-600">
            {females.length > 0 ? Math.round((pregnant.length / females.length) * 100) : 0}%
          </div>
          <span className="text-xs text-slate-500">Meta recomendada: &gt; 80%</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Intervalo entre Partos (IEP)</span>
          <div className="text-3xl font-black text-blue-600">402 <span className="text-sm font-bold text-slate-400">dias</span></div>
          <span className="text-xs text-slate-500">13.4 meses (Eficiência alta)</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Duração da Gestação Bubalina</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">310 <span className="text-sm font-bold text-slate-400">dias</span></div>
          <span className="text-xs text-teal-600 font-bold">~10 meses e 10 dias</span>
        </div>
      </div>

      {/* Protocolos Específicos & Botão Registrar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-teal-600" />
              <span>Gestão de Protocolos IATF &amp; Estação de Monta Bubalina</span>
            </h3>
            <p className="text-xs text-slate-500">
              Uso de protocolos adaptados com eCG (400 UI) para superação do anestro estacional em búfalas.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Lançar Evento Reprodutivo</span>
          </button>
        </div>

        {/* Informação Técnica de IATF para Búfalas */}
        <div className="p-4 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/50 rounded-2xl text-xs text-teal-950 dark:text-teal-200 space-y-1.5">
          <span className="font-bold flex items-center gap-1.5 text-teal-900 dark:text-teal-300">
            <Sparkles className="w-4 h-4 text-teal-600" />
            Protocolo Ovsynch Bubalino Recomendado (Dia 0 ao Dia 10):
          </span>
          <p>
            <strong>D0:</strong> Implante de Progesterona + 2.0mg Benzoato de Estradiol. • <strong>D8:</strong> Retirada do implante + PGF2α + <strong>400 UI de eCG</strong> (crucial para crescimento folicular e ovulação em búfalas). • <strong>D10:</strong> Inseminação Artificial em Tempo Fixo (16h pós-GnRH).
          </p>
        </div>
      </div>

      {/* Lista de Fêmeas e Histórico Reprodutivo */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
          Fêmeas e Status Reprodutivo Atual
        </h4>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {females.map((cow) => {
            const records = cow.reproductionRecords || [];
            const lastRepro = records[records.length - 1];
            return (
              <div key={cow.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900 dark:text-white">{cow.identificationNumber}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{cow.name}</span>
                    <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px] rounded">
                      {cow.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Partos: <strong>{cow.parityCount || 0}</strong> • IEP: <strong>{cow.calvingIntervalDays || 405} dias</strong>
                    {cow.expectedCalvingDate && (
                      <span className="text-emerald-600 font-semibold ml-2">
                        • Previsão de Parto: {cow.expectedCalvingDate}
                      </span>
                    )}
                  </p>
                  {lastRepro && (
                    <span className="text-[11px] text-slate-600 dark:text-zinc-400 block">
                      Último evento: <strong>{lastRepro.eventType}</strong> ({lastRepro.date})
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onOpenDigitalTwin(cow.id)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-700 dark:text-zinc-300 hover:text-teal-600 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Ver Ficha Completa
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Lançamento Reprodutivo */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Lançar Evento Reprodutivo</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-700 dark:text-zinc-300 block mb-1">Selecionar Matriz / Novilha *</label>
                <select
                  value={selectedFemaleId}
                  onChange={(e) => setSelectedFemaleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {females.map(f => (
                    <option key={f.id} value={f.id}>{f.identificationNumber} - {f.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Tipo de Evento</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Protocolo IATF">Protocolo IATF com eCG</option>
                    <option value="Inseminação Artificial (IA)">Inseminação Artificial (IA)</option>
                    <option value="Monta Natural">Monta Natural</option>
                    <option value="Diagnóstico de Gestação (DG)">Diagnóstico de Gestação (DG)</option>
                    <option value="Parto">Parto</option>
                    <option value="Secagem">Secagem da Matriz</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Data</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {eventType.includes('Diagnóstico') && (
                <div>
                  <label className="text-slate-700 dark:text-zinc-300 block mb-1">Resultado do DG</label>
                  <select
                    value={dgResult}
                    onChange={(e) => setDgResult(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Positivo (Gestante)">Positivo (Gestante)</option>
                    <option value="Negativo (Vazia)">Negativo (Vazia)</option>
                    <option value="Dúvida / Reexaminar">Dúvida / Reexaminar</option>
                  </select>
                </div>
              )}

              {eventType === 'Parto' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 dark:text-zinc-300 block mb-1">Sexo do Bezerro</label>
                    <select
                      value={calfSex}
                      onChange={(e) => setCalfSex(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                    >
                      <option value="Fêmea">Fêmea (♀)</option>
                      <option value="Macho">Macho (♂)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-700 dark:text-zinc-300 block mb-1">Peso ao Nascer (kg)</label>
                    <input
                      type="number"
                      value={calfWeight}
                      onChange={(e) => setCalfWeight(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-slate-700 dark:text-zinc-300 block mb-1">Observações</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Feto viável em corno direito com batimentos regulares"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                >
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
