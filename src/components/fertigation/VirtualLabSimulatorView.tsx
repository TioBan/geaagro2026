import React, { useState } from 'react';
import {
  FlaskConical,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Droplets,
  Thermometer,
  ShieldAlert,
  Sliders,
  Printer,
  Sparkles,
  Info,
  RotateCcw,
} from 'lucide-react';
import {
  FertilizerItem,
  CompatibilityPairRule,
  WaterQualityProfile,
} from '../../types/fertigation';
import { FERTILIZERS_DATABASE, WATER_QUALITY_PRESETS } from '../../data/fertigationData';

interface TankFertilizerEntry {
  fertilizerId: string;
  doseKg: number;
}

interface VirtualLabSimulatorViewProps {
  tankVolumeLiters: number;
  setTankVolumeLiters: (vol: number) => void;
  tankTemperatureC: number;
  setTankTemperatureC: (temp: number) => void;
  selectedWaterId: string;
  setSelectedWaterId: (id: string) => void;
  tankFertilizers: TankFertilizerEntry[];
  setTankFertilizers: React.Dispatch<React.SetStateAction<TankFertilizerEntry[]>>;
  tankCalculation: {
    items: {
      fertilizerId: string;
      doseKg: number;
      fertilizer: FertilizerItem;
      concentrationGL: number;
    }[];
    totalKg: number;
    totalGL: number;
    detectedIncompatibilities: CompatibilityPairRule[];
    ppmTotals: Record<string, number>;
    estimatedCe: number;
    estimatedPh: number;
    hasIncompatibility: boolean;
    safetyStatus: 'segura' | 'atencao' | 'nao_recomendada';
  };
  onAutoSeparateTanks: () => void;
  showNotification: (msg: string) => void;
  onOpenRuleDetail: (rule: CompatibilityPairRule) => void;
}

