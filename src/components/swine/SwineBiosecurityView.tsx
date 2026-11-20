import React, { useMemo, useState } from 'react';
import { ShieldAlert, Plus, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { SwineBiosecurityLog } from '../../types/swine';
import {
  SWINE_CARD_CLASS,
  SWINE_INPUT_CLASS,
  SWINE_LABEL_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SECONDARY_BTN_CLASS,
  SWINE_SUBCARD_CLASS,
  SWINE_TEXTAREA_CLASS,
  formatBrDate,
  getBiosecurityBadgeClass,
  getTodayIsoDate,
  useEscapeClose,
} from './swineUi';

interface SwineBiosecurityViewProps {
  checks: SwineBiosecurityLog[];
  onAddCheck: (check: SwineBiosecurityLog) => void;
  onUpdateCheck: (check: SwineBiosecurityLog) => void;
}

export const SwineBiosecurityView: React.FC<SwineBiosecurityViewProps> = ({
  checks,
  onAddCheck,
  onUpdateCheck,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [type, setType] = useState<SwineBiosecurityLog['type']>('Acesso de Visitante');
  const [description, setDescription] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [status, setStatus] = useState<SwineBiosecurityLog['status']>('Conforme');
  const [downtimeHours, setDowntimeHours] = useState(72);
  const [showerTaken, setShowerTaken] = useState(true);
  const [vehicleDisinfected, setVehicleDisinfected] = useState(true);
  const [notes, setNotes] = useState('');

  useEscapeClose(isModalOpen, () => setIsModalOpen(false));

  const stats = useMemo(() => {
    const total = checks.length;
    const conforming = checks.filter(c => c.status === 'Conforme').length;
    const nonConforming = checks.filter(c => c.status === 'Não Conforme / Advertência').length;
    const pending = checks.filter(c => c.status === 'Pendente').length;
    const compliancePct = total > 0 ? `${((conforming / total) * 100).toFixed(1)}%` : '—';
    return { total, conforming, nonConforming, pending, compliancePct };
  }, [checks]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    const newCheck: SwineBiosecurityLog = {
      id: `bio_${Date.now()}`,
      date: getTodayIsoDate(),
      type,
      description: description.trim(),
      responsibleName: responsibleName.trim() || 'Responsável Técnico',
      status,
      downtimeHoursObserved: Number(downtimeHours) || 0,
      showerTakenAndBootsChanged: showerTaken,
      vehicleDisinfected,
      notes: notes.trim() || undefined,
    };

    onAddCheck(newCheck);
    setDescription('');
    setNotes('');
    setIsModalOpen(false);
  };

  const handleToggle = (item: SwineBiosecurityLog) => {
    onUpdateCheck({
      ...item,
      status: item.status === 'Conforme' ? 'Não Conforme / Advertência' : 'Conforme',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Biosseguridade & Barreiras Sanitárias</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Controle de acesso, rodolúvio, arco de desinfecção, vazio sanitário de visitantes e quarentena.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`${SWINE_PRIMARY_BTN_CLASS} shrink-0`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Auditoria</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Conformidade
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
            {stats.compliancePct}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            {stats.conforming} de {stats.total} registros
          </span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Não Conformidades
          </span>
          <div
            className={`text-xl font-bold mt-0.5 tabular-nums ${
              stats.nonConforming > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-900 dark:text-zinc-100'
            }`}
          >
            {stats.nonConforming}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">advertências ativas</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Pendentes
          </span>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 tabular-nums">
            {stats.pending}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">aguardando verificação</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Protocolo Padrão
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">
            72h / 30d
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">vazio visitas / quarentena</span>
        </div>
      </div>

      {/* Checklist List */}
      <div className={`${SWINE_CARD_CLASS} p-4 space-y-3`}>
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
          Auditoria de Barreiras e POPs
        </h3>

        {checks.length === 0 ? (
          <div className={`${SWINE_SUBCARD_CLASS} p-8 text-center space-y-1.5`}>
            <ShieldAlert className="w-7 h-7 text-slate-400 dark:text-zinc-500 mx-auto" />
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Nenhuma auditoria de biosseguridade registrada
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Registre inspeções de veículos, visitantes, vazio sanitário e controle de pragas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {checks.map(item => (
              <div
                key={item.id}
                className={`${SWINE_SUBCARD_CLASS} p-3.5 flex items-start justify-between gap-3`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
                      {item.type}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                      {formatBrDate(item.date)}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    {item.description}
                  </h4>
                  {item.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">{item.notes}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>Auditor: {item.responsibleName}</span>
                    {item.downtimeHoursObserved !== undefined && item.downtimeHoursObserved > 0 && (
                      <span>· Vazio: {item.downtimeHoursObserved}h</span>
                    )}
                    <span>· Banho/Botas: {item.showerTakenAndBootsChanged ? 'Sim' : 'Não'}</span>
                    <span>· Arco: {item.vehicleDisinfected ? 'Sim' : 'Não'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(item)}
                  className={`h-7 px-2.5 rounded-lg text-[11px] font-medium shrink-0 inline-flex items-center gap-1 transition-colors cursor-pointer ${getBiosecurityBadgeClass(item.status)}`}
                  title="Alternar conformidade"
                >
                  {item.status === 'Conforme' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                  <span>{item.status === 'Não Conforme / Advertência' ? 'Não Conforme' : item.status}</span>
                </button>
              </div>
            ))}
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
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Nova Auditoria de Biosseguridade
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
                <label className={SWINE_LABEL_CLASS}>Tipo de Evento *</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as SwineBiosecurityLog['type'])}
                  className={SWINE_INPUT_CLASS}
                >
                  <option value="Acesso de Visitante">Acesso de Visitante</option>
                  <option value="Caminhão de Ração">Caminhão de Ração</option>
                  <option value="Caminhão de Carga / Animais">Caminhão de Carga / Animais</option>
                  <option value="Vazio Sanitário">Vazio Sanitário</option>
                  <option value="Controle de Roedores / Moscas">Controle de Roedores / Moscas</option>
                  <option value="Destino de Carcaças / Compostagem">
                    Destino de Carcaças / Compostagem
                  </option>
                  <option value="Quarentena de Reposição">Quarentena de Reposição</option>
                </select>
              </div>

              <div>
                <label className={SWINE_LABEL_CLASS}>Descrição do Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Desinfecção de caminhão de ração no arco sanitário"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className={SWINE_INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Auditor / Responsável</label>
                  <input
                    type="text"
                    placeholder="Nome"
                    value={responsibleName}
                    onChange={e => setResponsibleName(e.target.value)}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Vazio Prévio (horas)</label>
                  <input
                    type="number"
                    min="0"
                    value={downtimeHours}
                    onChange={e => setDowntimeHours(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as SwineBiosecurityLog['status'])}
                    className={SWINE_INPUT_CLASS}
                  >
                    <option value="Conforme">Conforme</option>
                    <option value="Não Conforme / Advertência">Não Conforme</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showerTaken}
                    onChange={e => setShowerTaken(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Banho e troca de botas</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vehicleDisinfected}
                    onChange={e => setVehicleDisinfected(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Veículo desinfetado</span>
                </label>
              </div>

              <div>
                <label className={SWINE_LABEL_CLASS}>Observações Técnicas</label>
                <textarea
                  rows={2}
                  placeholder="Produto utilizado, diluição ou ocorrência..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className={SWINE_TEXTAREA_CLASS}
                />
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
