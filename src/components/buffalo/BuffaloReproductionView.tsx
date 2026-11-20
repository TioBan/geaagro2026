import React, { useState } from 'react';
import { BuffaloAnimal, BuffaloReproductionRecord } from '../../types/buffalo';
import { HeartPulse, Plus, X } from 'lucide-react';

interface BuffaloReproductionViewProps {
  animals: BuffaloAnimal[];
  onUpdateAnimal: (animal: BuffaloAnimal) => void;
  onOpenDigitalTwin: (animalId: string) => void;
}

const inputCls =
  'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-teal-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const BuffaloReproductionView: React.FC<BuffaloReproductionViewProps> = ({
  animals,
  onUpdateAnimal,
  onOpenDigitalTwin
}) => {
  const females = animals.filter(a => a.sex === 'Fêmea');
  const pregnant = females.filter(
    a =>
      a.status === 'Gestante' ||
      (a.reproductionRecords &&
        a.reproductionRecords.length > 0 &&
        a.reproductionRecords[a.reproductionRecords.length - 1]?.dgResult === 'Positivo (Gestante)')
  );

  const femalesWithIEP = females.filter(a => a.calvingIntervalDays && a.calvingIntervalDays > 0);
  const avgIEP = femalesWithIEP.length > 0
    ? Math.round(femalesWithIEP.reduce((acc, a) => acc + (a.calvingIntervalDays || 0), 0) / femalesWithIEP.length)
    : 0;
  const pregnancyRate = females.length > 0 ? Math.round((pregnant.length / females.length) * 100) : 0;

  const [showModal, setShowModal] = useState(false);
  const [selectedFemaleId, setSelectedFemaleId] = useState<string>('');
  const [eventType, setEventType] = useState<BuffaloReproductionRecord['eventType']>('Protocolo IATF');
  const [eventDate, setEventDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bullSemen, setBullSemen] = useState('');
  const [protocolName, setProtocolName] = useState('Ovsynch Bubalino + eCG 400 UI');
  const [dgResult, setDgResult] = useState<NonNullable<BuffaloReproductionRecord['dgResult']>>('Positivo (Gestante)');
  const [expectedCalvingDate, setExpectedCalvingDate] = useState('');
  const [calvingType, setCalvingType] = useState<NonNullable<BuffaloReproductionRecord['calvingType']>>('Eutócico (Normal)');
  const [calfSex, setCalfSex] = useState<'Fêmea' | 'Macho'>('Fêmea');
  const [calfWeight, setCalfWeight] = useState(38);
  const [notes, setNotes] = useState('');

  const handleOpenModal = () => {
    setSelectedFemaleId(females[0]?.id || '');
    setEventType('Protocolo IATF');
    setEventDate(new Date().toISOString().split('T')[0]);
    setBullSemen('');
    setProtocolName('Ovsynch Bubalino + eCG 400 UI');
    setDgResult('Positivo (Gestante)');
    setExpectedCalvingDate('');
    setCalvingType('Eutócico (Normal)');
    setCalfSex('Fêmea');
    setCalfWeight(38);
    setNotes('');
    setShowModal(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCow = animals.find(a => a.id === selectedFemaleId);
    if (!targetCow) return;

    const isService =
      eventType === 'Protocolo IATF' ||
      eventType === 'Inseminação Artificial (IA)' ||
      eventType === 'Cobertura Natural';

    const newRecord: BuffaloReproductionRecord = {
      id: `rep-${Date.now()}`,
      date: eventDate,
      eventType,
      bullOrSemenCode: isService ? bullSemen.trim() || undefined : undefined,
      protocolName: eventType === 'Protocolo IATF' ? protocolName.trim() || undefined : undefined,
      dgResult: eventType === 'Diagnóstico de Gestação (DG)' ? dgResult : undefined,
      expectedCalvingDate:
        eventType === 'Diagnóstico de Gestação (DG)' && dgResult === 'Positivo (Gestante)' && expectedCalvingDate
          ? expectedCalvingDate
          : undefined,
      calvingType: eventType === 'Parto' ? calvingType : undefined,
      calfSex: eventType === 'Parto' ? calfSex : undefined,
      calfBirthWeightKg: eventType === 'Parto' ? Number(calfWeight) : undefined,
      notes: notes.trim() || undefined
    };

    let newStatus = targetCow.status;
    let nextParity = targetCow.parityCount || 0;
    let nextExpected = targetCow.expectedCalvingDate;

    if (eventType === 'Diagnóstico de Gestação (DG)' && dgResult === 'Positivo (Gestante)') {
      newStatus = 'Gestante';
      if (expectedCalvingDate) nextExpected = expectedCalvingDate;
    } else if (eventType === 'Protocolo IATF' || eventType === 'Inseminação Artificial (IA)') {
      newStatus = 'Inseminada';
    } else if (eventType === 'Parto') {
      newStatus = 'Em Lactação';
      nextParity += 1;
      nextExpected = undefined;
    } else if (eventType === 'Secagem') {
      newStatus = 'Seca';
    }

    onUpdateAnimal({
      ...targetCow,
      status: newStatus,
      parityCount: nextParity,
      expectedCalvingDate: nextExpected,
      lastCalvingDate: eventType === 'Parto' ? eventDate : targetCow.lastCalvingDate,
      lastInseminationDate: isService ? eventDate : targetCow.lastInseminationDate,
      reproductionRecords: [...(targetCow.reproductionRecords || []), newRecord]
    });
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Faixa de KPIs */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Fêmeas Aptas</span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">{females.length}</div>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 tabular-nums">
              {pregnant.length} gestantes confirmadas
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Taxa de Prenhez</span>
            <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              {pregnancyRate}%
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Meta técnica &gt; 80%</span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">IEP Médio</span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {avgIEP > 0 ? `${avgIEP} dias` : '—'}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {avgIEP > 0 ? `${(avgIEP / 30).toFixed(1)} meses` : 'Sem histórico de partos'}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Gestação Bubalina</span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">310 dias</div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Média ~10 meses e 10 dias</span>
          </div>
        </div>
      </section>

      {/* Protocolo IATF + Botão Lançar */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Protocolos IATF &amp; Estação de Monta</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Superação do anestro estacional bubalino com eCG (400 UI)
            </p>
          </div>
          <button
            type="button"
            disabled={females.length === 0}
            onClick={handleOpenModal}
            className="h-8 px-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lançar Evento Reprodutivo</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-zinc-300 pt-2.5 border-t border-slate-100 dark:border-zinc-800 leading-relaxed">
          <strong className="text-slate-800 dark:text-zinc-200">Referência Ovsynch Bubalino:</strong> D0 implante de
          progesterona + 2,0 mg benzoato de estradiol · D8 retirada + PGF2α + 400 UI eCG · D10 IATF 16h após GnRH.
        </p>
      </section>

      {/* Lista de Fêmeas */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Status Reprodutivo por Matriz</h3>

        {females.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400 py-8 text-center">
            Nenhuma fêmea cadastrada no rebanho. Cadastre matrizes ou novilhas na aba Cadastro.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {females.map(cow => {
              const records = cow.reproductionRecords || [];
              const lastRepro = records[records.length - 1];
              return (
                <div
                  key={cow.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                        {cow.identificationNumber}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">{cow.name}</span>
                      <span className="text-slate-300 dark:text-zinc-700">·</span>
                      <span className="font-medium text-teal-600 dark:text-teal-400">{cow.status}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      Partos: {cow.parityCount || 0}
                      {cow.calvingIntervalDays ? ` · IEP: ${cow.calvingIntervalDays} dias` : ''}
                      {cow.expectedCalvingDate ? ` · Prev. parto: ${cow.expectedCalvingDate}` : ''}
                    </p>
                    {lastRepro && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Último evento: <strong className="text-slate-700 dark:text-zinc-300">{lastRepro.eventType}</strong>{' '}
                        ({lastRepro.date})
                        {lastRepro.dgResult ? ` · ${lastRepro.dgResult}` : ''}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenDigitalTwin(cow.id)}
                    className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 cursor-pointer self-start sm:self-auto shrink-0 transition-colors"
                  >
                    Abrir Ficha
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Lançamento Reprodutivo */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Lançar Evento Reprodutivo</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className={labelCls}>Matriz / Novilha *</label>
                <select
                  value={selectedFemaleId}
                  onChange={(e) => setSelectedFemaleId(e.target.value)}
                  className={inputCls}
                >
                  {females.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.identificationNumber} - {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls}>Tipo de Evento</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as BuffaloReproductionRecord['eventType'])}
                    className={inputCls}
                  >
                    <option value="Protocolo IATF">Protocolo IATF</option>
                    <option value="Inseminação Artificial (IA)">Inseminação Artificial (IA)</option>
                    <option value="Cobertura Natural">Cobertura Natural</option>
                    <option value="Diagnóstico de Gestação (DG)">Diagnóstico de Gestação (DG)</option>
                    <option value="Parto">Parto</option>
                    <option value="Secagem">Secagem</option>
                    <option value="Aborto">Aborto</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Data</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {(eventType === 'Protocolo IATF' ||
                eventType === 'Inseminação Artificial (IA)' ||
                eventType === 'Cobertura Natural') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className={labelCls}>Touro / Código do Sêmen</label>
                    <input
                      type="text"
                      value={bullSemen}
                      onChange={(e) => setBullSemen(e.target.value)}
                      placeholder="Ex: Murrah PO - Lote 14"
                      className={inputCls}
                    />
                  </div>
                  {eventType === 'Protocolo IATF' && (
                    <div>
                      <label className={labelCls}>Protocolo</label>
                      <input
                        type="text"
                        value={protocolName}
                        onChange={(e) => setProtocolName(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  )}
                </div>
              )}

              {eventType === 'Diagnóstico de Gestação (DG)' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className={labelCls}>Resultado do DG</label>
                    <select
                      value={dgResult}
                      onChange={(e) =>
                        setDgResult(e.target.value as NonNullable<BuffaloReproductionRecord['dgResult']>)
                      }
                      className={inputCls}
                    >
                      <option value="Positivo (Gestante)">Positivo (Gestante)</option>
                      <option value="Negativo (Vazia)">Negativo (Vazia)</option>
                      <option value="Dúvidoso">Duvidoso / Reexaminar</option>
                    </select>
                  </div>
                  {dgResult === 'Positivo (Gestante)' && (
                    <div>
                      <label className={labelCls}>Previsão de Parto</label>
                      <input
                        type="date"
                        value={expectedCalvingDate}
                        onChange={(e) => setExpectedCalvingDate(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  )}
                </div>
              )}

              {eventType === 'Parto' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className={labelCls}>Tipo de Parto</label>
                    <select
                      value={calvingType}
                      onChange={(e) =>
                        setCalvingType(e.target.value as NonNullable<BuffaloReproductionRecord['calvingType']>)
                      }
                      className={inputCls}
                    >
                      <option value="Eutócico (Normal)">Eutócico (Normal)</option>
                      <option value="Distócico Leve">Distócico Leve</option>
                      <option value="Distócico Cirúrgico">Distócico Cirúrgico</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Sexo do Bezerro</label>
                    <select
                      value={calfSex}
                      onChange={(e) => setCalfSex(e.target.value as 'Fêmea' | 'Macho')}
                      className={inputCls}
                    >
                      <option value="Fêmea">Fêmea</option>
                      <option value="Macho">Macho</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Peso Nascer (kg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={calfWeight}
                      onChange={(e) => setCalfWeight(Number(e.target.value))}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={labelCls}>Observações</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Feto viável em corno direito"
                  className={inputCls}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium cursor-pointer"
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