export const VirtualLabSimulatorView: React.FC<VirtualLabSimulatorViewProps> = ({
  tankVolumeLiters,
  setTankVolumeLiters,
  tankTemperatureC,
  setTankTemperatureC,
  selectedWaterId,
  setSelectedWaterId,
  tankFertilizers,
  setTankFertilizers,
  tankCalculation,
  onAutoSeparateTanks,
  showNotification,
  onOpenRuleDetail,
}) => {
  const [selectedFertToAdd, setSelectedFertToAdd] = useState<string>('mkp');
  const [doseToAddKg, setDoseToAddKg] = useState<number>(15.0);
  const [isSimulatingAgitation, setIsSimulatingAgitation] = useState<boolean>(false);

  const handleAddFertilizer = () => {
    if (tankFertilizers.some(f => f.fertilizerId === selectedFertToAdd)) {
      showNotification('Este fertilizante já está no tanque. Você pode editar a dosagem diretamente.');
      return;
    }
    setTankFertilizers(prev => [...prev, { fertilizerId: selectedFertToAdd, doseKg: doseToAddKg }]);
    showNotification('Fertilizante inserido na calda com sucesso.');
  };

  const handleRemoveFertilizer = (id: string) => {
    setTankFertilizers(prev => prev.filter(f => f.fertilizerId !== id));
  };

  const handleUpdateDose = (id: string, dose: number) => {
    setTankFertilizers(prev =>
      prev.map(f => (f.fertilizerId === id ? { ...f, doseKg: Math.max(0.1, dose) } : f))
    );
  };

  const triggerAgitation = () => {
    setIsSimulatingAgitation(true);
    setTimeout(() => {
      setIsSimulatingAgitation(false);
      showNotification('Homogeneização física da calda concluída.');
    }, 2000);
  };

  // Determine liquid tint based on ingredients
  const hasIronEddha = tankCalculation.items.some(it => it.fertilizerId === 'fe_eddha');
  const hasIronEdta = tankCalculation.items.some(it => it.fertilizerId === 'fe_edta' || it.fertilizerId === 'fe_dtpa');
  const hasCopper = tankCalculation.items.some(it => it.fertilizerId === 'sulfato_cobre' || it.fertilizerId === 'cu_edta');
  const hasNickelOrPoly = tankCalculation.items.some(it => it.fertilizerId === 'polifosfato_amonio' || it.fertilizerId === 'sulfato_niquel');

  let liquidGradient = 'from-emerald-600/80 via-teal-500/70 to-cyan-400/50';
  if (tankCalculation.hasIncompatibility) {
    liquidGradient = 'from-rose-700/90 via-amber-700/80 to-rose-500/60';
  } else if (hasIronEddha) {
    liquidGradient = 'from-amber-950/90 via-amber-800/80 to-red-900/60';
  } else if (hasIronEdta) {
    liquidGradient = 'from-amber-600/80 via-yellow-600/70 to-amber-400/50';
  } else if (hasCopper) {
    liquidGradient = 'from-blue-600/80 via-cyan-500/70 to-teal-400/50';
  } else if (hasNickelOrPoly) {
    liquidGradient = 'from-emerald-700/90 via-green-600/80 to-teal-500/60';
  }

  return (
    <div className="space-y-6 animate-fade-in" id="virtual-lab-simulator">
      {/* Top Configuration Bar: Tank Volume, Temp, Water Profile */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-emerald-600" />
              Volume do Tanque Digital:
            </label>
            <select
              value={tankVolumeLiters}
              onChange={e => setTankVolumeLiters(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white"
            >
              <option value={100}>100 Litros (Tanque Piloto / Estufa)</option>
              <option value={500}>500 Litros (Médio Porte)</option>
              <option value={1000}>1.000 Litros (Padrão Comercial)</option>
              <option value={2000}>2.000 Litros (Grande Porte)</option>
              <option value={5000}>5.000 Litros (Pivô Central / Macrotanque)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-500" />
              Temperatura da Água:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={5}
                max={45}
                value={tankTemperatureC}
                onChange={e => setTankTemperatureC(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 w-12 text-right">
                {tankTemperatureC}°C
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-500" />
              Qualidade da Água de Irrigação:
            </label>
            <select
              value={selectedWaterId}
              onChange={e => setSelectedWaterId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white truncate"
            >
              {WATER_QUALITY_PRESETS.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} (pH {w.ph})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Critical Incompatibility Alert Banner (When detected) */}
      {tankCalculation.hasIncompatibility && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500 rounded-2xl p-5 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 animate-bounce" />
              <h3 className="font-black text-base">
                ⚠️ ALERTA QUÍMICO: PRECIPITAÇÃO DETECTADA NA CALDA!
              </h3>
            </div>
            <button
              onClick={onAutoSeparateTanks}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              Auto-Separar Tanques A & B
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {tankCalculation.detectedIncompatibilities.map((inc, i) => (
              <div
                key={i}
                onClick={() => onOpenRuleDetail(inc)}
                className="bg-white/90 dark:bg-black/60 p-3 rounded-xl border border-rose-300 dark:border-rose-900/60 space-y-1.5 cursor-pointer hover:border-rose-500 transition-all"
              >
                <strong className="block text-rose-700 dark:text-rose-400 font-bold">
                  {inc.technicalReason}
                </strong>
                <div className="text-[11px] text-slate-700 dark:text-zinc-300">
                  • Precipitado: <strong className="text-rose-600">{inc.precipitateFormed}</strong>
                </div>
                {inc.chemicalEquation && (
                  <div className="p-1.5 bg-slate-100 dark:bg-zinc-900 rounded font-mono text-[10px] text-slate-700 dark:text-zinc-300">
                    {inc.chemicalEquation}
                  </div>
                )}
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  ✓ {inc.agronomicRecommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Virtual Lab Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Virtual Tank Simulation, Agitation & PPM Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Virtual Interactive Tank */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-emerald-600" />
                  Tanque Digital GeaAgro ({tankVolumeLiters} L)
                </h3>
                <span className="text-[11px] text-slate-400">
                  {(tankCalculation.items || []).length} insumos • {tankCalculation.totalKg || 0} kg totais
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={triggerAgitation}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                  title="Simular agitação mecânica"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isSimulatingAgitation ? 'animate-spin text-emerald-500' : ''}`} />
                  Homogeneizar
                </button>

                <span
                  className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                    tankCalculation.hasIncompatibility
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {tankCalculation.hasIncompatibility ? '🔴 Precipitação' : '🟢 Solução Homogênea'}
                </span>
              </div>
            </div>

            {/* Tank Physical Visual Graphic with Liquid Simulation */}
            <div className="relative h-56 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl border-4 border-slate-300 dark:border-zinc-800 overflow-hidden flex flex-col justify-end p-4">
              {/* Level Markers on the side */}
              <div className="absolute left-2 top-3 bottom-3 flex flex-col justify-between text-[9px] font-mono text-slate-400 pointer-events-none select-none z-10">
                <span>{tankVolumeLiters} L (100%)</span>
                <span>{(tankVolumeLiters * 0.75).toFixed(0)} L (75%)</span>
                <span>{(tankVolumeLiters * 0.5).toFixed(0)} L (50%)</span>
                <span>{(tankVolumeLiters * 0.25).toFixed(0)} L (25%)</span>
              </div>

              {/* Liquid Level and Dissolution Animation */}
              <div
                className={`w-full rounded-xl transition-all duration-700 flex flex-col justify-between p-3.5 bg-gradient-to-t ${liquidGradient} ${
                  isSimulatingAgitation ? 'animate-pulse' : ''
                }`}
                style={{
                  height: `${Math.min(95, Math.max(35, (tankCalculation.totalGL / 180) * 100))}%`,
                }}
              >
                {/* Wave / Surface header */}
                <div className="flex justify-between items-center text-white text-[11px] font-bold drop-shadow-xs">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5" />
                    Calda em Dissolução
                  </span>
                  <span>{tankCalculation.totalGL.toFixed(1)} g / L</span>
                </div>

                {/* Center Status Badge */}
                <div className="text-center text-white font-black text-sm tracking-wide drop-shadow-md">
                  {tankCalculation.hasIncompatibility ? (
                    <span className="bg-black/70 px-4 py-1.5 rounded-full border border-rose-400 flex items-center justify-center gap-1.5 w-fit mx-auto">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      CRISTAIS INSOLÚVEIS NO FUNDO (PRECIPITADO)
                    </span>
                  ) : (
                    <span className="bg-black/50 px-4 py-1.5 rounded-full border border-emerald-400/50 flex items-center justify-center gap-1.5 w-fit mx-auto">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      100% SOLUBILIZADO EM ÁGUA ({tankTemperatureC}°C)
                    </span>
                  )}
                </div>

                {/* Bottom Footer Info inside liquid */}
                <div className="flex justify-between items-center text-white text-[10px] font-medium drop-shadow-xs">
                  <span>CE: {tankCalculation.estimatedCe.toFixed(2)} mS/cm</span>
                  <span>pH: {tankCalculation.estimatedPh.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Complete PPM Breakdown for all 14 Nutrients */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <strong className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Balanço Nutricional da Solução (mg/L ou PPM):
                </strong>
                <span className="text-[10px] text-slate-400">Total de 14 Elementos Calculados</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center text-xs">
                {Object.entries(tankCalculation.ppmTotals).map(([nut, ppm]) => {
                  const val = Number(ppm);
                  return (
                    <div
                      key={nut}
                      className={`p-2 rounded-xl border ${
                        val > 0
                          ? 'bg-emerald-50/60 dark:bg-zinc-800/80 border-emerald-200/70 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200'
                          : 'bg-slate-50/50 dark:bg-zinc-900 border-slate-200/50 dark:border-zinc-800 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] font-black block uppercase">{nut}</span>
                      <strong className="text-xs block font-bold mt-0.5">
                        {val > 0 ? (val < 1 ? val.toFixed(2) : Math.round(val)) : '0'}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Official Step-by-Step Mixing Protocol Order */}
          <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 space-y-3 text-xs">
            <strong className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              Protocolo Técnico da Ordem Correta de Adição:
            </strong>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-zinc-300">
              <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 space-y-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">1º Passo (Base H₂O):</span>
                <span>Abastecer 70% a 80% do volume de água no tanque antes de qualquer adubo.</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 space-y-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">2º Passo (Acidificação):</span>
                <span>Adicionar ácidos ou corretores se necessário para condicionar o pH antes dos sais.</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 space-y-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">3º Passo (Quelatos de Fe):</span>
                <span>Pré-diluir os quelatos de ferro (EDTA/DTPA/EDDHA) e homogeneizar sob agitação.</span>
              </div>
              <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200/60 dark:border-zinc-700/60 space-y-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">4º Passo (Macronutrientes):</span>
                <span>Adicionar sais de alta solubilidade lentamente (MAP, Nitratos, Sulfatos em tanques próprios).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fertilizer Manager in Tank (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              Adicionar Fertilizante ao Tanque
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Fertilizante Técnico:</label>
                <select
                  value={selectedFertToAdd}
                  onChange={e => setSelectedFertToAdd(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white truncate"
                >
                  {FERTILIZERS_DATABASE.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.group.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">Dose Total no Tanque (kg):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={doseToAddKg}
                    onChange={e => setDoseToAddKg(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-2.5 font-bold text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={handleAddFertilizer}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl shrink-0 cursor-pointer shadow-xs"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* List of Added Fertilizers in Tank */}
            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <div className="flex justify-between items-center">
                <strong className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  Composição Atual ({tankFertilizers.length} insumos):
                </strong>
                <span className="text-[10px] text-slate-400">Total: {tankCalculation.totalKg} kg</span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {(tankCalculation.items || []).length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                    Nenhum fertilizante no tanque. Adicione acima para simular.
                  </div>
                ) : (
                  (tankCalculation.items || []).map(it => (
                    <div
                      key={it.fertilizerId}
                      className="p-3 bg-slate-50 dark:bg-zinc-800/70 rounded-xl border border-slate-200/70 dark:border-zinc-700/60 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-900 dark:text-white truncate block font-bold">
                            {it.fertilizer.name}
                          </strong>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-mono">
                            {it.fertilizer.defaultTank}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>{it.concentrationGL.toFixed(1)} g/L</span>
                          <span>•</span>
                          <span>Solub: {it.fertilizer.solubilityAt20C_gL} g/L</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="number"
                          step="0.5"
                          min="0.1"
                          value={it.doseKg}
                          onChange={e => handleUpdateDose(it.fertilizerId, parseFloat(e.target.value) || 0.1)}
                          className="w-16 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-1.5 font-bold text-center text-xs"
                        />
                        <span className="text-[10px] text-slate-400 font-bold">kg</span>
                        <button
                          onClick={() => handleRemoveFertilizer(it.fertilizerId)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
