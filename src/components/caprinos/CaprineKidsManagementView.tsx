import React, { useState } from 'react';
import { CaprineAnimal, CaprineKidRecord } from '../../types/caprine';
import { Baby, Plus, X } from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  kidRecords: CaprineKidRecord[];
  onSaveKid: (kid: CaprineKidRecord) => void;
}

export const CaprineKidsManagementView: React.FC<Props> = ({
  animals,
  kidRecords,
  onSaveKid
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [newKid, setNewKid] = useState<Partial<CaprineKidRecord>>({});

  const mothers = animals.filter(a => a.sex === 'Fêmea');

  const totalKids = kidRecords.length;
  const colostrumSuccessRate =
    totalKids > 0
      ? Math.round((kidRecords.filter(k => k.colostrumHours <= 2).length / totalKids) * 100)
      : 0;
  const avgGmdKids =
    totalKids > 0
      ? Math.round(kidRecords.reduce((acc, curr) => acc + curr.gmdGramsDay, 0) / totalKids)
      : 0;
  const mortalityRate =
    totalKids > 0
      ? ((kidRecords.filter(k => k.status === 'Óbito').length / totalKids) * 100).toFixed(1)
      : '0.0';

  const handleOpenModal = () => {
    setFormError('');
    setNewKid({
      id: `kid-${Date.now()}`,
      earTag: `CAP-${kidRecords.length + 201}`,
      name: '',
      motherId: mothers[0]?.id || '',
      birthDate: new Date().toISOString().split('T')[0],
      birthWeightKg: 3.5,
      colostrumHours: 1.5,
      colostrumStatus: 'Excelente (<2h)',
      gmdGramsDay: 200,
      status: 'Em Amamentação'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKid.name?.trim() || !newKid.motherId) {
      setFormError('Preencha o nome do cabrito e selecione a matriz.');
      return;
    }
    onSaveKid({
      id: newKid.id || `kid-${Date.now()}`,
      earTag: newKid.earTag || `CAP-${kidRecords.length + 201}`,
      name: newKid.name.trim(),
      motherId: newKid.motherId,
      birthDate: newKid.birthDate || new Date().toISOString().split('T')[0],
      birthWeightKg: newKid.birthWeightKg ?? 3.5,
      colostrumHours: newKid.colostrumHours ?? 1.5,
      colostrumStatus: newKid.colostrumStatus || 'Excelente (<2h)',
      gmdGramsDay: newKid.gmdGramsDay ?? 200,
      status: newKid.status || 'Em Amamentação',
      notes: newKid.notes
    });
    setIsModalOpen(false);
    setFormError('');
  };

  const inputCls =
    'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Baby className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            Maternidade &amp; Criação de Cabritos
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Colostragem precoce, ganho de peso diário (GMD), desmame e sobrevivência neonatal.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Registrar Nascimento
        </button>
      </div>

      {/* Unified Hairline KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden">
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Colostragem até 2h
          </span>
          <div className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
            {totalKids > 0 ? `${colostrumSuccessRate}%` : '--'}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Ingestão nas primeiras 2 horas de vida
          </p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            GMD Pré-Desmame
          </span>
          <div className="text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
            {avgGmdKids > 0 ? avgGmdKids : '--'}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">g/dia</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Crescimento na fase de aleitamento
          </p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Mortalidade Neonatal
          </span>
          <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
            {mortalityRate}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {totalKids} cria(s) acompanhada(s)
          </p>
        </div>
      </div>

      {/* Roster Grid */}
      {kidRecords.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center text-xs text-slate-500 dark:text-zinc-400">
          Nenhum cabrito registrado na maternidade ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kidRecords.map(kid => {
            const mother = animals.find(a => a.id === kid.motherId);
            return (
              <div
                key={kid.id}
                className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                      {kid.earTag}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {kid.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[11px] font-medium shrink-0 ${
                      kid.status === 'Óbito'
                        ? 'text-rose-600 dark:text-rose-400'
                        : kid.status === 'Desmamado'
                        ? 'text-sky-600 dark:text-sky-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {kid.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      Nascimento
                    </span>
                    <span className="font-medium font-mono text-slate-900 dark:text-zinc-100">
                      {kid.birthDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      Peso ao Nascer
                    </span>
                    <span className="font-medium tabular-nums text-amber-600 dark:text-amber-400">
                      {kid.birthWeightKg} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      Colostragem
                    </span>
                    <span className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                      {kid.colostrumHours}h · {kid.colostrumStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      GMD Diário
                    </span>
                    <span className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
                      {kid.gmdGramsDay} g/dia
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800 truncate">
                  Matriz:{' '}
                  <span className="font-medium text-slate-800 dark:text-zinc-200">
                    {mother ? `${mother.earTag} — ${mother.name}` : 'Não informada'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Kid Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Baby className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Registrar Nascimento de Cabrito
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Nome / Identificação *
                  </label>
                  <input
                    type="text"
                    required
                    value={newKid.name || ''}
                    onChange={e => setNewKid({ ...newKid, name: e.target.value })}
                    className={inputCls}
                    placeholder="Ex: Cabrito 01"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Brinco *
                  </label>
                  <input
                    type="text"
                    required
                    value={newKid.earTag || ''}
                    onChange={e => setNewKid({ ...newKid, earTag: e.target.value })}
                    className={`${inputCls} font-mono`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Mãe Matriz *
                </label>
                <select
                  required
                  value={newKid.motherId || ''}
                  onChange={e => setNewKid({ ...newKid, motherId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Selecionar matriz...</option>
                  {mothers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.earTag} — {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={newKid.birthDate || ''}
                    onChange={e => setNewKid({ ...newKid, birthDate: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Peso ao Nascer (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newKid.birthWeightKg ?? 3.5}
                    onChange={e =>
                      setNewKid({ ...newKid, birthWeightKg: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Colostragem (h)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newKid.colostrumHours ?? 1.5}
                    onChange={e =>
                      setNewKid({ ...newKid, colostrumHours: parseFloat(e.target.value) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Qualidade
                  </label>
                  <select
                    value={newKid.colostrumStatus || 'Excelente (<2h)'}
                    onChange={e =>
                      setNewKid({
                        ...newKid,
                        colostrumStatus: e.target.value as CaprineKidRecord['colostrumStatus']
                      })
                    }
                    className={inputCls}
                  >
                    <option value="Excelente (<2h)">Excelente (&lt;2h)</option>
                    <option value="Adequado (2-6h)">Adequado (2-6h)</option>
                    <option value="Deficiente (>6h)">Deficiente (&gt;6h)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    GMD (g/dia)
                  </label>
                  <input
                    type="number"
                    value={newKid.gmdGramsDay ?? 200}
                    onChange={e =>
                      setNewKid({ ...newKid, gmdGramsDay: parseInt(e.target.value, 10) || 0 })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Salvar Cabrito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
