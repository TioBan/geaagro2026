import React, { useState, useMemo } from 'react';
import { Activity, Plus, X } from 'lucide-react';
import { EquineAnimal, EquineDentalRecord } from '../../types/equine';

interface Props {
  animals: EquineAnimal[];
  dentalRecords: EquineDentalRecord[];
  onAddDental: (record: EquineDentalRecord) => void;
}

const DENTAL_PROCEDURES = [
  'Flutuação / Nivelamento Elétrico',
  'Extração de Dente de Lobo (105/205)',
  'Correção de Ganchos / Rampas',
  'Redução de Incisivos',
  'Tratamento Periodontal / Diastema',
];

const inputCls =
  'w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const EquineDentalView: React.FC<Props> = ({
  animals,
  dentalRecords,
  onAddDental,
}) => {
  const safeAnimals = useMemo(() => (animals || []).filter(a => a && a.id), [animals]);
  const safeRecords = useMemo(() => (dentalRecords || []).filter(d => d && d.id), [dentalRecords]);

  const [selectedAnimalFilter, setSelectedAnimalFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<EquineDentalRecord>>({
    animalId: safeAnimals[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    veterinarian: '',
    wearGrade: 'Pontas de Esmalte Leves',
    proceduresPerformed: ['Flutuação / Nivelamento Elétrico'],
    malocclusionsFound: '',
    nextReviewDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    costBrl: 450,
    notes: '',
  });

  const toggleProcedure = (proc: string) => {
    const current = formData.proceduresPerformed || [];
    const next = current.includes(proc)
      ? current.filter(p => p !== proc)
      : [...current, proc];
    setFormData({ ...formData, proceduresPerformed: next });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = formData.animalId || safeAnimals[0]?.id;
    if (!targetId) return;

    const newRecord: EquineDentalRecord = {
      id: `dnt-${Date.now()}`,
      animalId: targetId,
      date: formData.date || new Date().toISOString().split('T')[0],
      veterinarian: formData.veterinarian?.trim() || 'Odontólogo Equino',
      wearGrade: (formData.wearGrade as EquineDentalRecord['wearGrade']) || 'Normal / Fisiológico',
      proceduresPerformed: formData.proceduresPerformed || [],
      malocclusionsFound: formData.malocclusionsFound || '',
      nextReviewDate:
        formData.nextReviewDate ||
        new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      costBrl: Number(formData.costBrl) || 0,
      notes: formData.notes || '',
    };

    onAddDental(newRecord);
    setIsModalOpen(false);
  };

  const filteredRecords = safeRecords.filter(
    d => selectedAnimalFilter === 'all' || d.animalId === selectedAnimalFilter
  );

  const severeCount = safeRecords.filter(
    d =>
      d.wearGrade === 'Pontas de Esmalte Severas' ||
      d.wearGrade === 'Severo' ||
      d.wearGrade === 'Onda / Degrau' ||
      d.wearGrade === 'Boca em Tesoura'
  ).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Odontologia Equina</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Flutuações elétricas, extrações de dentes de lobo, correção de oclusão e revisões periódicas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedAnimalFilter}
            onChange={e => setSelectedAnimalFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os cavalos</option>
            {safeAnimals.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Atendimento</span>
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Atendimentos</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              {safeRecords.length}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Casos de Desgaste Severo</span>
            <span className="mt-1 text-lg font-semibold text-amber-700 dark:text-amber-400 tabular-nums block">
              {severeCount}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Ciclo Recomendado</span>
            <span className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums block">
              6 meses
            </span>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum atendimento odontológico registrado.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-zinc-800">
            {filteredRecords.map(rec => {
              const animal = safeAnimals.find(a => a.id === rec.animalId);
              const nextDateStr = rec.nextReviewDate || rec.nextRevisionDate;
              const findingsText = rec.malocclusionsFound || rec.findings;

              return (
                <div key={rec.id} className="p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Activity className="w-4 h-4 mt-0.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                          {animal?.name || 'Animal'} — {rec.wearGrade}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                          {new Date(rec.date).toLocaleDateString('pt-BR')} · Vet: {rec.veterinarian}
                          {rec.costBrl ? ` · R$ ${rec.costBrl.toFixed(2)}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-zinc-300 shrink-0 tabular-nums">
                      Próxima revisão:{' '}
                      <strong className="text-slate-900 dark:text-zinc-100">
                        {nextDateStr ? new Date(nextDateStr).toLocaleDateString('pt-BR') : 'Semestral'}
                      </strong>
                    </div>
                  </div>

                  {(rec.proceduresPerformed || []).length > 0 && (
                    <div className="pl-6.5 text-xs text-slate-700 dark:text-zinc-300">
                      <span className="text-slate-500 dark:text-zinc-400">Procedimentos: </span>
                      {rec.proceduresPerformed.join(' · ')}
                    </div>
                  )}

                  {(findingsText || rec.notes) && (
                    <div className="pl-6.5 text-xs text-slate-600 dark:text-zinc-400 space-y-0.5">
                      {findingsText && <div>Achados: {findingsText}</div>}
                      {rec.notes && <div>{rec.notes}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: New Dental Record */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Registrar Atendimento Odontológico
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Animal *</label>
                  <select
                    value={formData.animalId || safeAnimals[0]?.id || ''}
                    onChange={e => setFormData({ ...formData, animalId: e.target.value })}
                    className={inputCls}
                  >
                    {safeAnimals.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Data do Atendimento</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Próxima Revisão</label>
                  <input
                    type="date"
                    value={formData.nextReviewDate}
                    onChange={e => setFormData({ ...formData, nextReviewDate: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Grau de Desgaste / Oclusão</label>
                  <select
                    value={formData.wearGrade}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        wearGrade: e.target.value as EquineDentalRecord['wearGrade'],
                      })
                    }
                    className={inputCls}
                  >
                    <option value="Normal / Fisiológico">Normal / Fisiológico</option>
                    <option value="Pontas de Esmalte Leves">Pontas de Esmalte Leves</option>
                    <option value="Pontas de Esmalte Severas">Pontas de Esmalte Severas</option>
                    <option value="Onda / Degrau">Onda / Degrau</option>
                    <option value="Boca em Tesoura">Boca em Tesoura</option>
                    <option value="Gancho Rostral/Caudal">Gancho Rostral/Caudal</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Veterinário / Odontólogo</label>
                  <input
                    type="text"
                    value={formData.veterinarian || ''}
                    onChange={e => setFormData({ ...formData, veterinarian: e.target.value })}
                    placeholder="Nome / CRMV"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Procedimentos Realizados</label>
                <div className="space-y-1.5 pt-0.5">
                  {DENTAL_PROCEDURES.map(proc => {
                    const checked = (formData.proceduresPerformed || []).includes(proc);
                    return (
                      <label key={proc} className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProcedure(proc)}
                          className="rounded accent-emerald-600"
                        />
                        <span>{proc}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelCls}>Achados Clínicos / Observações</label>
                <textarea
                  rows={2}
                  value={formData.malocclusionsFound || ''}
                  onChange={e => setFormData({ ...formData, malocclusionsFound: e.target.value })}
                  placeholder="Pontas vestibulares, úlceras jugais, aceitação de embocadura..."
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Atendimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
