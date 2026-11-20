import React, { useState, useMemo } from 'react';
import { Hammer, Plus, X } from 'lucide-react';
import { EquineAnimal, EquineFarrieryRecord, HorseshoeType } from '../../types/equine';

interface Props {
  animals: EquineAnimal[];
  farrieryRecords: EquineFarrieryRecord[];
  onAddFarriery: (record: EquineFarrieryRecord) => void;
}

const HORSESHOE_OPTIONS: HorseshoeType[] = [
  'Ferradura de Aço Convencional',
  'Ferradura de Alumínio (Esporte/Corrida)',
  'Ferradura Polo / Fina',
  'Ferradura Corretiva Heart-bar (Barra Coração)',
  'Ferradura Banana / Rocked Toe',
  'Ferradura Rolada (Roller Shoe)',
  'Ferradura com Tala e Rampa',
  'Casqueamento Descalço (Barefoot)',
  'Ferradura de Poliuretano / Borracha',
  'Palmilha de Absorção de Impacto',
];

const inputCls =
  'w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const EquineFarrieryView: React.FC<Props> = ({
  animals,
  farrieryRecords,
  onAddFarriery,
}) => {
  const safeAnimals = useMemo(() => (animals || []).filter(a => a && a.id), [animals]);
  const safeRecords = useMemo(() => (farrieryRecords || []).filter(f => f && f.id), [farrieryRecords]);

  const [selectedAnimalFilter, setSelectedAnimalFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<EquineFarrieryRecord>>({
    animalId: safeAnimals[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    farrierName: '',
    horseshoeType: 'Ferradura de Aço Convencional',
    material: 'Aço',
    frontHoofAngleDegrees: 51,
    hindHoofAngleDegrees: 54,
    hoofCondition: 'Excelente',
    intervalDays: 40,
    correctiveShoeing: false,
    correctionsMade: '',
    costBrl: 380,
    notes: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = formData.animalId || safeAnimals[0]?.id;
    if (!targetId) return;

    const baseDate = new Date(formData.date || new Date());
    const interval = Number(formData.intervalDays) || 40;
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + interval);

    const newRecord: EquineFarrieryRecord = {
      id: `far-${Date.now()}`,
      animalId: targetId,
      date: formData.date || new Date().toISOString().split('T')[0],
      farrierName: formData.farrierName?.trim() || 'Ferrador Responsável',
      horseshoeType: formData.horseshoeType || 'Ferradura de Aço Convencional',
      material: formData.material || 'Aço',
      frontHoofAngleDegrees: formData.frontHoofAngleDegrees ? Number(formData.frontHoofAngleDegrees) : undefined,
      hindHoofAngleDegrees: formData.hindHoofAngleDegrees ? Number(formData.hindHoofAngleDegrees) : undefined,
      intervalDays: interval,
      correctiveShoeing: Boolean(formData.correctiveShoeing),
      correctionsMade: formData.correctionsMade || '',
      nextShoeingDate: nextDate.toISOString().split('T')[0],
      costBrl: Number(formData.costBrl) || 0,
      hoofCondition: formData.hoofCondition || 'Excelente',
      notes: formData.notes || '',
    };

    onAddFarriery(newRecord);
    setIsModalOpen(false);
  };

  const filteredRecords = safeRecords.filter(
    f => selectedAnimalFilter === 'all' || f.animalId === selectedAnimalFilter
  );

  const avgFrontAngle = useMemo(() => {
    const withAngle = safeRecords.filter(r => typeof r.frontHoofAngleDegrees === 'number');
    if (withAngle.length === 0) return null;
    return withAngle.reduce((s, r) => s + (r.frontHoofAngleDegrees || 0), 0) / withAngle.length;
  }, [safeRecords]);

  const avgCycleDays = useMemo(() => {
    const withInterval = safeRecords.filter(r => typeof r.intervalDays === 'number' && r.intervalDays > 0);
    if (withInterval.length === 0) return 40;
    return Math.round(withInterval.reduce((s, r) => s + (r.intervalDays || 40), 0) / withInterval.length);
  }, [safeRecords]);

  const correctiveCount = safeRecords.filter(
    f => f.correctiveShoeing || f.horseshoeType.includes('Corretiva') || f.horseshoeType.includes('Heart-bar')
  ).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Hammer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Podologia, Casqueamento & Ferrageamento</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Ciclos de troca de ferraduras, angulação podal, ferrageamento corretivo e histórico por animal
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
            <span>Novo Ferrageamento</span>
          </button>
        </div>
      </div>

      {/* Hairline KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Ciclo Médio</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              {avgCycleDays} dias
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Ferrageamentos</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              {safeRecords.length}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Corretivos / Ortopédicos</span>
            <span className="mt-1 text-lg font-semibold text-amber-700 dark:text-amber-400 tabular-nums block">
              {correctiveCount}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Ângulo Médio Ant.</span>
            <span className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums block">
              {avgFrontAngle !== null ? `${avgFrontAngle.toFixed(1)}°` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum registro de ferrageamento ou casqueamento cadastrado.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-zinc-800">
            {filteredRecords.map(record => {
              const animal = safeAnimals.find(a => a.id === record.animalId);
              const nextDateStr = record.nextShoeingDate || record.nextDueDate;

              return (
                <div key={record.id} className="p-4 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Hammer className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                          {animal?.name || 'Animal'} — {record.horseshoeType}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                          {new Date(record.date).toLocaleDateString('pt-BR')} · Ferrador: {record.farrierName}
                          {record.costBrl > 0 ? ` · R$ ${record.costBrl.toFixed(2)}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      {record.correctiveShoeing && (
                        <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                          Ortopédico / Corretivo
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                        Casco: {record.hoofCondition}
                      </span>
                    </div>
                  </div>

                  <div className="pl-6.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Ângulo Anterior</span>
                      <span className="font-medium text-slate-900 dark:text-zinc-100">
                        {record.frontHoofAngleDegrees ? `${record.frontHoofAngleDegrees}°` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Ângulo Posterior</span>
                      <span className="font-medium text-slate-900 dark:text-zinc-100">
                        {record.hindHoofAngleDegrees ? `${record.hindHoofAngleDegrees}°` : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Próxima Troca</span>
                      <span className="font-medium text-slate-900 dark:text-zinc-100">
                        {nextDateStr ? new Date(nextDateStr).toLocaleDateString('pt-BR') : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Intervalo</span>
                      <span className="font-medium text-slate-900 dark:text-zinc-100">
                        {record.intervalDays ? `${record.intervalDays} dias` : 'Padrão'}
                      </span>
                    </div>
                  </div>

                  {(record.correctionsMade || record.notes) && (
                    <div className="pl-6.5 text-xs text-slate-600 dark:text-zinc-400">
                      {record.correctionsMade && <div>Correções: {record.correctionsMade}</div>}
                      {record.notes && <div>{record.notes}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: New Farriery Record */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Registrar Ferrageamento / Casqueamento
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
                      <option key={a.id} value={a.id}>{a.name} ({a.breed})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Data do Serviço</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Ferrador / Podólogo</label>
                  <input
                    type="text"
                    value={formData.farrierName || ''}
                    onChange={e => setFormData({ ...formData, farrierName: e.target.value })}
                    placeholder="Nome do profissional"
                    className={inputCls}
                  />
                </div>

                <div className="col-span-2">
                  <label className={labelCls}>Tipo de Ferradura / Serviço</label>
                  <select
                    value={formData.horseshoeType}
                    onChange={e => setFormData({ ...formData, horseshoeType: e.target.value as HorseshoeType })}
                    className={inputCls}
                  >
                    {HORSESHOE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Ângulo Anterior (°)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.frontHoofAngleDegrees ?? ''}
                    onChange={e => setFormData({ ...formData, frontHoofAngleDegrees: Number(e.target.value) || undefined })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Ângulo Posterior (°)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.hindHoofAngleDegrees ?? ''}
                    onChange={e => setFormData({ ...formData, hindHoofAngleDegrees: Number(e.target.value) || undefined })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Condição do Casco</label>
                  <select
                    value={formData.hoofCondition}
                    onChange={e => setFormData({ ...formData, hoofCondition: e.target.value as EquineFarrieryRecord['hoofCondition'] })}
                    className={inputCls}
                  >
                    <option value="Excelente">Excelente</option>
                    <option value="Bom">Bom</option>
                    <option value="Quebradiço">Quebradiço</option>
                    <option value="Broca / Pododermatite">Broca / Pododermatite</option>
                    <option value="Sensível / Laminite Prévia">Sensível / Laminite Prévia</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Próximo Ciclo (dias)</label>
                  <input
                    type="number"
                    value={formData.intervalDays ?? 40}
                    onChange={e => setFormData({ ...formData, intervalDays: Number(e.target.value) || 40 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={labelCls}>Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costBrl ?? 0}
                    onChange={e => setFormData({ ...formData, costBrl: Number(e.target.value) || 0 })}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div className="flex items-end pb-1.5">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.correctiveShoeing)}
                      onChange={e => setFormData({ ...formData, correctiveShoeing: e.target.checked })}
                      className="rounded accent-emerald-600"
                    />
                    <span>Ferrageamento ortopédico</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Correções & Observações</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Aprumos, talões, uso de palmilha, sensibilidade..."
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
