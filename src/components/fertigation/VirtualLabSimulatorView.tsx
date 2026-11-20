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
  RotateCcw,
} from 'lucide-react';
import {
  FertilizerItem,
  CompatibilityPairRule,
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
      showNotification('Este fertilizante já está no tanque. Edite a dosagem diretamente na lista.');
      return;
    }
    setTankFertilizers(prev => [...prev, { fertilizerId: selectedFertToAdd, doseKg: doseToAddKg }]);
    showNotification('Fertilizante inserido na calda.');
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
    }, 1500);
  };

  const hasIronEddha = tankCalculation.items.some(it => it.fertilizerId === 'fe_eddha');
  const hasIronEdta = tankCalculation.items.some(
    it => it.fertilizerId === 'fe_edta' || it.fertilizerId === 'fe_dtpa'
  );
  const hasCopper = tankCalculation.items.some(
    it => it.fertilizerId === 'sulfato_cobre' || it.fertilizerId === 'cu_edta'
  );
  const hasNickelOrPoly = tankCalculation.items.some(
    it => it.fertilizerId === 'polifosfato_amonio' || it.fertilizerId === 'sulfato_niquel'
  );

  let liquidSurface = 'bg-emerald-600/80 dark:bg-emerald-700/75';
  if (tankCalculation.hasIncompatibility) {
    liquidSurface = 'bg-rose-700/85 dark:bg-rose-800/85';
  } else if (hasIronEddha) {
    liquidSurface = 'bg-amber-900/85';
  } else if (hasIronEdta) {
    liquidSurface = 'bg-amber-600/80';
  } else if (hasCopper) {
    liquidSurface = 'bg-sky-600/80';
  } else if (hasNickelOrPoly) {
    liquidSurface = 'bg-teal-700/80';
  }

  return (
    <div className="space-y-5" id="virtual-lab-simulator">
      {/* Faixa de Configuração do Tanque */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800">
        <div className="p-3.5 space-y-1.5">
          <label
            htmlFor="fert-tank-vol"
            className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1.5"
          >
            <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Volume do tanque</span>
          </label>
          <select
            id="fert-tank-vol"
            value={tankVolumeLiters}
            onChange={e => setTankVolumeLiters(Number(e.target.value))}
            className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            <option value={100}>100 L · Piloto / Estufa</option>
            <option value={500}>500 L · Médio porte</option>
            <option value={1000}>1.000 L · Padrão comercial</option>
            <option value={2000}>2.000 L · Grande porte</option>
            <option value={5000}>5.000 L · Pivô / Macrotanque</option>
          </select>
        </div>

        <div className="p-3.5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="fert-tank-temp"
              className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1.5"
            >
              <Thermometer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Temperatura da água</span>
            </label>
            <span className="text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
              {tankTemperatureC} °C
            </span>
          </div>
          <input
            id="fert-tank-temp"
            type="range"
            min={5}
            max={45}
            value={tankTemperatureC}
            onChange={e => setTankTemperatureC(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

        <div className="p-3.5 space-y-1.5">
          <label
            htmlFor="fert-water-profile"
            className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1.5"
          >
            <Droplets className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            <span>Água de irrigação</span>
          </label>
          <select
            id="fert-water-profile"
            value={selectedWaterId}
            onChange={e => setSelectedWaterId(e.target.value)}
            className="w-full h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            {WATER_QUALITY_PRESETS.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} (pH {w.ph})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerta de Incompatibilidade Química */}
      {tankCalculation.hasIncompatibility && (
        <div className="bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-800/80 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-rose-50/80 dark:bg-rose-950/35 border-b border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span className="text-xs font-semibold">
                Alerta químico: precipitação detectada na calda ({tankCalculation.detectedIncompatibilities.length}{' '}
                {tankCalculation.detectedIncompatibilities.length === 1 ? 'interação' : 'interações'})
              </span>
            </div>
            <button
              type="button"
              onClick={onAutoSeparateTanks}
              className="h-8 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Separar Tanques A &amp; B</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
            {tankCalculation.detectedIncompatibilities.map((inc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onOpenRuleDetail(inc)}
                className="w-full p-3.5 text-left hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors space-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-rose-700 dark:text-rose-400">
                    {inc.technicalReason}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap shrink-0">
                    Ver parecer
                  </span>
                </div>
                {inc.precipitateFormed && (
                  <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                    Precipitado: <strong className="text-rose-700 dark:text-rose-400">{inc.precipitateFormed}</strong>
                  </div>
                )}
                {inc.chemicalEquation && (
                  <div className="font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                    {inc.chemicalEquation}
                  </div>
                )}
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  {inc.agronomicRecommendation}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Workspace Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Esquerda (7 cols): Tanque Visual + PPM + Protocolo */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  Tanque Digital ({tankVolumeLiters} L)
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                  {(tankCalculation.items || []).length} insumos · {tankCalculation.totalKg.toFixed(1)} kg totais
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    tankCalculation.hasIncompatibility
                      ? 'text-rose-700 dark:text-rose-400'
                      : 'text-emerald-700 dark:text-emerald-400'
                  }`}
                >
                  {tankCalculation.hasIncompatibility ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Precipitação</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Homogênea</span>
                    </>
                  )}
                </span>

                <button
                  type="button"
                  onClick={triggerAgitation}
                  className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Simular agitação mecânica"
                >
                  <RotateCcw
                    className={`w-3.5 h-3.5 ${isSimulatingAgitation ? 'animate-spin text-emerald-600' : ''}`}
                  />
                  <span>Homogeneizar</span>
                </button>
              </div>
            </div>

            {/* Simulação Visual do Tanque */}
            <div className="p-4">
              <div className="relative h-52 bg-slate-100 dark:bg-zinc-950 rounded-xl border border-slate-300 dark:border-zinc-700 overflow-hidden flex flex-col justify-end p-3">
                <div className="absolute left-2.5 top-2.5 bottom-2.5 flex flex-col justify-between text-[10px] font-mono tabular-nums text-slate-400 dark:text-zinc-500 pointer-events-none select-none z-10">
                  <span>{tankVolumeLiters} L</span>
                  <span>{(tankVolumeLiters * 0.75).toFixed(0)} L</span>
                  <span>{(tankVolumeLiters * 0.5).toFixed(0)} L</span>
                  <span>{(tankVolumeLiters * 0.25).toFixed(0)} L</span>
                </div>

                <div
                  className={`w-full rounded-lg transition-all duration-500 flex flex-col justify-between p-3 text-white ${liquidSurface}`}
                  style={{
                    height: `${Math.min(95, Math.max(36, (tankCalculation.totalGL / 180) * 100))}%`,
                  }}
                >
                  <div className="flex justify-between items-center text-[11px] font-medium pl-12 tabular-nums">
                    <span>Calda em dissolução</span>
                    <span>{tankCalculation.totalGL.toFixed(1)} g/L</span>
                  </div>

                  <div className="text-center text-xs font-semibold flex items-center justify-center gap-1.5 pl-8">
                    {tankCalculation.hasIncompatibility ? (
                      <>
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Cristais insolúveis no fundo (precipitado)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span className="tabular-nums">
                          Solubilizado em água ({tankTemperatureC} °C)
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[11px] opacity-90 pl-12 tabular-nums">
                    <span>CE: {tankCalculation.estimatedCe.toFixed(2)} mS/cm</span>
                    <span>pH: {tankCalculation.estimatedPh.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Balanço Nutricional PPM */}
            <div className="border-t border-slate-100 dark:border-zinc-800">
              <div className="px-4 py-2.5 flex items-center justify-between text-xs bg-slate-50/70 dark:bg-zinc-950/40 border-b border-slate-100 dark:border-zinc-800">
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  Balanço Nutricional da Solução (ppm / mg·L⁻¹)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">12 elementos</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 divide-x divide-y divide-slate-100 dark:divide-zinc-800 text-center">
                {Object.entries(tankCalculation.ppmTotals).map(([nut, ppm]) => {
                  const val = Number(ppm);
                  return (
                    <div
                      key={nut}
                      className={`py-2.5 px-1.5 ${
                        val > 0 ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 block">
                        {nut}
                      </span>
                      <span
                        className={`text-xs font-semibold tabular-nums block mt-0.5 ${
                          val > 0
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-400 dark:text-zinc-600'
                        }`}
                      >
                        {val > 0 ? (val < 1 ? val.toFixed(2) : Math.round(val)) : '0'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Protocolo de Ordem de Adição */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-zinc-800">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                Ordem Técnica de Preparo da Solução
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-slate-100 dark:divide-zinc-800 text-xs">
              {[
                {
                  step: '1',
                  title: 'Base de água (H₂O)',
                  desc: 'Abastecer 70% a 80% do volume de água no tanque antes de qualquer fertilizante.',
                },
                {
                  step: '2',
                  title: 'Acidificação',
                  desc: 'Adicionar ácidos ou corretores de pH primeiro para neutralizar bicarbonatos.',
                },
                {
                  step: '3',
                  title: 'Quelatos de ferro',
                  desc: 'Pré-diluir quelatos (EDTA / DTPA / EDDHA) e homogeneizar sob agitação.',
                },
                {
                  step: '4',
                  title: 'Macronutrientes',
                  desc: 'Dissolver sais lentamente (MAP, nitratos e sulfatos em tanques segregados).',
                },
              ].map((item, idx) => (
                <div
                  key={item.step}
                  className={`p-3.5 flex items-start gap-2.5 ${
                    idx % 2 === 1 ? 'sm:border-l border-slate-100 dark:border-zinc-800' : ''
                  } ${idx >= 2 ? 'sm:border-t border-slate-100 dark:border-zinc-800' : ''}`}
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-semibold tabular-nums flex items-center justify-center shrink-0 mt-0.5">
                    {item.step}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-zinc-100">{item.title}</div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Direita (5 cols): Gerenciador de Fertilizantes no Tanque */}
        <div className="lg:col-span-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Composição do Tanque
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                {tankFertilizers.length} {tankFertilizers.length === 1 ? 'insumo' : 'insumos'} ·{' '}
                {tankCalculation.totalKg.toFixed(1)} kg
              </span>
            </div>

            {/* Formulário de Adição */}
            <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/40 space-y-3 text-xs">
              <div>
                <label
                  htmlFor="fert-add-select"
                  className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block mb-1"
                >
                  Fertilizante técnico
                </label>
                <select
                  id="fert-add-select"
                  value={selectedFertToAdd}
                  onChange={e => setSelectedFertToAdd(e.target.value)}
                  className="w-full h-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  {FERTILIZERS_DATABASE.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.formula})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="fert-add-dose"
                  className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block mb-1"
                >
                  Dose total no tanque (kg)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="fert-add-dose"
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={doseToAddKg}
                    onChange={e => setDoseToAddKg(parseFloat(e.target.value) || 1)}
                    className="flex-1 h-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 text-xs font-semibold tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFertilizer}
                    className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>Adicionar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Itens Carregados */}
            <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-[380px] overflow-y-auto">
              {(tankCalculation.items || []).length === 0 ? (
                <div className="px-6 py-10 text-center space-y-1.5">
                  <FlaskConical className="w-6 h-6 text-slate-400 dark:text-zinc-500 mx-auto" />
                  <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                    Nenhum fertilizante no tanque
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Selecione um insumo acima para calcular CE, pH, ppm e compatibilidade.
                  </p>
                </div>
              ) : (
                tankCalculation.items.map(it => (
                  <div
                    key={it.fertilizerId}
                    className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {it.fertilizer.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
                        {it.fertilizer.defaultTank} · {it.concentrationGL.toFixed(1)} g/L · Solub.{' '}
                        {it.fertilizer.solubilityAt20C_gL} g/L
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        step="0.5"
                        min="0.1"
                        value={it.doseKg}
                        onChange={e =>
                          handleUpdateDose(it.fertilizerId, parseFloat(e.target.value) || 0.1)
                        }
                        aria-label={`Dose de ${it.fertilizer.name} em kg`}
                        className="w-16 h-7 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-md px-1.5 text-xs font-semibold tabular-nums text-center text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500">kg</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFertilizer(it.fertilizerId)}
                        className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center transition-colors cursor-pointer"
                        title="Remover"
                        aria-label={`Remover ${it.fertilizer.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
  );
};
