import React from 'react';
import {
  Sliders,
  Info,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { WaterQualityParameters } from '../../types/tankMix';
import { WATER_QUALITY_PRESETS, getWaterHardnessClassification } from '../../data/tankMixData';

interface Props {
  waterQuality: WaterQualityParameters;
  setWaterQuality: React.Dispatch<React.SetStateAction<WaterQualityParameters>>;
}

export const TankMixWaterQualityView: React.FC<Props> = ({ waterQuality, setWaterQuality }) => {
  const hardnessClass = getWaterHardnessClassification(waterQuality.hardnessMgL);

  const needsAmmoniumSulfate = waterQuality.hardnessMgL > 150;
  const ammoniumSulfateDoseKgPer1000L = (waterQuality.hardnessMgL * 0.008).toFixed(1);

  const needsAcidifier = waterQuality.ph > 7.0;
  const acidifierDoseMlPer1000L = ((waterQuality.ph - 5.5) * 80).toFixed(0);

  const handleSelectPreset = (presetId: string) => {
    const preset = (WATER_QUALITY_PRESETS || []).find(p => p?.id === presetId);
    if (preset) {
      setWaterQuality({
        ph: preset.ph,
        electricalConductivityUsCm: preset.electricalConductivityUsCm,
        hardnessMgL: preset.hardnessMgL,
        alkalinityMgL: preset.alkalinityMgL,
        temperatureC: preset.temperatureC,
        calciumMgL: preset.calciumMgL,
        magnesiumMgL: preset.magnesiumMgL,
        ironMgL: preset.ironMgL,
        manganeseMgL: preset.manganeseMgL,
        bicarbonatesMgL: preset.bicarbonatesMgL,
        classification: preset.classification,
      });
    }
  };

  const phTone =
    waterQuality.ph >= 4.5 && waterQuality.ph <= 6.0
      ? 'text-emerald-700 dark:text-emerald-400'
      : waterQuality.ph > 7.0
      ? 'text-amber-700 dark:text-amber-400'
      : 'text-rose-700 dark:text-rose-400';

  const hardnessTone =
    waterQuality.hardnessMgL <= 150
      ? 'text-emerald-700 dark:text-emerald-400'
      : 'text-rose-700 dark:text-rose-400';

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
          Diagnóstico e Condicionamento da Água
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Mais de 95% da calda é água · Ajuste pH, dureza (Ca/Mg), condutividade e cátions antagônicos
        </p>
      </div>

      {/* Perfis Regionais */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
          <Droplets className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
            Carregar Perfil Típico de Água
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-zinc-800">
          {WATER_QUALITY_PRESETS.map(preset => {
            const isMatched =
              waterQuality.ph === preset.ph && waterQuality.hardnessMgL === preset.hardnessMgL;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-3.5 text-left transition-colors flex flex-col justify-between cursor-pointer ${
                  isMatched
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                    : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                    {preset.description}
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] tabular-nums">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    pH {preset.ph}
                  </span>
                  <span className="text-slate-500 dark:text-zinc-400">
                    {preset.hardnessMgL} mg/L CaCO₃
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Parâmetros + Prescrição */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Coluna de Parâmetros */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Parâmetros Físico-Químicos da Água
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-800 border-b border-slate-100 dark:divide-zinc-800 dark:border-zinc-800">
            {/* pH */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="water-ph" className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  pH da água
                </label>
                <span className={`text-sm font-semibold tabular-nums ${phTone}`}>
                  {waterQuality.ph.toFixed(1)}
                </span>
              </div>
              <input
                id="water-ph"
                type="range"
                min={3.0}
                max={10.0}
                step={0.1}
                value={waterQuality.ph}
                onChange={e => setWaterQuality(prev => ({ ...prev, ph: Number(e.target.value) }))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Faixa ideal: <strong className="text-slate-700 dark:text-zinc-300">4,5 a 5,8</strong> (evita hidrólise alcalina).
              </p>
            </div>

            {/* Dureza */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="water-hardness" className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Dureza total (CaCO₃)
                </label>
                <span className={`text-sm font-semibold tabular-nums ${hardnessTone}`}>
                  {waterQuality.hardnessMgL} mg/L
                </span>
              </div>
              <input
                id="water-hardness"
                type="range"
                min={10}
                max={500}
                step={5}
                value={waterQuality.hardnessMgL}
                onChange={e => setWaterQuality(prev => ({ ...prev, hardnessMgL: Number(e.target.value) }))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Classificação: <strong className="text-slate-700 dark:text-zinc-300">{hardnessClass}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-zinc-800 border-b border-slate-100 dark:border-zinc-800">
            {/* Condutividade */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="water-ec" className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Condutividade elétrica (CE)
                </label>
                <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                  {waterQuality.electricalConductivityUsCm} µS/cm
                </span>
              </div>
              <input
                id="water-ec"
                type="range"
                min={20}
                max={1500}
                step={10}
                value={waterQuality.electricalConductivityUsCm}
                onChange={e =>
                  setWaterQuality(prev => ({ ...prev, electricalConductivityUsCm: Number(e.target.value) }))
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Acima de 500 µS/cm indica salinidade elevada na água de calda.
              </p>
            </div>

            {/* Temperatura */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="water-temp" className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Temperatura da água
                </label>
                <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                  {waterQuality.temperatureC} °C
                </span>
              </div>
              <input
                id="water-temp"
                type="range"
                min={10}
                max={40}
                step={1}
                value={waterQuality.temperatureC}
                onChange={e => setWaterQuality(prev => ({ ...prev, temperatureC: Number(e.target.value) }))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Água abaixo de 15 °C reduz a solubilidade de formulações WG e WP.
              </p>
            </div>
          </div>

          {/* Cátions Antagônicos */}
          <div className="p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Cátions Antagônicos e Bicarbonatos
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1">Cálcio (Ca²⁺)</label>
                <div className="flex items-center gap-1.5 h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5">
                  <input
                    type="number"
                    value={waterQuality.calciumMgL}
                    onChange={e => setWaterQuality(prev => ({ ...prev, calciumMgL: Number(e.target.value) }))}
                    className="w-full bg-transparent text-xs font-semibold tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">mg/L</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1">Magnésio (Mg²⁺)</label>
                <div className="flex items-center gap-1.5 h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5">
                  <input
                    type="number"
                    value={waterQuality.magnesiumMgL}
                    onChange={e => setWaterQuality(prev => ({ ...prev, magnesiumMgL: Number(e.target.value) }))}
                    className="w-full bg-transparent text-xs font-semibold tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">mg/L</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1">Ferro total (Fe)</label>
                <div className="flex items-center gap-1.5 h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5">
                  <input
                    type="number"
                    step={0.1}
                    value={waterQuality.ironMgL}
                    onChange={e => setWaterQuality(prev => ({ ...prev, ironMgL: Number(e.target.value) }))}
                    className="w-full bg-transparent text-xs font-semibold tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">mg/L</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 dark:text-zinc-400 block mb-1">Bicarbonatos (HCO₃⁻)</label>
                <div className="flex items-center gap-1.5 h-8 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5">
                  <input
                    type="number"
                    value={waterQuality.bicarbonatesMgL}
                    onChange={e => setWaterQuality(prev => ({ ...prev, bicarbonatesMgL: Number(e.target.value) }))}
                    className="w-full bg-transparent text-xs font-semibold tabular-nums text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">mg/L</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna de Prescrição */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Prescrição de Condicionamento
              </h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
              <div className="p-4 space-y-1.5">
                {needsAmmoniumSulfate ? (
                  <>
                    <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Sequestrante de dureza necessário</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                      Para neutralizar {waterQuality.hardnessMgL} mg/L de cálcio/magnésio e proteger herbicidas aniônicos (Glifosato e 2,4-D):
                    </p>
                    <div className="mt-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 font-semibold tabular-nums text-amber-900 dark:text-amber-200">
                      ~{ammoniumSulfateDoseKgPer1000L} kg de Sulfato de Amônio / 1.000 L
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-2 text-slate-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      Água mole (<strong className="tabular-nums">{waterQuality.hardnessMgL} mg/L</strong>): sem necessidade de doses extras de sequestrante de cálcio.
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-1.5">
                {needsAcidifier ? (
                  <>
                    <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Acidificação recomendada (pH {waterQuality.ph.toFixed(1)})</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                      pH alcalino acelera a hidrólise de organofosforados e piretroides na calda.
                    </p>
                    <div className="mt-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 font-semibold tabular-nums text-amber-900 dark:text-amber-200">
                      ~{acidifierDoseMlPer1000L} mL de redutor de pH / 1.000 L
                    </div>
                  </>
                ) : (
                  <div className="flex items-start gap-2 text-slate-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      pH adequado (<strong className="tabular-nums">{waterQuality.ph.toFixed(1)}</strong>): favorece a estabilidade química das moléculas.
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50/70 dark:bg-zinc-950/40 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-zinc-200">
                  <Info className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
                  <span>Ordem de entrada do condicionador</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Adicione o condicionador como <strong className="text-slate-800 dark:text-zinc-200">primeiro produto</strong> quando o tanque estiver entre 30% e 50% de água, complexando os íons antes da entrada dos defensivos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
