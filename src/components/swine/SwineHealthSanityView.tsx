import React, { useMemo, useState } from 'react';
import { ShieldCheck, Plus, X } from 'lucide-react';
import { SwineAnimal, SwineHealthRecord } from '../../types/swine';
import {
  SWINE_CARD_CLASS,
  SWINE_INPUT_CLASS,
  SWINE_LABEL_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SECONDARY_BTN_CLASS,
  formatBrDate,
  getTodayIsoDate,
  useEscapeClose,
} from './swineUi';

interface SwineHealthSanityViewProps {
  animals: SwineAnimal[];
  onAddHealthRecordToAnimal: (animalId: string, record: SwineHealthRecord) => void;
}

const HEALTH_TYPES: SwineHealthRecord['type'][] = [
  'Vacina',
  'Vermifugação',
  'Antibiótico',
  'Anti-inflamatório',
  'Ferro Dextrano',
  'Cura de Umbigo',
  'Desgaste de Dentes/Cauda',
  'Outro',
];

const HEALTH_ROUTES: SwineHealthRecord['route'][] = [
  'Intramuscular',
  'Subcutânea',
  'Oral',
  'Tópica',
  'Na Água',
  'Na Ração',
];

export const SwineHealthSanityView: React.FC<SwineHealthSanityViewProps> = ({
  animals,
  onAddHealthRecordToAnimal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [selectedAnimalId, setSelectedAnimalId] = useState(animals[0]?.id || '');
  const [healthType, setHealthType] = useState<SwineHealthRecord['type']>('Vacina');
  const [productName, setProductName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [dosage, setDosage] = useState('2,0 mL');
  const [route, setRoute] = useState<SwineHealthRecord['route']>('Intramuscular');
  const [withdrawalDays, setWithdrawalDays] = useState(0);
  const [vetName, setVetName] = useState('');
  const [notes, setNotes] = useState('');

  useEscapeClose(isModalOpen, () => setIsModalOpen(false));

  const allLogs = useMemo(() => {
    const list: { animalCode: string; animalId: string; record: SwineHealthRecord }[] = [];
    animals.forEach(a => {
      (a.healthHistory || []).forEach(h => {
        list.push({ animalCode: a.code, animalId: a.id, record: h });
      });
    });
    return list.sort(
      (a, b) => new Date(b.record.date).getTime() - new Date(a.record.date).getTime()
    );
  }, [animals]);

  const activeWithdrawals = useMemo(() => {
    const now = Date.now();
    return allLogs.filter(l => {
      if (!l.record.withdrawalDays || l.record.withdrawalDays <= 0) return false;
      const endTime = new Date(l.record.date).getTime() + l.record.withdrawalDays * 86400000;
      return Number.isFinite(endTime) && now < endTime;
    });
  }, [allLogs]);

  const vaccineCount = useMemo(
    () => allLogs.filter(l => l.record.type === 'Vacina').length,
    [allLogs]
  );

  const completedPct = useMemo(() => {
    if (allLogs.length === 0) return '—';
    const done = allLogs.filter(l => l.record.status === 'Concluído').length;
    return `${Math.round((done / allLogs.length) * 100)}%`;
  }, [allLogs]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = selectedAnimalId || animals[0]?.id;
    if (!targetId || !productName.trim()) return;

    const newRecord: SwineHealthRecord = {
      id: `hlth_${Date.now()}`,
      date: getTodayIsoDate(),
      type: healthType,
      productName: productName.trim(),
      activeIngredient: activeIngredient.trim() || undefined,
      dosage: dosage.trim() || 'Conforme bula',
      route,
      withdrawalDays: Math.max(0, Number(withdrawalDays) || 0),
      veterinarianOrOperator: vetName.trim() || 'Responsável Técnico',
      status: 'Concluído',
      notes: notes.trim() || undefined,
    };

    onAddHealthRecordToAnimal(targetId, newRecord);
    setProductName('');
    setActiveIngredient('');
    setNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Sanidade Suína, Vacinômetro & Carência</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Registro de vacinas, tratamentos veterinários e controle de período de carência para abate.
          </p>
        </div>

        <button
          type="button"
          disabled={animals.length === 0}
          onClick={() => {
            if (!selectedAnimalId && animals[0]) setSelectedAnimalId(animals[0].id);
            setIsModalOpen(true);
          }}
          className={`${SWINE_PRIMARY_BTN_CLASS} shrink-0`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Manejo Sanitário</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Total de Aplicações
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
            {allLogs.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">registros no plantel</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Em Período de Carência
          </span>
          <div
            className={`text-xl font-bold mt-0.5 tabular-nums ${
              activeWithdrawals.length > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {activeWithdrawals.length}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            {activeWithdrawals.length > 0 ? 'bloqueados p/ abate' : 'nenhum bloqueio ativo'}
          </span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Manejos Concluídos
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">
            {completedPct}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">execução sanitária</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Vacinas Aplicadas
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">
            {vaccineCount}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">doses registradas</span>
        </div>
      </div>

      {/* Table */}
      <div className={`${SWINE_CARD_CLASS} overflow-hidden`}>
        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
            Livro de Registro Sanitário
          </h3>
          <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
            {allLogs.length} registro(s)
          </span>
        </div>

        {allLogs.length === 0 ? (
          <div className="p-10 text-center space-y-1.5">
            <ShieldCheck className="w-7 h-7 text-slate-400 dark:text-zinc-500 mx-auto" />
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              {animals.length === 0
                ? 'Cadastre animais no Plantel Individual para registrar manejos sanitários.'
                : 'Nenhum manejo sanitário registrado ainda.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-medium">
                <tr>
                  <th className="px-3.5 py-2.5">Data</th>
                  <th className="px-3.5 py-2.5">Animal</th>
                  <th className="px-3.5 py-2.5">Tipo</th>
                  <th className="px-3.5 py-2.5">Produto</th>
                  <th className="px-3.5 py-2.5">Dose / Via</th>
                  <th className="px-3.5 py-2.5">Carência</th>
                  <th className="px-3.5 py-2.5">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {allLogs.map(item => (
                  <tr
                    key={`${item.animalId}_${item.record.id}`}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-3.5 py-2.5 text-slate-700 dark:text-zinc-300 tabular-nums">
                      {formatBrDate(item.record.date)}
                    </td>
                    <td className="px-3.5 py-2.5 font-semibold text-rose-600 dark:text-rose-400">
                      {item.animalCode}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[10px] font-medium text-slate-700 dark:text-zinc-300">
                        {item.record.type}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-medium text-slate-900 dark:text-zinc-100">
                      {item.record.productName}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600 dark:text-zinc-400">
                      {item.record.dosage} ({item.record.route})
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                          item.record.withdrawalDays === 0
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {item.record.withdrawalDays === 0
                          ? 'Zero'
                          : `${item.record.withdrawalDays} dias`}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600 dark:text-zinc-400">
                      {item.record.veterinarianOrOperator}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Registrar Aplicação Sanitária
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className={SWINE_LABEL_CLASS}>Suíno / Matriz *</label>
                <select
                  value={selectedAnimalId || animals[0]?.id || ''}
                  onChange={e => setSelectedAnimalId(e.target.value)}
                  className={SWINE_INPUT_CLASS}
                >
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {a.breed} ({a.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Tipo de Manejo</label>
                  <select
                    value={healthType}
                    onChange={e => setHealthType(e.target.value as SwineHealthRecord['type'])}
                    className={SWINE_INPUT_CLASS}
                  >
                    {HEALTH_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={SWINE_LABEL_CLASS}>Via de Aplicação</label>
                  <select
                    value={route}
                    onChange={e => setRoute(e.target.value as SwineHealthRecord['route'])}
                    className={SWINE_INPUT_CLASS}
                  >
                    {HEALTH_ROUTES.map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Produto / Vacina *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Vacina PCV2 + Mycoplasma"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Princípio Ativo</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={activeIngredient}
                    onChange={e => setActiveIngredient(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Dose Aplicada</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Carência Carne (dias)</label>
                  <input
                    type="number"
                    min="0"
                    value={withdrawalDays}
                    onChange={e => setWithdrawalDays(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Veterinário / Aplicador</label>
                  <input
                    type="text"
                    placeholder="Nome / CRMV"
                    value={vetName}
                    onChange={e => setVetName(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Observações</label>
                  <input
                    type="text"
                    placeholder="Opcional"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={SWINE_SECONDARY_BTN_CLASS}
                >
                  Cancelar
                </button>
                <button type="submit" className={SWINE_PRIMARY_BTN_CLASS}>
                  Salvar Aplicação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
