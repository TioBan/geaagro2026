import React, { useState } from 'react';
import { BuffaloWaterPoint, BuffaloThermalWelfareIndex } from '../../types/buffalo';
import { calculateTHIBuffalo } from '../../data/buffaloData';
import {
  Droplets,
  Thermometer,
  Sun,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Waves,
  Activity,
  Plus,
  Compass,
  CheckCircle2,
  Wind
} from 'lucide-react';

interface BuffaloWelfareWaterViewProps {
  waterPoints: BuffaloWaterPoint[];
  thermalWelfare: BuffaloThermalWelfareIndex;
  onUpdateThermal: (thermal: BuffaloThermalWelfareIndex) => void;
  onAddWaterPoint: (point: BuffaloWaterPoint) => void;
}

export const BuffaloWelfareWaterView: React.FC<BuffaloWelfareWaterViewProps> = ({
  waterPoints,
  thermalWelfare,
  onUpdateThermal,
  onAddWaterPoint
}) => {
  const [ambientTemp, setAmbientTemp] = useState(thermalWelfare.ambientTemperatureC);
  const [humidity, setHumidity] = useState(thermalWelfare.relativeHumidityPct);
  const [bathHours, setBathHours] = useState(thermalWelfare.waterBathAvailabilityHours);

  // Recalcular ITU dinamicamente
  const currentTHI = calculateTHIBuffalo(ambientTemp, humidity);

  let stressText: BuffaloThermalWelfareIndex['stressLevel'] = 'Normal / Conforto Pleno';
  if (currentTHI > 84) stressText = 'Estresse Severo / Emergência Térmica';
  else if (currentTHI > 78) stressText = 'Estresse Moderado';
  else if (currentTHI > 72) stressText = 'Alerta Leve';

  const handleApplyBioclimatology = () => {
    const updated: BuffaloThermalWelfareIndex = {
      ...thermalWelfare,
      ambientTemperatureC: ambientTemp,
      relativeHumidityPct: humidity,
      thiCalculated: currentTHI,
      stressLevel: stressText,
      waterBathAvailabilityHours: bathHours
    };
    onUpdateThermal(updated);
    alert('Índices bioclimatológicos e recomendações térmicas atualizados com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Exclusivo: Biometeorologia & Conforto Térmico */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-teal-950 border border-teal-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full text-xs font-black uppercase">
              <Thermometer className="w-3.5 h-3.5 text-teal-400" />
              <span>Diferencial Exclusivo da Bubalinocultura</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Painel de Bem-Estar Térmico &amp; Gestão Hídrica
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Búfalos possuem apenas <strong>1/10 das glândulas sudoríparas</strong> dos bovinos e pele escura com alta absorção de radiação. O acesso diário a <strong>açudes de imersão</strong> e <strong>sombra abundante</strong> é mandatório para evitar quedas produtivas.
            </p>
          </div>

          <div className="p-5 bg-slate-950/70 border border-teal-500/40 rounded-3xl text-center min-w-[180px] shadow-lg">
            <span className="text-[10px] uppercase font-bold text-teal-300 block">Índice ITU Atual</span>
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-400 my-1 block">
              {currentTHI}
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md text-[11px] font-black">
              {stressText}
            </span>
          </div>
        </div>

        {/* Simulador Bioclimático em Tempo Real */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-slate-800 text-xs">
          <div className="space-y-2">
            <label className="font-bold text-slate-300 flex justify-between">
              <span>Temperatura Ambiente:</span>
              <span className="text-teal-400 font-black">{ambientTemp}°C</span>
            </label>
            <input
              type="range"
              min="15"
              max="45"
              step="0.5"
              value={ambientTemp}
              onChange={(e) => setAmbientTemp(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-300 flex justify-between">
              <span>Umidade Relativa (UR):</span>
              <span className="text-teal-400 font-black">{humidity}%</span>
            </label>
            <input
              type="range"
              min="20"
              max="100"
              step="1"
              value={humidity}
              onChange={(e) => setHumidity(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-300 flex justify-between">
              <span>Horas de Banho Permitidas:</span>
              <span className="text-teal-400 font-black">{bathHours}h / dia</span>
            </label>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={bathHours}
              onChange={(e) => setBathHours(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleApplyBioclimatology}
            className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            Atualizar Parâmetros Bioclimáticos
          </button>
        </div>
      </div>

      {/* Indicadores Comportamentais do Rebanho */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Ruminação do Lote</span>
          <div className="text-3xl font-black text-emerald-600">{thermalWelfare.herdRuminationPct}%</div>
          <span className="text-xs text-slate-500">Normal (&gt; 75% em descanso)</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Índice de Ofegação / Taquipneia</span>
          <div className="text-3xl font-black text-teal-600">{thermalWelfare.herdPantingPct}%</div>
          <span className="text-xs text-emerald-600 font-bold">Excelente (&lt; 5% do lote)</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Sombra Disponível</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {thermalWelfare.shadeAvailabilityM2PerHead} <span className="text-sm font-bold text-slate-400">m²/cabeça</span>
          </div>
          <span className="text-xs text-slate-500">Mínimo recomendado: 5.0 m²</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400">Pontos de Água Mapeados</span>
          <div className="text-3xl font-black text-blue-600">{waterPoints.length}</div>
          <span className="text-xs text-slate-500">Açudes, lagoas e bebedouros</span>
        </div>
      </div>

      {/* Pontos de Água e Açudes Cadastrados */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Waves className="w-5 h-5 text-teal-600" />
              <span>Açudes de Banho, Lagoas de Resfriamento e Bebedouros</span>
            </h3>
            <p className="text-xs text-slate-500">Monitoramento da qualidade da água, capacidade e manutenção</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {waterPoints.map((point) => (
            <div
              key={point.id}
              className="p-4 bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px] rounded">
                    {point.type}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">{point.maintenanceStatus}</span>
                </div>
                <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{point.name}</h4>
                <p className="text-[11px] text-slate-500">Localização: {point.locationPaddock}</p>
                
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Capacidade</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">{point.capacityM3} m³</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Temperatura Água</span>
                    <span className="font-bold text-teal-600">{point.waterTemperatureC}°C</span>
                  </div>
                </div>
              </div>

              {point.notes && (
                <p className="text-[11px] text-slate-600 dark:text-zinc-300 pt-2 border-t border-slate-200 dark:border-zinc-700">
                  {point.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
