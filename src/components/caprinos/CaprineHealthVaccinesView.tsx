import React, { useState } from 'react';
import { CaprineAnimal, CaprineHealthRecord, CaprineHealthType } from '../../types/caprine';
import { Syringe, Plus, Clock, Eye, X } from 'lucide-react';

interface Props {
  animals: CaprineAnimal[];
  healthRecords: CaprineHealthRecord[];
  onSaveHealthRecord: (rec: CaprineHealthRecord) => void;
}

const FAMACHA_GUIDE = [
  {
    grade: 1,
    mucosa: 'Vermelho vivo',
    action: 'Não desverminar',
    swatch: 'bg-red-800',
    tone: 'text-emerald-700 dark:text-emerald-400'
  },
  {
    grade: 2,
    mucosa: 'Vermelho rosa',
    action: 'Não desverminar',
    swatch: 'bg-red-500',
    tone: 'text-emerald-700 dark:text-emerald-400'
  },
  {
    grade: 3,
    mucosa: 'Rosa pálido',
    action: 'Atenção / Tratar',
    swatch: 'bg-pink-400',
    tone: 'text-amber-700 dark:text-amber-400'
  },
  {
    grade: 4,
    mucosa: 'Anêmico',
    action: 'Desverminar urgente',
    swatch: 'bg-pink-200',
    tone: 'text-rose-700 dark:text-rose-400'
  },
  {
    grade: 5,
    mucosa: 'Branco severo',
    action: 'Emergência clínica',
    swatch: 'bg-slate-100 border border-rose-500',
    tone: 'text-rose-700 dark:text-rose-400 font-semibold'
  }
];

const HEALTH_TYPES: CaprineHealthType[] = [
  'Vermifugação (FAMACHA)',
  'Vacina',
  'Ectoparasita',
  'Tratamento',
  'Cirurgia',
  'Exame (CAE/Linfoadenite)'
];

