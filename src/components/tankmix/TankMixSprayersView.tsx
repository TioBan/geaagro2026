import React, { useState } from 'react';
import {
  Tractor,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { SprayerEquipment } from '../../types/tankMix';

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
  const [speedKmH, setSpeedKmH] = useState(16);
  const [flowRateLMin, setFlowRateLMin] = useState(0.8);

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
      operatingPressureBar: 3.0,
      operatingSpeedKmH: speedKmH,
      nozzleFlowRateLMin: flowRateLMin,
      applicationRateLHa: calculatedRateLHa,
      filterMesh: 100,
    };

    setSprayers(prev => [...prev, newSprayer]);
    setShowAddModal(false);
    setName('');
  };

  const handleRemoveSprayer = (id: string) => {
    setSprayers(prev => (prev || []).filter(s => s?.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
            Pulverizadores e Calibração de Bicos
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
            {(sprayers || []).length} {(sprayers || []).length === 1 ? 'equipamento cadastrado' : 'equipamentos cadastrados'} · Capacidade, pontas e taxa (L/ha)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>Cadastrar Pulverizador</span>
        </button>
      </div>

      {/* Grade de Pulverizadores */}
      {sprayers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-8 text-center space-y-2.5">
          <Tractor className="w-7 h-7 text-slate-400 dark:text-zinc-500 mx-auto" />
          <p className="text-sm font-medium text-slate-800 dark:text-zinc-200">
            Nenhum pulverizador cadastrado
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Equipamento</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sprayers.map(sprayer => (
            <div
              key={sprayer.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 rounded-xl p-4 transition-colors flex flex-col justify-between gap-3"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {sprayer.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 capitalize tabular-nums">
                      {sprayer.type.replace('_', ' ')} · Tanque {sprayer.tankCapacityLiters} L · Barra {sprayer.boomWidthMeters} m
                    </div>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400 whitespace-nowrap shrink-0">
                    {sprayer.applicationRateLHa} L/ha
                  </span>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 dark:text-zinc-400 shrink-0">Ponta / Bico</span>
                    <span
                      className="font-medium text-slate-800 dark:text-zinc-200 truncate text-right"
                      title={sprayer.nozzleType}
                    >
                      {sprayer.nozzleType}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 dark:text-zinc-400 shrink-0">Pressão / Velocidade</span>
                    <span className="font-medium tabular-nums text-slate-800 dark:text-zinc-200">
                      {sprayer.operatingPressureBar} bar · {sprayer.operatingSpeedKmH} km/h
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 dark:text-zinc-400 shrink-0">Filtro de linha</span>
                    <span className="font-medium tabular-nums text-slate-800 dark:text-zinc-200">
                      Mesh {sprayer.filterMesh}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveSprayer(sprayer.id)}
                  className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center transition-colors cursor-pointer"
                  title="Excluir pulverizador"
                  aria-label={`Excluir ${sprayer.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onSelectSprayerForLab(sprayer)}
                  className="h-7 px-2.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Tractor className="w-3.5 h-3.5 shrink-0" />
                  <span>Usar no Simulador</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Cadastrar Pulverizador */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden max-h-[88vh] flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Cadastrar Equipamento de Pulverização
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 inline-flex items-center justify-center cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Nome / Identificação *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Pulverizador John Deere 4730"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Tipo de equipamento
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as SprayerEquipment['type'])}
                    className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="autopropelido">Autopropelido</option>
                    <option value="barra_tratorizada">Barra tratorizada</option>
                    <option value="turbo_atomizador">Turbo atomizador</option>
                    <option value="costal">Costal manual / elétrico</option>
                    <option value="drone">Drone de pulverização</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Capacidade do tanque (L)
                  </label>
                  <input
                    type="number"
                    value={tankCap}
                    onChange={e => setTankCap(Number(e.target.value))}
                    className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Largura da barra (m)
                  </label>
                  <input
                    type="number"
                    value={boomWidth}
                    onChange={e => setBoomWidth(Number(e.target.value))}
                    className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Modelo da ponta / bico
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: TeeJet TTJ60-11002"
                    value={nozzleType}
                    onChange={e => setNozzleType(e.target.value)}
                    className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Espaçamento dos bicos (cm)
                  </label>
                  <input
                    type="number"
                    value={spacingCm}
                    onChange={e => setSpacingCm(Number(e.target.value))}
                    className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Velocidade operacional (km/h)
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    value={speedKmH}
                    onChange={e => setSpeedKmH(Number(e.target.value))}
                    className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Vazão por bico (L/min)
                  </label>
                  <input
                    type="number"
                    step={0.05}
                    value={flowRateLMin}
                    onChange={e => setFlowRateLMin(Number(e.target.value))}
                    className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="px-4 py-3 rounded-lg border border-emerald-200 dark:border-emerald-800/70 bg-emerald-50/70 dark:bg-emerald-950/30 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                    Taxa de aplicação resultante
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Calculada via fórmula padrão de calibração
                  </div>
                </div>
                <div className="text-base font-semibold tabular-nums text-emerald-800 dark:text-emerald-300">
                  {calculatedRateLHa} L/ha
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddSprayer}
                disabled={!name}
                className="h-8 px-3.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 cursor-pointer"
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
