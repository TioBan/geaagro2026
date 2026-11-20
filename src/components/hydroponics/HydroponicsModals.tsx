import React, { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import {
  HydroponicBench,
  HydroponicCropCategory,
  HydroponicSystemType,
  NutrientSolutionReservoir,
} from '../../types/hydroponics';
import {
  BENCH_STATUS_META,
  formatBrDate,
  getTodayIsoDate,
  HYDRO_CROP_CATEGORIES,
  HYDRO_INPUT_CLASS,
  HYDRO_LABEL_CLASS,
  HYDRO_SYSTEM_LABELS,
  HYDRO_TEXTAREA_CLASS,
} from './hydroponicsUi';

function useEscapeClose(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

/* ============================================================
   1. MODAL: DETALHES DA BANCADA
============================================================ */
interface BenchDetailModalProps {
  bench: HydroponicBench | null;
  reservoirs: NutrientSolutionReservoir[];
  onClose: () => void;
  onUpdateStatus: (benchId: string, status: HydroponicBench['status']) => void;
  onDelete: (benchId: string) => void;
}

export const BenchDetailModal: React.FC<BenchDetailModalProps> = ({
  bench,
  reservoirs,
  onClose,
  onUpdateStatus,
  onDelete,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEscapeClose(Boolean(bench), onClose);

  if (!bench) return null;
  const res = reservoirs.find((r) => r.id === bench.reservoirId);
  const statusMeta = BENCH_STATUS_META[bench.status];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
              <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">
                {bench.code}
              </span>
              <span aria-hidden="true">·</span>
              <span>{bench.systemType.replace('_', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span className={statusMeta.textClass}>{statusMeta.label}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
              {bench.cropName} — {bench.cultivar || 'Cultivar padrão'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">{bench.greenhouseSection}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs tabular-nums">
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-2.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Idade Atual</span>
            <strong className="text-slate-900 dark:text-zinc-100">
              {bench.daysAfterTransplant} dias (DAT)
            </strong>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-2.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Colheita Prevista</span>
            <strong className="text-slate-900 dark:text-zinc-100">
              {formatBrDate(bench.expectedHarvestDate)}
            </strong>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-2.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Ocupação</span>
            <strong className="text-slate-900 dark:text-zinc-100">
              {bench.currentPlantsCount} / {bench.totalCapacityPlants} un
            </strong>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-2.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Produção Est.</span>
            <strong className="text-emerald-700 dark:text-emerald-400">
              {bench.estimatedYieldKg} kg
            </strong>
          </div>
        </div>

        {res && (
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 p-3 text-xs tabular-nums flex items-center justify-between gap-2">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                Reservatório Vinculado
              </span>
              <strong className="text-slate-900 dark:text-zinc-100">{res.name}</strong>
            </div>
            <div className="text-right font-mono text-emerald-700 dark:text-emerald-400">
              pH {res.currentPH.toFixed(2)} · CE {res.currentEC.toFixed(2)} mS/cm
            </div>
          </div>
        )}

        <div>
          <label className={HYDRO_LABEL_CLASS}>Estágio da Bancada</label>
          <select
            value={bench.status}
            onChange={(e) =>
              onUpdateStatus(bench.id, e.target.value as HydroponicBench['status'])
            }
            className={HYDRO_INPUT_CLASS}
          >
            <option value="maternidade">Berçário / Maternidade</option>
            <option value="desenvolvimento">Desenvolvimento</option>
            <option value="pronto_colheita">Pronto p/ Colheita</option>
            <option value="vazia">Vazia / Limpeza</option>
          </select>
        </div>

        {bench.notes && (
          <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 p-3 text-xs text-slate-600 dark:text-zinc-300">
            <strong className="text-slate-800 dark:text-zinc-100 block mb-0.5">Observações</strong>
            {bench.notes}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800">
          {confirmDelete ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-rose-600 dark:text-rose-400 font-medium">Excluir bancada?</span>
              <button
                type="button"
                onClick={() => {
                  onDelete(bench.id);
                  setConfirmDelete(false);
                }}
                className="h-7 px-2.5 rounded-md bg-rose-600 text-white font-medium cursor-pointer"
              >
                Confirmar
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 cursor-pointer"
              >
                Não
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="h-8 px-2.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 inline-flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remover
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   2. MODAL: NOVA BANCADA
============================================================ */
interface BenchFormModalProps {
  open: boolean;
  existingCount: number;
  reservoirs: NutrientSolutionReservoir[];
  onClose: () => void;
  onSave: (bench: HydroponicBench) => void;
}

export const BenchFormModal: React.FC<BenchFormModalProps> = ({
  open,
  existingCount,
  reservoirs,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [systemType, setSystemType] = useState<HydroponicSystemType>('NFT');
  const [section, setSection] = useState('Estufa 01 - Setor A');
  const [cropName, setCropName] = useState('');
  const [cultivar, setCultivar] = useState('');
  const [category, setCategory] = useState<HydroponicCropCategory>('folhosa');
  const [capacity, setCapacity] = useState<number>(240);
  const [cycleDays, setCycleDays] = useState<number>(24);
  const [reservoirId, setReservoirId] = useState<string>(reservoirs[0]?.id || '');
  const [notes, setNotes] = useState('');

  useEscapeClose(open, onClose);
  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayIso = getTodayIsoDate();
    const harvestDate = new Date(Date.now() + Math.max(1, cycleDays) * 86400000);
    const harvestIso = `${harvestDate.getFullYear()}-${String(harvestDate.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(harvestDate.getDate()).padStart(2, '0')}`;

    const safeCap = Math.max(1, Number(capacity) || 1);
    onSave({
      id: `banc-${Date.now()}`,
      code: code.trim() || `BANC-${String(existingCount + 1).padStart(2, '0')}`,
      systemType,
      greenhouseSection: section.trim() || 'Estufa 01',
      cropName: cropName.trim(),
      cultivar: cultivar.trim(),
      category,
      transplantDate: todayIso,
      expectedHarvestDate: harvestIso,
      daysAfterTransplant: 0,
      totalCapacityPlants: safeCap,
      currentPlantsCount: safeCap,
      reservoirId: reservoirId || reservoirs[0]?.id || '',
      status: 'maternidade',
      healthStatus: 'excelente',
      estimatedYieldKg: Math.round(safeCap * 0.3),
      notes: notes.trim() || undefined,
      gridPosition: {
        row: Math.ceil((existingCount + 1) / 3),
        col: (existingCount % 3) + 1,
      },
    });
    setCode('');
    setCropName('');
    setCultivar('');
    setNotes('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Cadastrar Nova Bancada Hidropônica
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={HYDRO_LABEL_CLASS}>Código da Bancada *</label>
              <input
                type="text"
                required
                placeholder="Ex: BANC-NFT-01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={HYDRO_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={HYDRO_LABEL_CLASS}>Sistema Hidropônico</label>
              <select
                value={systemType}
                onChange={(e) => setSystemType(e.target.value as HydroponicSystemType)}
                className={HYDRO_INPUT_CLASS}
              >
                {(Object.keys(HYDRO_SYSTEM_LABELS) as HydroponicSystemType[]).map((key) => (
                  <option key={key} value={key}>
                    {HYDRO_SYSTEM_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={HYDRO_LABEL_CLASS}>Cultura *</label>
              <input
                type="text"
                required
                placeholder="Ex: Alface Crespa"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className={HYDRO_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={HYDRO_LABEL_CLASS}>Cultivar *</label>
              <input
                type="text"
                required
                placeholder="Ex: Vanda / Vera"
                value={cultivar}
                onChange={(e) => setCultivar(e.target.value)}
                className={HYDRO_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={HYDRO_LABEL_CLASS}>Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HydroponicCropCategory)}
                className={HYDRO_INPUT_CLASS}
              >
                {HYDRO_CROP_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={HYDRO_LABEL_CLASS}>Estufa / Setor</label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className={HYDRO_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={HYDRO_LABEL_CLASS}>Capacidade (Plantas) *</label>
              <input
                type="number"
                min="1"
                required
                value={capacity}
                onChange={(e) => setCapacity(Math.max(1, Number(e.target.value) || 1))}
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>
            <div>
              <label className={HYDRO_LABEL_CLASS}>Ciclo Previsto (Dias)</label>
              <input
                type="number"
                min="5"
                max="180"
                value={cycleDays}
                onChange={(e) => setCycleDays(Math.max(5, Number(e.target.value) || 24))}
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>
          </div>

          <div>
            <label className={HYDRO_LABEL_CLASS}>Reservatório Vinculado</label>
            <select
              value={reservoirId}
              onChange={(e) => setReservoirId(e.target.value)}
              className={HYDRO_INPUT_CLASS}
            >
              <option value="">Sem vínculo no momento</option>
              {reservoirs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.capacityLiters} L)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={HYDRO_LABEL_CLASS}>Observações (Opcional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Espaçamento, lote de mudas, detalhes do perfil..."
              className={HYDRO_TEXTAREA_CLASS}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
            >
              Salvar Bancada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ============================================================
   3. MODAL: CRIAR / EDITAR RESERVATÓRIO
============================================================ */
interface ReservoirFormModalProps {
  open: boolean;
  editing: NutrientSolutionReservoir | null;
  onClose: () => void;
  onSave: (reservoir: NutrientSolutionReservoir) => void;
}

export const ReservoirFormModal: React.FC<ReservoirFormModalProps> = ({
  open,
  editing,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(editing?.name || '');
  const [capacityLiters, setCapacityLiters] = useState<number>(editing?.capacityLiters || 1000);
  const [currentVolumeLiters, setCurrentVolumeLiters] = useState<number>(
    editing?.currentVolumeLiters ?? 850
  );
  const [currentPH, setCurrentPH] = useState<number>(editing?.currentPH ?? 6.0);
  const [targetPHMin, setTargetPHMin] = useState<number>(editing?.targetPHMin ?? 5.8);
  const [targetPHMax, setTargetPHMax] = useState<number>(editing?.targetPHMax ?? 6.2);
  const [currentEC, setCurrentEC] = useState<number>(editing?.currentEC ?? 1.4);
  const [targetECMin, setTargetECMin] = useState<number>(editing?.targetECMin ?? 1.2);
  const [targetECMax, setTargetECMax] = useState<number>(editing?.targetECMax ?? 1.6);
  const [solutionTempC, setSolutionTempC] = useState<number>(editing?.solutionTempC ?? 21.5);
  const [dissolvedOxygenPpm, setDissolvedOxygenPpm] = useState<number>(
    editing?.dissolvedOxygenPpm ?? 6.8
  );
  const [pumpStatus, setPumpStatus] = useState<NutrientSolutionReservoir['pumpStatus']>(
    editing?.pumpStatus || 'timer'
  );

  useEffect(() => {
    if (!open) return;
    setName(editing?.name || '');
    setCapacityLiters(editing?.capacityLiters || 1000);
    setCurrentVolumeLiters(editing?.currentVolumeLiters ?? 850);
    setCurrentPH(editing?.currentPH ?? 6.0);
    setTargetPHMin(editing?.targetPHMin ?? 5.8);
    setTargetPHMax(editing?.targetPHMax ?? 6.2);
    setCurrentEC(editing?.currentEC ?? 1.4);
    setTargetECMin(editing?.targetECMin ?? 1.2);
    setTargetECMax(editing?.targetECMax ?? 1.6);
    setSolutionTempC(editing?.solutionTempC ?? 21.5);
    setDissolvedOxygenPpm(editing?.dissolvedOxygenPpm ?? 6.8);
    setPumpStatus(editing?.pumpStatus || 'timer');
  }, [open, editing]);

  useEscapeClose(open, onClose);
  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayBr = formatBrDate(getTodayIsoDate());
    onSave({
      id: editing?.id || `res-${Date.now()}`,
      name: name.trim() || 'Reservatório Principal',
      capacityLiters: Math.max(50, capacityLiters),
      currentVolumeLiters: Math.min(Math.max(0, currentVolumeLiters), Math.max(50, capacityLiters)),
      currentPH,
      targetPHMin,
      targetPHMax,
      currentEC,
      targetECMin,
      targetECMax,
      solutionTempC,
      dissolvedOxygenPpm,
      pumpStatus,
      lastWaterRefillDate: editing?.lastWaterRefillDate || todayBr,
      lastNutrientAdjustmentDate: todayBr,
      waterConsumptionLitersDay:
        editing?.waterConsumptionLitersDay || Math.round(capacityLiters * 0.15),
      associatedBenches: editing?.associatedBenches || [],
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            {editing ? 'Atualizar Reservatório' : 'Cadastrar Novo Reservatório'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className={HYDRO_LABEL_CLASS}>Nome do Reservatório *</label>
              <input
                type="text"
                required
                placeholder="Ex: Reservatório Central 01 (Folhosas)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={HYDRO_INPUT_CLASS}
              />
            </div>

            <div>
              <label className={HYDRO_LABEL_CLASS}>Capacidade Total (L)</label>
              <input
                type="number"
                min="50"
                step="50"
                required
                value={capacityLiters}
                onChange={(e) => setCapacityLiters(Number(e.target.value) || 0)}
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>
            <div>
              <label className={HYDRO_LABEL_CLASS}>Volume Atual (L)</label>
              <input
                type="number"
                min="0"
                step="10"
                required
                value={currentVolumeLiters}
                onChange={(e) => setCurrentVolumeLiters(Number(e.target.value) || 0)}
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className={HYDRO_LABEL_CLASS}>pH Atual</label>
              <input
                type="number"
                step="0.05"
                min="0"
                max="14"
                value={currentPH}
                onChange={(e) => setCurrentPH(Number(e.target.value) || 0)}
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={HYDRO_LABEL_CLASS}>pH Mín.</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetPHMin}
                  onChange={(e) => setTargetPHMin(Number(e.target.value) || 0)}
                  className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
                />
              </div>
              <div>
                <label className={HYDRO_LABEL_CLASS}>pH Máx.</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetPHMax}
                  onChange={(e) => setTargetPHMax(Number(e.target.value) || 0)}
                  className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
                />
              </div>
            </div>

            <div>
              <label className={HYDRO_LABEL_CLASS}>CE Atual (mS/cm)</label>
              <input
                type="number"
                step="0.05"
                min="0"
                value={currentEC}
                onChange={(e) => setCurrentEC(Number(e.target.value) || 0)}
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={HYDRO_LABEL_CLASS}>CE Mín.</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetECMin}
                  onChange={(e) => setTargetECMin(Number(e.target.value) || 0)}
                  className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
                />
              </div>
              <div>
                <label className={HYDRO_LABEL_CLASS}>CE Máx.</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetECMax}
                  onChange={(e) => setTargetECMax(Number(e.target.value) || 0)}
                  className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
                />
              </div>
            </div>

            <div>
              <label className={HYDRO_LABEL_CLASS}>Temp. Solução (°C)</label>
              <input
                type="number"
                step="0.1"
                value={solutionTempC}
                onChange={(e) => setSolutionTempC(Number(e.target.value) || 0)}
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>
            <div>
              <label className={HYDRO_LABEL_CLASS}>Oxigênio Dissolvido (mg/L)</label>
              <input
                type="number"
                step="0.1"
                value={dissolvedOxygenPpm}
                onChange={(e) => setDissolvedOxygenPpm(Number(e.target.value) || 0)}
                className={`${HYDRO_INPUT_CLASS} font-mono tabular-nums`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={HYDRO_LABEL_CLASS}>Status da Bomba</label>
              <select
                value={pumpStatus}
                onChange={(e) =>
                  setPumpStatus(e.target.value as NutrientSolutionReservoir['pumpStatus'])
                }
                className={HYDRO_INPUT_CLASS}
              >
                <option value="timer">Timer Automático</option>
                <option value="ligada">Ligada (Contínua)</option>
                <option value="em_espera">Em Espera</option>
                <option value="alerta">Em Alerta</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
            >
              {editing ? 'Salvar Alterações' : 'Criar Reservatório'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
