import React, { useState } from 'react';
import {
  Droplets,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Gauge,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  SwineWaterPointCheck,
} from '../../types/swine';

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
  const [shedName, setShedName] = useState('Galpão 01 - Maternidade A');
  const [drinkerType, setDrinkerType] = useState<SwineWaterPointCheck['drinkerType']>('Chupeta Nipple');
  const [flowRateLMin, setFlowRateLMin] = useState(2.2);
  const [recommendedFlowLMin, setRecommendedFlowLMin] = useState(2.0);
  const [ph, setPh] = useState(6.8);
  const [chlorinePpm, setChlorinePpm] = useState(2.5);
  const [tds, setTds] = useState(140);
  const [operator, setOperator] = useState('João Batista');

  const avgFlowRate =
    (waterLogs || []).length > 0
      ? (
          waterLogs.reduce((acc, w) => acc + w.flowRateLMin, 0) /
          (waterLogs || []).length
        ).toFixed(2)
      : '2.10';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: SwineWaterPointCheck = {
      id: `wat_${Date.now()}`,
      shedId: `shed_${Date.now()}`,
      shedName,
      date: new Date().toISOString().split('T')[0],
      drinkerType,
      flowRateLMin: Number(flowRateLMin),
      recommendedFlowLMin: Number(recommendedFlowLMin),
      flowStatus: flowRateLMin < recommendedFlowLMin * 0.8 ? 'Vazão Baixa' : 'Adequado',
      ph: Number(ph),
      chlorinePpm: Number(chlorinePpm),
      totalDissolvedSolidsMgL: Number(tds),
      cleaningDone: true,
      operator,
    };

    onAddWaterLog(newLog);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            <span>Gestão de Água & Hidratação de Precisão</span>
          </h2>
          <p className="text-xs text-gray-500">
            Monitoramento de vazão de bebedouros (chupetas/nipples e taças), pH, cloração e sólidos totais dissolvidos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Leitura de Ponto de Água</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Vazão Média Medida</span>
          <div className="text-2xl font-black text-blue-600 mt-1">{avgFlowRate} L/min</div>
          <span className="text-[11px] text-gray-400">Padrão regulado</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">pH Médio da Água</span>
          <div className="text-2xl font-black text-gray-900 mt-1">6.8</div>
          <span className="text-[11px] text-emerald-600 font-medium">Faixa Ideal (6.5 - 7.5)</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Cloro Residual Livre</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">2.6 ppm</div>
          <span className="text-[11px] text-emerald-600 font-medium">Potabilidade garantida</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-semibold block">Sólidos Dissolvidos (TDS)</span>
          <div className="text-2xl font-black text-gray-900 mt-1">140 mg/L</div>
          <span className="text-[11px] text-gray-400">&lt; 1000 mg/L (Excelente)</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Inspeções de Pontos de Água e Bebedouros
          </h3>
          <span className="text-xs text-gray-400 font-medium">{(waterLogs || []).length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5">Galpão</th>
                <th className="p-3.5">Data</th>
                <th className="p-3.5">Tipo de Bebedouro</th>
                <th className="p-3.5">Vazão Medida</th>
                <th className="p-3.5">Meta Vazão</th>
                <th className="p-3.5">pH / Cloro</th>
                <th className="p-3.5">Operador</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {waterLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/50">
                  <td className="p-3.5 font-bold text-gray-900">{log.shedName}</td>
                  <td className="p-3.5 text-gray-600">{log.date}</td>
                  <td className="p-3.5 text-gray-700">{log.drinkerType}</td>
                  <td className="p-3.5 font-bold text-blue-700">{log.flowRateLMin} L/min</td>
                  <td className="p-3.5 text-gray-500">{log.recommendedFlowLMin} L/min</td>
                  <td className="p-3.5 font-medium text-gray-800">
                    pH {log.ph} • {log.chlorinePpm} ppm
                  </td>
                  <td className="p-3.5 text-gray-600">{log.operator}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.flowStatus === 'Adequado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.flowStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-gray-900">Registrar Checagem de Água</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Galpão *</label>
                <input
                  type="text"
                  required
                  value={shedName}
                  onChange={e => setShedName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Tipo de Bebedouro</label>
                  <select
                    value={drinkerType}
                    onChange={e => setDrinkerType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="Chupeta Nipple">Chupeta Nipple</option>
                    <option value="Bebedouro Pendular / Taça">Bebedouro Pendular / Taça</option>
                    <option value="Calha Contínua">Calha Contínua</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Vazão (L/min)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={flowRateLMin}
                    onChange={e => setFlowRateLMin(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">pH da Água</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ph}
                    onChange={e => setPh(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Cloro Residual (ppm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={chlorinePpm}
                    onChange={e => setChlorinePpm(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Operador Responsável</label>
                <input
                  type="text"
                  value={operator}
                  onChange={e => setOperator(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-pink-600 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
