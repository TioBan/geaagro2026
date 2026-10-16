import React from 'react';
import {
  Droplets,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Info,
  Layers,
  Sparkles,
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

  // Recommendations for conditioners based on hardness and pH
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Qualidade da Água de Pulverização
            </span>
            <span className="text-xs text-gray-500">• Integração com Análise Físico-Química</span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mt-1">Diagnóstico & Condicionamento da Água</h1>
          <p className="text-xs text-gray-600 mt-1">
            Mais de 95% do volume do tanque é composto por água. A dureza (Ca/Mg), o pH e a presença de argilas afetam diretamente a eficácia dos defensivos.
          </p>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-600" />
          Carregar Perfil Típico de Água da Região
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {WATER_QUALITY_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset.id)}
              className="p-3 rounded-xl border border-gray-200 hover:border-cyan-500 hover:bg-cyan-50/50 text-left transition-all flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-xs text-gray-900">{preset.name}</div>
                <div className="text-[11px] text-gray-500 mt-1">{preset.description}</div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="font-bold text-cyan-700">pH {preset.ph}</span>
                <span className="text-gray-600">{preset.hardnessMgL} mg/L CaCO₃</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Parameter Sliders / Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters Column */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Parâmetros Físico-Químicos da Água
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* pH */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-800">pH da Água</label>
                <span
                  className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                    waterQuality.ph >= 4.5 && waterQuality.ph <= 6.0
                      ? 'bg-emerald-100 text-emerald-800'
                      : waterQuality.ph > 7.0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {waterQuality.ph.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min={3.0}
                max={10.0}
                step={0.1}
                value={waterQuality.ph}
                onChange={e => setWaterQuality(prev => ({ ...prev, ph: Number(e.target.value) }))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Faixa ideal para a maioria dos defensivos: <strong>4.5 a 5.8</strong> (Evita hidrólise alcalina).
              </p>
            </div>

            {/* Dureza Total */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-800">Dureza Total (CaCO₃)</label>
                <span
                  className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                    waterQuality.hardnessMgL <= 150
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {waterQuality.hardnessMgL} mg/L
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={500}
                step={5}
                value={waterQuality.hardnessMgL}
                onChange={e => setWaterQuality(prev => ({ ...prev, hardnessMgL: Number(e.target.value) }))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[10px] text-gray-500 mt-1">Classificação: <strong>{hardnessClass}</strong></p>
            </div>

            {/* Condutividade Elétrica */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-800">Condutividade Elétrica (CE)</label>
                <span className="text-xs font-bold text-gray-800">{waterQuality.electricalConductivityUsCm} µS/cm</span>
              </div>
              <input
                type="range"
                min={20}
                max={1500}
                step={10}
                value={waterQuality.electricalConductivityUsCm}
                onChange={e =>
                  setWaterQuality(prev => ({ ...prev, electricalConductivityUsCm: Number(e.target.value) }))
                }
                className="w-full accent-cyan-600"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Índice de sais dissolvidos totais. Acima de 500 µS/cm indica alta salinidade.
              </p>
            </div>

            {/* Temperatura */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-gray-800">Temperatura da Água (°C)</label>
                <span className="text-xs font-bold text-gray-800">{waterQuality.temperatureC} °C</span>
              </div>
              <input
                type="range"
                min={10}
                max={40}
                step={1}
                value={waterQuality.temperatureC}
                onChange={e => setWaterQuality(prev => ({ ...prev, temperatureC: Number(e.target.value) }))}
                className="w-full accent-cyan-600"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Água muito fria (&lt; 15°C) dificulta a dissolução de pós e grânulos WG/WP.
              </p>
            </div>
          </div>

          {/* Micro Minerals (Ca, Mg, Fe, Bicarbonates) */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              Cátions Antagônicos & Bicarbonatos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Cálcio (Ca²⁺)</label>
                <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 py-1">
                  <input
                    type="number"
                    value={waterQuality.calciumMgL}
                    onChange={e => setWaterQuality(prev => ({ ...prev, calciumMgL: Number(e.target.value) }))}
                    className="w-full text-xs font-bold text-gray-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400">mg/L</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Magnésio (Mg²⁺)</label>
                <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 py-1">
                  <input
                    type="number"
                    value={waterQuality.magnesiumMgL}
                    onChange={e => setWaterQuality(prev => ({ ...prev, magnesiumMgL: Number(e.target.value) }))}
                    className="w-full text-xs font-bold text-gray-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400">mg/L</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Ferro Total (Fe)</label>
                <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 py-1">
                  <input
                    type="number"
                    step={0.1}
                    value={waterQuality.ironMgL}
                    onChange={e => setWaterQuality(prev => ({ ...prev, ironMgL: Number(e.target.value) }))}
                    className="w-full text-xs font-bold text-gray-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400">mg/L</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Bicarbonatos (HCO₃⁻)</label>
                <div className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 py-1">
                  <input
                    type="number"
                    value={waterQuality.bicarbonatesMgL}
                    onChange={e => setWaterQuality(prev => ({ ...prev, bicarbonatesMgL: Number(e.target.value) }))}
                    className="w-full text-xs font-bold text-gray-900 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400">mg/L</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Agronomic Diagnostics & Conditioning Prescription */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-teal-900 to-emerald-950 text-white p-5 rounded-2xl shadow-md border border-emerald-800">
            <h3 className="font-bold text-sm text-emerald-300 flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4" />
              Prescrição de Condicionamento
            </h3>

            <div className="space-y-3 text-xs">
              {needsAmmoniumSulfate ? (
                <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-700/50">
                  <div className="font-bold text-amber-300 mb-0.5">⚠️ Sequestrante de Dureza Necessário</div>
                  <p className="text-emerald-100 text-[11px] leading-relaxed">
                    Para neutralizar os {waterQuality.hardnessMgL} mg/L de cálcio/magnésio e proteger herbicidas aniônicos (Glifosato e 2,4-D):
                  </p>
                  <div className="mt-2 text-xs font-extrabold text-white bg-emerald-800/80 px-2.5 py-1.5 rounded-lg">
                    Adicionar ~{ammoniumSulfateDoseKgPer1000L} kg de Sulfato de Amônio Técnico por 1.000 L de água
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-700/30 text-emerald-200">
                  ✓ Água mole ({waterQuality.hardnessMgL} mg/L): Não há necessidade de doses extras de sequestrante de cálcio.
                </div>
              )}

              {needsAcidifier ? (
                <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-700/50">
                  <div className="font-bold text-amber-300 mb-0.5">⚠️ Acidificação Recomendada (pH {waterQuality.ph})</div>
                  <p className="text-emerald-100 text-[11px] leading-relaxed">
                    pH alto provoca hidrólise alcalina em organofosforados e piretroides.
                  </p>
                  <div className="mt-2 text-xs font-extrabold text-white bg-emerald-800/80 px-2.5 py-1.5 rounded-lg">
                    Adicionar ~{acidifierDoseMlPer1000L} mL de Redutor de pH / Ácido Fosfórico por 1.000 L
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-900/40 p-3 rounded-xl border border-emerald-700/30 text-emerald-200">
                  ✓ pH ideal ({waterQuality.ph}): Proporciona máxima estabilidade química às moléculas.
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-amber-800">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Ordem de Entrada do Condicionador</span>
            </div>
            <p>
              O condicionador de água (Sulfato de Amônio ou redutor de pH) deve ser <strong>o primeiro produto adicionado</strong> ao tanque, quando o nível de água atingir 30% a 50%, permitindo que os íons sejam complexados antes da entrada dos defensivos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
