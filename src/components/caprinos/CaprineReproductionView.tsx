import React, { useState } from 'react';
import {
  CaprineAnimal,
  CaprineReproductionRecord,
  CaprineReproductionEventType
} from '../../types/caprine';
import { Heart, Plus, X } from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  reproductionRecords: CaprineReproductionRecord[];
  onSaveRecord: (rec: CaprineReproductionRecord) => void;
}

const EVENT_TYPES: CaprineReproductionEventType[] = [
  'Monta Natural',
  'Inseminação Artificial (IA)',
  'Diagnóstico de Gestação',
  'Parto',
  'Desmame',
  'Cio / Estro',
  'Aborto'
];

export const CaprineReproductionView: React.FC<Props> = ({
  animals,
  reproductionRecords,
  onSaveRecord
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [newRec, setNewRec] = useState<Partial<CaprineReproductionRecord>>({});

  const does = animals.filter(a => a.sex === 'Fêmea');
  const bucks = animals.filter(a => a.sex === 'Macho (Bode)');

  const births = reproductionRecords.filter(r => r.eventType === 'Parto');
  const totalBirths = births.length;
  const totalKidsBorn = births.reduce((acc, curr) => acc + (curr.kidsCount || 0), 0);
  const prolificacyRate = totalBirths > 0 ? (totalKidsBorn / totalBirths).toFixed(2) : '--';

  const iepRecords = reproductionRecords.filter(r => (r.interBirthDays || 0) > 0);
  const avgIep =
    iepRecords.length > 0
      ? Math.round(
          iepRecords.reduce((acc, curr) => acc + (curr.interBirthDays || 0), 0) / iepRecords.length
        )
      : 0;

  const dgRecords = reproductionRecords.filter(
    r => r.pregnancyStatus === 'Confirmada' || r.pregnancyStatus === 'Não Gestante'
  );
  const confirmedPregnancies = dgRecords.filter(r => r.pregnancyStatus === 'Confirmada').length;
  const pregnancyRate =
    dgRecords.length > 0 ? `${((confirmedPregnancies / dgRecords.length) * 100).toFixed(1)}%` : '--';

  const handleOpenModal = () => {
    setFormError('');
    setNewRec({
      id: `rep-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      animalId: does[0]?.id || '',
      eventType: 'Monta Natural',
      pregnancyStatus: 'Aguardando DG',
      kidsCount: 1,
      birthWeightTotalKg: 3.5,
      sireName: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRec.animalId) {
      setFormError('Selecione a matriz caprina para registrar o evento.');
      return;
    }
    onSaveRecord({
      id: newRec.id || `rep-${Date.now()}`,
      date: newRec.date || new Date().toISOString().split('T')[0],
      animalId: newRec.animalId,
      eventType: (newRec.eventType as CaprineReproductionEventType) || 'Monta Natural',
      sireName: newRec.sireName || undefined,
      pregnancyStatus: newRec.pregnancyStatus,
      kidsCount: newRec.eventType === 'Parto' ? newRec.kidsCount || 1 : undefined,
      birthWeightTotalKg:
        newRec.eventType === 'Parto' ? newRec.birthWeightTotalKg || undefined : undefined,
      interBirthDays: newRec.interBirthDays || undefined,
      notes: newRec.notes || undefined
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
            <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            Reprodução, IA &amp; Maternidade Caprina
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Coberturas, inseminação artificial, diagnósticos de gestação, partos e IEP.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Registrar Evento
        </button>
      </div>

      {/* Unified Hairline KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden">
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Prolificidade
          </span>
          <div className="text-lg font-semibold tabular-nums text-rose-600 dark:text-rose-400 mt-0.5">
            {prolificacyRate}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Crias por parto</p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Intervalo Partos (IEP)
          </span>
          <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
            {avgIep > 0 ? avgIep : '--'}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">dias</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Meta: 240 dias</p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Taxa de Prenhez
          </span>
          <div className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
            {pregnancyRate}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Diagnósticos confirmados</p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Total de Partos
          </span>
          <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
            {totalBirths}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {totalKidsBorn} cabrito(s) nascido(s)
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Histórico de Eventos Reprodutivos
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {reproductionRecords.length} registro(s)
          </span>
        </div>

        {reproductionRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum evento reprodutivo registrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-medium">
                <tr>
                  <th className="px-4 py-2.5">Data</th>
                  <th className="px-4 py-2.5">Matriz (Cabra)</th>
                  <th className="px-4 py-2.5">Evento</th>
                  <th className="px-4 py-2.5">Bode / Sêmen</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Crias</th>
                  <th className="px-4 py-2.5">IEP</th>
                  <th className="px-4 py-2.5">Anotações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {reproductionRecords.map(r => {
                  const matrix = animals.find(a => a.id === r.animalId);
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        {r.date}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                        {matrix ? `${matrix.earTag} — ${matrix.name}` : r.animalId}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`font-medium ${
                            r.eventType === 'Parto'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : r.eventType === 'Inseminação Artificial (IA)'
                              ? 'text-sky-600 dark:text-sky-400'
                              : r.eventType === 'Aborto'
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-violet-600 dark:text-violet-400'
                          }`}
                        >
                          {r.eventType}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-zinc-300">
                        {r.sireName || '--'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-zinc-300">
                        {r.pregnancyStatus || '--'}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums font-medium text-slate-900 dark:text-zinc-100">
                        {r.kidsCount ? `${r.kidsCount}` : '--'}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums text-slate-600 dark:text-zinc-400">
                        {r.interBirthDays ? `${r.interBirthDays}d` : '--'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-zinc-400 max-w-xs truncate">
                        {r.notes || '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Lançamento Reprodutivo Caprino
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

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Matriz Caprina (Fêmea) *
                </label>
                <select
                  required
                  value={newRec.animalId || ''}
                  onChange={e => setNewRec({ ...newRec, animalId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Selecionar matriz...</option>
                  {does.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.earTag} — {d.name} ({d.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Tipo de Evento *
                  </label>
                  <select
                    value={newRec.eventType || 'Monta Natural'}
                    onChange={e =>
                      setNewRec({
                        ...newRec,
                        eventType: e.target.value as CaprineReproductionEventType
                      })
                    }
                    className={inputCls}
                  >
                    {EVENT_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={newRec.date || ''}
                    onChange={e => setNewRec({ ...newRec, date: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Bode Reprodutor / Sêmen IA
                  </label>
                  <input
                    type="text"
                    list="caprine-bucks-list"
                    value={newRec.sireName || ''}
                    onChange={e => setNewRec({ ...newRec, sireName: e.target.value })}
                    className={inputCls}
                    placeholder="Nome do reprodutor ou partida"
                  />
                  <datalist id="caprine-bucks-list">
                    {bucks.map(b => (
                      <option key={b.id} value={`${b.earTag} - ${b.name} (${b.breed})`} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Status Gestação
                  </label>
                  <select
                    value={newRec.pregnancyStatus || 'Aguardando DG'}
                    onChange={e =>
                      setNewRec({
                        ...newRec,
                        pregnancyStatus: e.target.value as CaprineReproductionRecord['pregnancyStatus']
                      })
                    }
                    className={inputCls}
                  >
                    <option value="Aguardando DG">Aguardando DG</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Não Gestante">Não Gestante</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Crias (Parto)
                  </label>
                  <select
                    value={newRec.kidsCount || 1}
                    onChange={e => setNewRec({ ...newRec, kidsCount: parseInt(e.target.value, 10) })}
                    className={inputCls}
                  >
                    <option value={1}>1 (Simples)</option>
                    <option value={2}>2 (Gêmeos)</option>
                    <option value={3}>3 (Tríplice)</option>
                    <option value={4}>4 (Quádruplo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Peso Total (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRec.birthWeightTotalKg ?? 3.5}
                    onChange={e =>
                      setNewRec({
                        ...newRec,
                        birthWeightTotalKg: parseFloat(e.target.value) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    IEP (Dias)
                  </label>
                  <input
                    type="number"
                    value={newRec.interBirthDays ?? ''}
                    onChange={e =>
                      setNewRec({
                        ...newRec,
                        interBirthDays: e.target.value ? parseInt(e.target.value, 10) : undefined
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                    placeholder="240"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={newRec.notes || ''}
                  onChange={e => setNewRec({ ...newRec, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Facilidade do parto, ultrassom ou protocolo IATF..."
                />
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
