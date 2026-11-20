import React, { useMemo, useState } from 'react';
import { Droplets, Plus, X } from 'lucide-react';
import { SwineWaterPointCheck } from '../../types/swine';
import {
  SWINE_CARD_CLASS,
  SWINE_INPUT_CLASS,
  SWINE_LABEL_CLASS,
  SWINE_PRIMARY_BTN_CLASS,
  SWINE_SECONDARY_BTN_CLASS,
  formatBrDate,
  getTodayIsoDate,
  getWaterFlowBadgeClass,
  useEscapeClose,
} from './swineUi';

interface SwineWaterManagementViewProps {
  waterLogs: SwineWaterPointCheck[];
  onAddWaterLog: (log: SwineWaterPointCheck) => void;
}

export const SwineWaterManagementView: React.FC<SwineWaterManagementViewProps> = ({
  waterLogs,
  onAddWaterLog,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [shedName, setShedName] = useState('Galpão 01 - Maternidade');
  const [drinkerType, setDrinkerType] =
    useState<SwineWaterPointCheck['drinkerType']>('Chupeta Nipple');
  const [flowRateLMin, setFlowRateLMin] = useState(2.0);
  const [recommendedFlowLMin, setRecommendedFlowLMin] = useState(2.0);
  const [ph, setPh] = useState(7.0);
  const [chlorinePpm, setChlorinePpm] = useState(2.5);
  const [tds, setTds] = useState(150);
  const [operator, setOperator] = useState('');

  useEscapeClose(isModalOpen, () => setIsModalOpen(false));

  const averages = useMemo(() => {
    if (waterLogs.length === 0) {
      return { flow: '—', ph: '—', chlorine: '—', tds: '—' };
    }
    const len = waterLogs.length;
    return {
      flow: `${(waterLogs.reduce((a, w) => a + w.flowRateLMin, 0) / len).toFixed(2)} L/min`,
      ph: (waterLogs.reduce((a, w) => a + w.ph, 0) / len).toFixed(1),
      chlorine: `${(waterLogs.reduce((a, w) => a + w.chlorinePpm, 0) / len).toFixed(1)} ppm`,
      tds: `${Math.round(waterLogs.reduce((a, w) => a + w.totalDissolvedSolidsMgL, 0) / len)} mg/L`,
    };
  }, [waterLogs]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shedName.trim()) return;
    const flow = Number(flowRateLMin) || 0;
    const rec = Number(recommendedFlowLMin) || 1;
    const flowStatus: SwineWaterPointCheck['flowStatus'] =
      flow < rec * 0.8
        ? 'Vazão Baixa'
        : flow > rec * 1.4
          ? 'Vazão Excessiva / Vazamento'
          : 'Adequado';

    const newLog: SwineWaterPointCheck = {
      id: `wat_${Date.now()}`,
      shedId: `shed_${Date.now()}`,
      shedName: shedName.trim(),
      date: getTodayIsoDate(),
      drinkerType,
      flowRateLMin: flow,
      recommendedFlowLMin: rec,
      flowStatus,
      ph: Number(ph) || 7,
      chlorinePpm: Number(chlorinePpm) || 0,
      totalDissolvedSolidsMgL: Number(tds) || 0,
      cleaningDone: true,
      operator: operator.trim() || 'Operador',
    };

    onAddWaterLog(newLog);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${SWINE_CARD_CLASS} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Gestão de Água & Vazão de Bebedouros</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Controle de vazão (L/min), pH, cloração residual e sólidos totais dissolvidos (TDS).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`${SWINE_PRIMARY_BTN_CLASS} shrink-0`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nova Leitura de Água</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Vazão Média
          </span>
          <div className="text-xl font-bold text-sky-600 dark:text-sky-400 mt-0.5 tabular-nums">
            {averages.flow}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">média das checagens</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            pH Médio
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">
            {averages.ph}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Ideal 6,5 – 7,8</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Cloro Residual
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
            {averages.chlorine}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Ideal 2 – 4 ppm</span>
        </div>

        <div className={`${SWINE_CARD_CLASS} p-3.5`}>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Sólidos Dissolvidos (TDS)
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-zinc-100 mt-0.5 tabular-nums">
            {averages.tds}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">Ideal &lt; 1000 mg/L</span>
        </div>
      </div>

      {/* Table */}
      <div className={`${SWINE_CARD_CLASS} overflow-hidden`}>
        <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
            Inspeções de Pontos de Água
          </h3>
          <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
            {waterLogs.length} registro(s)
          </span>
        </div>

        {waterLogs.length === 0 ? (
          <div className="p-10 text-center space-y-1.5">
            <Droplets className="w-7 h-7 text-slate-400 dark:text-zinc-500 mx-auto" />
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Nenhuma inspeção de água registrada
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Registre medições de vazão, pH e cloro livre dos galpões.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-medium">
                <tr>
                  <th className="px-3.5 py-2.5">Galpão</th>
                  <th className="px-3.5 py-2.5">Data</th>
                  <th className="px-3.5 py-2.5">Bebedouro</th>
                  <th className="px-3.5 py-2.5">Vazão</th>
                  <th className="px-3.5 py-2.5">Meta</th>
                  <th className="px-3.5 py-2.5">pH / Cloro / TDS</th>
                  <th className="px-3.5 py-2.5">Operador</th>
                  <th className="px-3.5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {waterLogs.map(log => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-3.5 py-2.5 font-medium text-slate-900 dark:text-zinc-100">
                      {log.shedName}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600 dark:text-zinc-400 tabular-nums">
                      {formatBrDate(log.date)}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-700 dark:text-zinc-300">
                      {log.drinkerType}
                    </td>
                    <td className="px-3.5 py-2.5 font-semibold text-sky-600 dark:text-sky-400 tabular-nums">
                      {log.flowRateLMin} L/min
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-500 dark:text-zinc-400 tabular-nums">
                      {log.recommendedFlowLMin} L/min
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-700 dark:text-zinc-300 tabular-nums">
                      pH {log.ph} · {log.chlorinePpm} ppm · {log.totalDissolvedSolidsMgL} mg/L
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-600 dark:text-zinc-400">
                      {log.operator}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${getWaterFlowBadgeClass(log.flowStatus)}`}
                      >
                        {log.flowStatus}
                      </span>
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
                Registrar Checagem de Água
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
                <label className={SWINE_LABEL_CLASS}>Galpão *</label>
                <input
                  type="text"
                  required
                  value={shedName}
                  onChange={e => setShedName(e.target.value)}
                  className={SWINE_INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className={SWINE_LABEL_CLASS}>Bebedouro</label>
                  <select
                    value={drinkerType}
                    onChange={e =>
                      setDrinkerType(e.target.value as SwineWaterPointCheck['drinkerType'])
                    }
                    className={SWINE_INPUT_CLASS}
                  >
                    <option value="Chupeta Nipple">Chupeta Nipple</option>
                    <option value="Bebedouro Pendular / Taça">Bebedouro Pendular / Taça</option>
                    <option value="Calha Contínua">Calha Contínua</option>
                  </select>
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Vazão Medida (L/min)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={flowRateLMin}
                    onChange={e => setFlowRateLMin(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Meta (L/min)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    value={recommendedFlowLMin}
                    onChange={e => setRecommendedFlowLMin(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className={SWINE_LABEL_CLASS}>pH</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={ph}
                    onChange={e => setPh(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>Cloro (ppm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={chlorinePpm}
                    onChange={e => setChlorinePpm(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={SWINE_LABEL_CLASS}>TDS (mg/L)</label>
                  <input
                    type="number"
                    min="0"
                    value={tds}
                    onChange={e => setTds(Number(e.target.value))}
                    className={SWINE_INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label className={SWINE_LABEL_CLASS}>Operador Responsável</label>
                <input
                  type="text"
                  placeholder="Nome do responsável"
                  value={operator}
                  onChange={e => setOperator(e.target.value)}
                  className={SWINE_INPUT_CLASS}
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
                  Salvar Leitura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
