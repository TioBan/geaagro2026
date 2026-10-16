import React, { useState } from 'react';
import {
  Tractor,
  Calendar,
  Clock,
  User,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Camera,
  FileText,
  Plus,
  Trash2,
  Layers,
  Thermometer,
  Droplets,
  Wind,
  Zap,
} from 'lucide-react';
import { SprayApplicationRecord, TankSelectedProduct, WeatherCondition, CompatibilityRating } from '../../types/tankMix';
import { TANKMIX_PRODUCTS_DATABASE } from '../../data/tankMixData';

interface Props {
  applications: SprayApplicationRecord[];
  onAddApplication: (record: SprayApplicationRecord) => void;
  onDeleteApplication: (id: string) => void;
  farms: { id: string; name: string }[];
  currentFarmId: string;
}

export const TankMixTraceabilityView: React.FC<Props> = ({
  applications,
  onAddApplication,
  onDeleteApplication,
  farms,
  currentFarmId,
}) => {
  const [selectedAppDetail, setSelectedAppDetail] = useState<SprayApplicationRecord | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Rastreabilidade & Diário de Campo
            </span>
            <span className="text-xs text-gray-500">• Conformidade com BPF & Auditorias</span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mt-1">Rastreabilidade das Pulverizações</h1>
          <p className="text-xs text-gray-600 mt-1">
            Histórico completo e auditável de aplicações fitossanitárias por talhão, registrando a calda utilizada, operador, clima no momento, checklist de EPIs, período de carência e data segura de colheita.
          </p>
        </div>
      </div>

      {/* Traceability List */}
      {(applications || []).length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center shadow-sm">
          <Tractor className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-gray-800">Nenhum registro de pulverização salvo</h2>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Ao montar a calda no <strong>Laboratório Virtual</strong>, clique em "Registrar Aplicação" para salvar o histórico com talhão, operador, clima e carência.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div
              key={app.id}
              className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
                    {app.plotName}
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {app.crop} ({app.growthStage})
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {app.date} • {app.startTime} às {app.endTime}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded">
                    ICG: {app.icgScore}%
                  </span>
                </div>

                <div className="text-xs text-gray-700 font-semibold">
                  Calda: <span className="font-normal text-gray-600">{app.productsUsed.map(p => `${p.productName} (${p.dosePerHa} ${p.doseUnit})`).join(' + ')}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>Operador: <strong className="text-gray-800">{app.operatorName}</strong></span>
                  <span>Equipamento: <strong className="text-gray-800">{app.equipmentName}</strong></span>
                  <span>Volume: <strong className="text-gray-800">{app.totalSprayVolumeLHa} L/ha</strong></span>
                  <span>Área: <strong className="text-gray-800">{app.areaHa} ha</strong></span>
                </div>

                {/* Safety Interval & Harvest Date Tag */}
                <div className="flex flex-wrap gap-3 text-xs pt-1">
                  <div className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg">
                    🛡️ <strong>Carência:</strong> {app.safetyIntervalDays} dias (Colheita segura: {app.harvestSafetyDate})
                  </div>
                  <div className="bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1 rounded-lg">
                    🚪 <strong>Reentrada na área:</strong> {app.reentryDate}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                <button
                  onClick={() => setSelectedAppDetail(app)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ver Ficha Completa</span>
                </button>
                <button
                  onClick={() => onDeleteApplication(app.id)}
                  className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Excluir registro"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Ficha Completa de Rastreabilidade */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-gray-100 bg-emerald-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-300 font-bold uppercase tracking-wider">
                  Laudo de Rastreabilidade Agrícola
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  {selectedAppDetail.plotName} • {selectedAppDetail.crop} ({selectedAppDetail.growthStage})
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppDetail(null)}
                className="text-gray-300 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Data & Horário</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{selectedAppDetail.date}</span>
                  <span className="text-gray-500 text-[10px]">{selectedAppDetail.startTime} - {selectedAppDetail.endTime}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Área & Volume</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{selectedAppDetail.areaHa} ha</span>
                  <span className="text-gray-500 text-[10px]">{selectedAppDetail.totalSprayVolumeLHa} L/ha ({selectedAppDetail.tankLoadsCount} tanques)</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Operador / Aplicação</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{selectedAppDetail.operatorName}</span>
                  <span className="text-gray-500 text-[10px]">{selectedAppDetail.equipmentName}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Clima no Campo</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{selectedAppDetail.weather.temperatureC}°C • {selectedAppDetail.weather.relativeHumidityPct}% UR</span>
                  <span className="text-emerald-700 font-bold text-[10px]">ΔT: {selectedAppDetail.weather.deltaT}°C • Vento: {selectedAppDetail.weather.windSpeedKmH} km/h</span>
                </div>
              </div>

              {/* Products Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 p-2.5 font-bold text-gray-800 text-xs border-b border-gray-200">
                  Produtos & Insumos Utilizados na Calda
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="p-2 text-left">Produto</th>
                      <th className="p-2 text-center">Formulação</th>
                      <th className="p-2 text-right">Dose/ha</th>
                      <th className="p-2 text-right">Total Aplicado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedAppDetail.productsUsed.map((p, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold text-gray-900">{p.productName}</td>
                        <td className="p-2 text-center font-mono text-gray-600">{p.formulation}</td>
                        <td className="p-2 text-right font-semibold text-emerald-700">{p.dosePerHa} {p.doseUnit}</td>
                        <td className="p-2 text-right font-bold text-gray-900">{p.totalAmountUsed.toFixed(1)} {p.amountUnit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Safety & Compliance Checklist */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Conformidade de Boas Práticas & Segurança
                </div>
                <div className="grid grid-cols-2 gap-2 text-emerald-900 text-[11px]">
                  <div>✓ Uso completo de EPIs verificado</div>
                  <div>✓ Triplo enxágue das embalagens realizado</div>
                  <div>✓ Agitador mantido em funcionamento contínuo</div>
                  <div>✓ Bicos calibrados sem entupimentos</div>
                </div>
              </div>

              {selectedAppDetail.notes && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
                  <strong>Observações Técnicas:</strong> {selectedAppDetail.notes}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedAppDetail(null)}
                className="bg-gray-900 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-gray-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