export const CaprineHealthVaccinesView: React.FC<Props> = ({
  animals,
  healthRecords,
  onSaveHealthRecord
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [newHealth, setNewHealth] = useState<Partial<CaprineHealthRecord>>({});

  const getFamachaTone = (score: number) => {
    if (score >= 4) return 'text-rose-600 dark:text-rose-400 font-semibold';
    if (score === 3) return 'text-amber-600 dark:text-amber-400 font-medium';
    return 'text-emerald-600 dark:text-emerald-400 font-medium';
  };

  const handleOpenModal = () => {
    setFormError('');
    setNewHealth({
      id: `hea-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      animalId: animals[0]?.id || '',
      type: 'Vermifugação (FAMACHA)',
      productName: 'Moxidectina 1% Caprinos',
      dosage: '1 mL / 50 kg SC',
      famachaScore: 1,
      withdrawalMilkDays: 0,
      withdrawalMeatDays: 14,
      veterinarian: 'Responsável Técnico',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHealth.animalId || !newHealth.productName?.trim()) {
      setFormError('Selecione o caprino e informe o produto ou exame.');
      return;
    }
    onSaveHealthRecord({
      id: newHealth.id || `hea-${Date.now()}`,
      date: newHealth.date || new Date().toISOString().split('T')[0],
      animalId: newHealth.animalId,
      type: (newHealth.type as CaprineHealthType) || 'Vermifugação (FAMACHA)',
      productName: newHealth.productName.trim(),
      dosage: newHealth.dosage || '--',
      famachaScore: newHealth.famachaScore,
      opgCount: newHealth.opgCount,
      withdrawalMilkDays: newHealth.withdrawalMilkDays ?? 0,
      withdrawalMeatDays: newHealth.withdrawalMeatDays ?? 0,
      veterinarian: newHealth.veterinarian || 'Responsável Técnico',
      notes: newHealth.notes
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
            <Syringe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Sanidade Caprina, FAMACHA &amp; Carência
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Vacinas, avaliação ocular FAMACHA (1–5), exames de CAE e controle de carência de leite e carne.
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

      {/* FAMACHA Visual Reference Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Escala do Cartão FAMACHA (Desverminação Seletiva)
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
            Tratar apenas animais em grau 3, 4 ou 5 para reduzir a resistência anti-helmíntica.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
          {FAMACHA_GUIDE.map(item => (
            <div key={item.grade} className="p-3.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${item.swatch}`} />
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Grau {item.grade}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400">{item.mucosa}</p>
              <p className={`text-[11px] ${item.tone}`}>{item.action}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Health Records Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Histórico de Eventos Sanitários
          </h2>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {healthRecords.length} registro(s)
          </span>
        </div>

        {healthRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhuma ocorrência sanitária registrada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-medium">
                <tr>
                  <th className="px-4 py-2.5">Data</th>
                  <th className="px-4 py-2.5">Caprino</th>
                  <th className="px-4 py-2.5">Procedimento</th>
                  <th className="px-4 py-2.5">Produto / Exame</th>
                  <th className="px-4 py-2.5">FAMACHA</th>
                  <th className="px-4 py-2.5">Carência</th>
                  <th className="px-4 py-2.5">Veterinário</th>
                  <th className="px-4 py-2.5">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {healthRecords.map(h => {
                  const goat = animals.find(a => a.id === h.animalId);
                  const score = h.famachaScore || 1;
                  return (
                    <tr
                      key={h.id}
                      className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-mono text-slate-600 dark:text-zinc-400 whitespace-nowrap">
                        {h.date}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-zinc-100 whitespace-nowrap">
                        {goat ? `${goat.earTag} — ${goat.name}` : h.animalId}
                      </td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-zinc-300">{h.type}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-zinc-100">
                        {h.productName}
                      </td>
                      <td className={`px-4 py-2.5 tabular-nums ${getFamachaTone(score)}`}>
                        Grau {score}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap tabular-nums">
                        {h.withdrawalMilkDays > 0 || h.withdrawalMeatDays > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-medium inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Leite {h.withdrawalMilkDays}d · Carne {h.withdrawalMeatDays}d
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">Sem carência</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-zinc-400">
                        {h.veterinarian}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-zinc-400 max-w-xs truncate">
                        {h.notes || '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Health Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Syringe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Registrar Procedimento Sanitário
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
                  Caprino *
                </label>
                <select
                  required
                  value={newHealth.animalId || ''}
                  onChange={e => setNewHealth({ ...newHealth, animalId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">Selecionar caprino...</option>
                  {animals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.earTag} — {a.name}
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
                    value={newHealth.type || 'Vermifugação (FAMACHA)'}
                    onChange={e =>
                      setNewHealth({ ...newHealth, type: e.target.value as CaprineHealthType })
                    }
                    className={inputCls}
                  >
                    {HEALTH_TYPES.map(t => (
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
                    value={newHealth.date || ''}
                    onChange={e => setNewHealth({ ...newHealth, date: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Produto / Exame *
                </label>
                <input
                  type="text"
                  required
                  value={newHealth.productName || ''}
                  onChange={e => setNewHealth({ ...newHealth, productName: e.target.value })}
                  className={inputCls}
                  placeholder="Ex: Moxidectina 1% / Vacina Clostridiose"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    FAMACHA (1 a 5)
                  </label>
                  <select
                    value={newHealth.famachaScore ?? 1}
                    onChange={e =>
                      setNewHealth({ ...newHealth, famachaScore: parseInt(e.target.value, 10) })
                    }
                    className={inputCls}
                  >
                    <option value={1}>Grau 1 (Vermelho vivo)</option>
                    <option value={2}>Grau 2 (Vermelho rosa)</option>
                    <option value={3}>Grau 3 (Rosa pálido)</option>
                    <option value={4}>Grau 4 (Anêmico)</option>
                    <option value={5}>Grau 5 (Branco severo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Dosagem / Via
                  </label>
                  <input
                    type="text"
                    value={newHealth.dosage || ''}
                    onChange={e => setNewHealth({ ...newHealth, dosage: e.target.value })}
                    className={inputCls}
                    placeholder="Ex: 1 mL / 50 kg SC"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Car. Leite (d)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newHealth.withdrawalMilkDays ?? 0}
                    onChange={e =>
                      setNewHealth({
                        ...newHealth,
                        withdrawalMilkDays: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Car. Carne (d)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newHealth.withdrawalMeatDays ?? 0}
                    onChange={e =>
                      setNewHealth({
                        ...newHealth,
                        withdrawalMeatDays: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Veterinário
                  </label>
                  <input
                    type="text"
                    value={newHealth.veterinarian || ''}
                    onChange={e => setNewHealth({ ...newHealth, veterinarian: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Observações
                </label>
                <input
                  type="text"
                  value={newHealth.notes || ''}
                  onChange={e => setNewHealth({ ...newHealth, notes: e.target.value })}
                  className={inputCls}
                  placeholder="Lote, reação vacinal ou retorno agendado"
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
                  Salvar Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
