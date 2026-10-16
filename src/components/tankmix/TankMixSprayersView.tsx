import React, { useState } from 'react';
import {
  Tractor,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Gauge,
  Zap,
} from 'lucide-react';
import { SprayerEquipment } from '../../types/tankMix';
import { DEFAULT_SPRAYERS } from '../../data/tankMixData';

interface Props {
  sprayers: SprayerEquipment[];
  setSprayers: React.Dispatch<React.SetStateAction<SprayerEquipment[]>>;
  onSelectSprayerForLab: (sprayer: SprayerEquipment) => void;
}

export const TankMixSprayersView: React.FC<Props> = ({
  sprayers,
  setSprayers,
  onSelectSprayerForLab,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<SprayerEquipment['type']>('autopropelido');
  const [tankCap, setTankCap] = useState(3000);
  const [boomWidth, setBoomWidth] = useState(30);
  const [nozzleType, setNozzleType] = useState('Leque com Indução de Ar 110-02');
  const [spacingCm, setSpacingCm] = useState(50);
  const [pressureBar, setPressureBar] = useState(3.0);
  const [speedKmH, setSpeedKmH] = useState(16);
  const [flowRateLMin, setFlowRateLMin] = useState(0.8);
  const [filterMesh, setFilterMesh] = useState(100);

  // Calculate Application Rate in L/ha:
  // Taxa (L/ha) = (Vazao_bico (L/min) * 60.000) / (Velocidade (km/h) * Espacamento (cm))
  const calculatedRateLHa =
    speedKmH > 0 && spacingCm > 0
      ? Number(((flowRateLMin * 60000) / (speedKmH * spacingCm)).toFixed(1))
      : 100;

  const handleAddSprayer = () => {
    if (!name) return;
    const newSprayer: SprayerEquipment = {
      id: `sprayer_${Date.now()}`,
      name,
      type,
      tankCapacityLiters: tankCap,
      boomWidthMeters: boomWidth,
      nozzleType,
      nozzleSpacingCm: spacingCm,
      operatingPressureBar: pressureBar,
      operatingSpeedKmH: speedKmH,
      nozzleFlowRateLMin: flowRateLMin,
      applicationRateLHa: calculatedRateLHa,
      filterMesh,
    };

    setSprayers(prev => [...prev, newSprayer]);
    setShowAddModal(false);
    setName('');
  };

  const handleRemoveSprayer = (id: string) => {
    setSprayers(prev => (prev || []).filter(s => s?.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Maquinário & Calibração de Bicos
            </span>
            <span className="text-xs text-gray-500">• {(sprayers || []).length} Equipamentos Cadastrados</span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mt-1">Cadastro & Calibração de Pulverizadores</h1>
          <p className="text-xs text-gray-600 mt-1">
            Configure a capacidade de tanque, tipos de bicos, pressão de trabalho, velocidade operacional e taxa de aplicação (L/ha).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Pulverizador</span>
        </button>
      </div>

      {/* Sprayers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sprayers.map(sprayer => (
          <div
            key={sprayer.id}
            className="bg-white p-5 rounded-2xl border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-bold bg-purple-50 text-purple-800 px-2.5 py-0.5 rounded capitalize">
                  {sprayer.type.replace('_', ' ')}
                </span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {sprayer.applicationRateLHa} L/ha
                </span>
              </div>

              <h2 className="font-extrabold text-gray-900 text-base">{sprayer.name}</h2>
              <div className="text-xs text-gray-500 mt-1">
                Tanque: <strong className="text-gray-900">{sprayer.tankCapacityLiters} L</strong> • Barra:{' '}
                <strong className="text-gray-900">{sprayer.boomWidthMeters}m</strong>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Modelo do Bico:</span>
                  <span className="font-bold text-gray-800 truncate max-w-[150px]" title={sprayer.nozzleType}>
                    {sprayer.nozzleType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pressão / Velocidade:</span>
                  <span className="font-bold text-gray-800">
                    {sprayer.operatingPressureBar} bar • {sprayer.operatingSpeedKmH} km/h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Filtro de Linha:</span>
                  <span className="font-bold text-purple-700">Mesh {sprayer.filterMesh}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleRemoveSprayer(sprayer.id)}
                className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                title="Excluir pulverizador"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectSprayerForLab(sprayer)}
                className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Tractor className="w-3.5 h-3.5" />
                <span>Usar no Simulador</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Cadastrar Pulverizador */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 text-base">Cadastrar Equipamento de Pulverização</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Nome / Identificação *</label>
                <input
                  type="text"
                  placeholder="Ex: Pulverizador John Deere 4730"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tipo de Equipamento</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as SprayerEquipment['type'])}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="autopropelido">Autopropelido</option>
                  <option value="barra_tratorizada">Barra Tratorizada</option>
                  <option value="turbo_atomizador">Turbo Atomizador</option>
                  <option value="costal">Costal Manual / Elétrico</option>
                  <option value="drone">Drone de Pulverização</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Capacidade do Tanque (L)</label>
                <input
                  type="number"
                  value={tankCap}
                  onChange={e => setTankCap(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Largura da Barra (m)</label>
                <input
                  type="number"
                  value={boomWidth}
                  onChange={e => setBoomWidth(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Modelo da Ponta / Bico</label>
                <input
                  type="text"
                  placeholder="Ex: TeeJet TTJ60-11002"
                  value={nozzleType}
                  onChange={e => setNozzleType(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Espaçamento dos Bicos (cm)</label>
                <input
                  type="number"
                  value={spacingCm}
                  onChange={e => setSpacingCm(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Velocidade Operacional (km/h)</label>
                <input
                  type="number"
                  step={0.5}
                  value={speedKmH}
                  onChange={e => setSpeedKmH(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Vazão por Bico (L/min)</label>
                <input
                  type="number"
                  step={0.05}
                  value={flowRateLMin}
                  onChange={e => setFlowRateLMin(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Calculated Rate Result Box */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-900">Taxa de Aplicação Resultante:</div>
                <div className="text-[11px] text-emerald-700">Calculada via fórmula padrão de calibração</div>
              </div>
              <div className="text-lg font-black text-emerald-800">{calculatedRateLHa} L/ha</div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSprayer}
                disabled={!name}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                Salvar Pulverizador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
