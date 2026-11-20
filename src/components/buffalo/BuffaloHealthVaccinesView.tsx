import React, { useState } from 'react';
import { BuffaloAnimal, BuffaloHealthRecord } from '../../types/buffalo';
import { ShieldCheck, Plus, X } from 'lucide-react';

interface BuffaloHealthVaccinesViewProps {
  animals: BuffaloAnimal[];
  onUpdateAnimal: (animal: BuffaloAnimal) => void;
  onOpenDigitalTwin: (animalId: string) => void;
}

const inputCls =
  'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-teal-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const BuffaloHealthVaccinesView: React.FC<BuffaloHealthVaccinesViewProps> = ({
  animals,
  onUpdateAnimal,
  onOpenDigitalTwin
}) => {
  const [showModal, setShowModal] = useState(false);
  const [targetAnimalId, setTargetAnimalId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<BuffaloHealthRecord['type']>('Vacina');
  const [productName, setProductName] = useState('');
  const [dosage, setDosage] = useState('');
  const [route, setRoute] = useState<BuffaloHealthRecord['route']>('Subcutânea');
  const [milkWithdrawalDays, setMilkWithdrawalDays] = useState(0);
  const [meatWithdrawalDays, setMeatWithdrawalDays] = useState(0);
  const [veterinarian, setVeterinarian] = useState('');
  const [status, setStatus] = useState<BuffaloHealthRecord['status']>('Concluído');
  const [notes, setNotes] = useState('');

  const allRecords = animals
    .flatMap(a =>
      (a.healthRecords || []).map(r => ({
        ...r,
        animalId: a.id,
        animalNumber: a.identificationNumber,
        animalName: a.name
      }))
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const todayMs = new Date().setHours(0, 0, 0, 0);
  const animalsInWithdrawal = new Set(
    allRecords
      .filter(r => {
        const maxDays = Math.max(r.milkWithdrawalDays || 0, r.meatWithdrawalDays || 0);
        if (maxDays <= 0) return false;
        const recMs = new Date(`${r.date}T00:00:00`).getTime();
        return !Number.isNaN(recMs) && todayMs <= recMs + maxDays * 86400000;
      })
      .map(r => r.animalId)
  ).size;

  const vaccinesCount = allRecords.filter(r => r.type === 'Vacina').length;
  const activeTreatments = animals.filter(
    a => a.status === 'Tratamento Sanitário' || a.status === 'Quarentena'
  ).length;

  const openModal = () => {
    setTargetAnimalId(animals[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setType('Vacina');
    setProductName('');
    setDosage('5 mL');
    setRoute('Subcutânea');
    setMilkWithdrawalDays(0);
    setMeatWithdrawalDays(0);
    setVeterinarian('');
    setStatus('Concluído');
    setNotes('');
    setShowModal(true);
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const animal = animals.find(a => a.id === targetAnimalId);
    if (!animal || !productName.trim()) return;

    const record: BuffaloHealthRecord = {
      id: `hlth-${Date.now()}`,
      date,
      type,
      productName: productName.trim(),
      dosage: dosage.trim() || 'Conforme bula',
      route,
      milkWithdrawalDays: Number(milkWithdrawalDays) || 0,
      meatWithdrawalDays: Number(meatWithdrawalDays) || 0,
      veterinarian: veterinarian.trim() || 'Responsável Técnico',
      status,
      notes: notes.trim() || undefined
    };

    onUpdateAnimal({
      ...animal,
      healthRecords: [record, ...(animal.healthRecords || [])]
    });
    setShowModal(false);
  };

  const calendarItems = [
    {
      title: 'Brucelose (B19 ou RB51)',
      desc: 'Obrigatória para bezerras entre 3 e 8 meses com marcação oficial conforme PNCEBT.'
    },
    {
      title: 'Tuberculose Bubalina (TCC)',
      desc: 'Exame diagnóstico anual por Teste Cervical Comparado em animais acima de 24 meses.'
    },
    {
      title: 'Clostridioses & Piolho (Haematopinus)',
      desc: 'Vacinação anual polivalente contra clostridioses e controle pour-on estratégico na seca.'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Faixa unificada de KPIs */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Registros Sanitários
            </span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {allRecords.length}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {vaccinesCount} imunizações
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Animais em Carência
            </span>
            <div
              className={`text-xl font-semibold tabular-nums mt-0.5 ${
                animalsInWithdrawal > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {animalsInWithdrawal}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              {animalsInWithdrawal === 0 ? 'Leite apto para coleta' : 'Verificar descarte de leite'}
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
              Em Tratamento / Quarentena
            </span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {activeTreatments}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Monitoramento clínico</span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Programa PNCEBT</span>
            <div className="text-xl font-semibold text-teal-600 dark:text-teal-400 mt-0.5">Ativo</div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Brucelose e Tuberculose</span>
          </div>
        </div>
      </section>

      {/* Calendário Sanitário MAPA / ABCB */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Calendário Sanitário &amp; Protocolos Preventivos</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Diretrizes técnicas MAPA / ABCB para bubalinocultura
            </p>
          </div>
          <button
            type="button"
            disabled={animals.length === 0}
            onClick={openModal}
            className="h-8 px-3.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Manejo Sanitário</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {calendarItems.map(item => (
            <div
              key={item.title}
              className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 space-y-1"
            >
              <h3 className="text-xs font-semibold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Histórico de Ocorrências */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
          Histórico de Vacinas, Vermifugações &amp; Tratamentos ({allRecords.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="py-2 pr-3 font-medium">Data</th>
                <th className="py-2 px-3 font-medium">Animal</th>
                <th className="py-2 px-3 font-medium">Tipo</th>
                <th className="py-2 px-3 font-medium">Produto / Dose</th>
                <th className="py-2 px-3 font-medium text-right">Carência Leite</th>
                <th className="py-2 px-3 font-medium text-right">Carência Carne</th>
                <th className="py-2 pl-3 font-medium text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 tabular-nums">
              {allRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 dark:text-zinc-400">
                    Nenhum manejo sanitário registrado. Use o botão Registrar Manejo Sanitário para lançar vacinas ou tratamentos.
                  </td>
                </tr>
              ) : (
                allRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                    <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white">{rec.date}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900 dark:text-white">{rec.animalNumber}</span>
                      <span className="text-slate-500 dark:text-zinc-400"> · {rec.animalName}</span>
                    </td>
                    <td className="py-2.5 px-3 text-teal-600 dark:text-teal-400 font-medium">{rec.type}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-slate-800 dark:text-zinc-200">{rec.productName}</span>
                      <span className="text-slate-500 dark:text-zinc-400"> · {rec.dosage}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {rec.milkWithdrawalDays > 0 ? `${rec.milkWithdrawalDays} d` : 'Zero'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {rec.meatWithdrawalDays > 0 ? `${rec.meatWithdrawalDays} d` : 'Zero'}
                    </td>
                    <td className="py-2.5 pl-3 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenDigitalTwin(rec.animalId)}
                        className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 cursor-pointer"
                      >
                        Passaporte
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Novo Registro Sanitário */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Registrar Manejo Sanitário</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveRecord} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls}>Animal *</label>
                  <select
                    value={targetAnimalId}
                    onChange={(e) => setTargetAnimalId(e.target.value)}
                    className={inputCls}
                  >
                    {animals.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.identificationNumber} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Data</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls}>Tipo</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as BuffaloHealthRecord['type'])}
                    className={inputCls}
                  >
                    <option value="Vacina">Vacina</option>
                    <option value="Vermifugação">Vermifugação</option>
                    <option value="Ectoparasiticida">Ectoparasiticida</option>
                    <option value="Tratamento Clínico">Tratamento Clínico</option>
                    <option value="Exame Diagnóstico">Exame Diagnóstico</option>
                    <option value="Casqueamento">Casqueamento</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Via de Aplicação</label>
                  <select
                    value={route}
                    onChange={(e) => setRoute(e.target.value as BuffaloHealthRecord['route'])}
                    className={inputCls}
                  >
                    <option value="Subcutânea">Subcutânea</option>
                    <option value="Intramuscular">Intramuscular</option>
                    <option value="Pour-on">Pour-on</option>
                    <option value="Oral">Oral</option>
                    <option value="Intramamária">Intramamária</option>
                    <option value="Tópica">Tópica</option>
                    <option value="Intradérmica">Intradérmica</option>
                    <option value="Endovenosa">Endovenosa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls}>Produto / Vacina *</label>
                  <input
                    type="text"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Polivalente Clostridial"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Dose</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    placeholder="Ex: 5 mL"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className={labelCls}>Carência Leite (d)</label>
                  <input
                    type="number"
                    min="0"
                    value={milkWithdrawalDays}
                    onChange={(e) => setMilkWithdrawalDays(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Carência Carne (d)</label>
                  <input
                    type="number"
                    min="0"
                    value={meatWithdrawalDays}
                    onChange={(e) => setMeatWithdrawalDays(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BuffaloHealthRecord['status'])}
                    className={inputCls}
                  >
                    <option value="Concluído">Concluído</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Programado">Programado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls}>Veterinário / Responsável</label>
                  <input
                    type="text"
                    value={veterinarian}
                    onChange={(e) => setVeterinarian(e.target.value)}
                    placeholder="Nome ou CRMV"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Observações</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Lote ou observação clínica"
                    className={inputCls}
                  />
                </div>
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
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
