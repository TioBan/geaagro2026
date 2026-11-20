import React, { useState } from 'react';
import { BuffaloWaterPoint, BuffaloThermalWelfareIndex } from '../../types/buffalo';
import { calculateTHIBuffalo } from '../../data/buffaloData';
import { Thermometer, Waves, Plus, Trash2, Check, X } from 'lucide-react';

interface BuffaloWelfareWaterViewProps {
  waterPoints: BuffaloWaterPoint[];
  thermalWelfare: BuffaloThermalWelfareIndex;
  onUpdateThermal: (thermal: BuffaloThermalWelfareIndex) => void;
  onAddWaterPoint: (point: BuffaloWaterPoint) => void;
  onDeleteWaterPoint: (pointId: string) => void;
}

const inputCls =
  'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-teal-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const BuffaloWelfareWaterView: React.FC<BuffaloWelfareWaterViewProps> = ({
  waterPoints,
  thermalWelfare,
  onUpdateThermal,
  onAddWaterPoint,
  onDeleteWaterPoint
}) => {
  const [ambientTemp, setAmbientTemp] = useState(thermalWelfare.ambientTemperatureC);
  const [humidity, setHumidity] = useState(thermalWelfare.relativeHumidityPct);
  const [bathHours, setBathHours] = useState(thermalWelfare.waterBathAvailabilityHours);
  const [shadeM2, setShadeM2] = useState(thermalWelfare.shadeAvailabilityM2PerHead);
  const [ruminationPct, setRuminationPct] = useState(thermalWelfare.herdRuminationPct);
  const [pantingPct, setPantingPct] = useState(thermalWelfare.herdPantingPct);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Modal Ponto de Água
  const [showModal, setShowModal] = useState(false);
  const [ptName, setPtName] = useState('');
  const [ptType, setPtType] = useState<BuffaloWaterPoint['type']>('Açude de Banho');
  const [ptPaddock, setPtPaddock] = useState('');
  const [ptCapacity, setPtCapacity] = useState(500);
  const [ptTemp, setPtTemp] = useState(24);
  const [ptQuality, setPtQuality] = useState<BuffaloWaterPoint['currentWaterQuality']>('Boa');
  const [ptMaintenance, setPtMaintenance] = useState<BuffaloWaterPoint['maintenanceStatus']>('Operacional');
  const [ptHasMud, setPtHasMud] = useState(true);
  const [ptNotes, setPtNotes] = useState('');

  const currentTHI = calculateTHIBuffalo(ambientTemp, humidity);

  let stressText: BuffaloThermalWelfareIndex['stressLevel'] = 'Normal / Conforto Pleno';
  if (currentTHI > 84) stressText = 'Estresse Severo / Emergência Térmica';
  else if (currentTHI > 78) stressText = 'Estresse Moderado';
  else if (currentTHI > 72) stressText = 'Alerta Leve';

  const stressTone =
    currentTHI > 84
      ? 'text-rose-600 dark:text-rose-400'
      : currentTHI > 78
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-emerald-600 dark:text-emerald-400';

  const handleApplyBioclimatology = () => {
    onUpdateThermal({
      ...thermalWelfare,
      date: new Date().toISOString().split('T')[0],
      ambientTemperatureC: ambientTemp,
      relativeHumidityPct: humidity,
      thiCalculated: currentTHI,
      stressLevel: stressText,
      waterBathAvailabilityHours: bathHours,
      shadeAvailabilityM2PerHead: shadeM2,
      herdRuminationPct: ruminationPct,
      herdPantingPct: pantingPct
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleOpenAddPoint = () => {
    setPtName('');
    setPtType('Açude de Banho');
    setPtPaddock('');
    setPtCapacity(500);
    setPtTemp(24);
    setPtQuality('Boa');
    setPtMaintenance('Operacional');
    setPtHasMud(true);
    setPtNotes('');
    setShowModal(true);
  };

  const handleSavePoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ptName.trim()) return;
    const point: BuffaloWaterPoint = {
      id: `wp-${Date.now()}`,
      name: ptName.trim(),
      type: ptType,
      locationPaddock: ptPaddock.trim() || 'Área Geral',
      capacityM3: Number(ptCapacity) || 0,
      currentWaterQuality: ptQuality,
      waterTemperatureC: Number(ptTemp) || 24,
      dailyConsumptionM3: 12,
      hasMudWall: ptHasMud,
      bathAreaCapacityAnimals: 40,
      maintenanceStatus: ptMaintenance,
      notes: ptNotes.trim() || undefined
    };
    onAddWaterPoint(point);
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Faixa unificada de KPIs */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Índice ITU Atual</span>
            <div className={`text-xl font-semibold tabular-nums mt-0.5 ${stressTone}`}>{currentTHI}</div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">{stressText}</span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Ruminação / Ofegação</span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {ruminationPct}% <span className="text-xs font-normal text-slate-500">/ {pantingPct}%</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Meta: &gt;75% rum. · &lt;5% ofeg.</span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Sombra / Banho</span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {shadeM2} <span className="text-xs font-normal text-slate-500">m²/cab</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {bathHours} h/dia de imersão
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Pontos Hídricos</span>
            <div className="text-xl font-semibold text-teal-600 dark:text-teal-400 tabular-nums mt-0.5">
              {waterPoints.length}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Açudes, lagoas e bebedouros</span>
          </div>
        </div>
      </section>

      {/* Simulador Bioclimático */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Simulador Bioclimático &amp; Bem-Estar Térmico</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Búfalos possuem 1/10 das glândulas sudoríparas dos bovinos; o acesso à água e sombra previne queda produtiva.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {savedFeedback && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Salvo</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleApplyBioclimatology}
              className="h-8 px-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors"
            >
              Salvar Parâmetros
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-slate-600 dark:text-zinc-400 font-medium">Temperatura ambiente</label>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{ambientTemp}°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="45"
              step="0.5"
              value={ambientTemp}
              onChange={(e) => setAmbientTemp(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-slate-600 dark:text-zinc-400 font-medium">Umidade relativa (UR)</label>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{humidity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="1"
              value={humidity}
              onChange={(e) => setHumidity(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-slate-600 dark:text-zinc-400 font-medium">Horas de banho/dia</label>
              <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{bathHours}h</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={bathHours}
              onChange={(e) => setBathHours(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <div>
            <label className={labelCls}>Sombra disponível (m²/cabeça)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={shadeM2}
              onChange={(e) => setShadeM2(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Ruminação observada (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={ruminationPct}
              onChange={(e) => setRuminationPct(Number(e.target.value))}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Ofegação observada (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={pantingPct}
              onChange={(e) => setPantingPct(Number(e.target.value))}
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Pontos de Água e Açudes */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Açudes de Banho, Lagoas &amp; Bebedouros</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Controle de qualidade da água, capacidade e status de manutenção
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddPoint}
            className="h-8 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Ponto Hídrico</span>
          </button>
        </div>

        {waterPoints.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-zinc-400 py-8 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg">
            Nenhum açude, lagoa ou bebedouro cadastrado. Clique em Adicionar Ponto Hídrico para mapear as fontes.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {waterPoints.map(point => (
              <div
                key={point.id}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 flex flex-col justify-between gap-2.5 text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium block truncate">
                        {point.type}
                      </span>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{point.name}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteWaterPoint(point.id)}
                      title="Remover ponto de água"
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Local: {point.locationPaddock} · {point.maintenanceStatus}
                  </p>

                  <dl className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/70 dark:border-zinc-800 tabular-nums">
                    <div>
                      <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Capacidade</dt>
                      <dd className="font-semibold text-slate-800 dark:text-zinc-200">{point.capacityM3} m³</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Temp. / Qualidade</dt>
                      <dd className="font-semibold text-slate-800 dark:text-zinc-200">
                        {point.waterTemperatureC}°C · {point.currentWaterQuality.split(' ')[0]}
                      </dd>
                    </div>
                  </dl>
                </div>

                {point.notes && (
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 pt-2 border-t border-slate-200/70 dark:border-zinc-800">
                    {point.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Novo Ponto Hídrico */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Novo Ponto Hídrico / Açude</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSavePoint} className="space-y-3">
              <div>
                <label className={labelCls}>Nome do ponto *</label>
                <input
                  type="text"
                  required
                  value={ptName}
                  onChange={(e) => setPtName(e.target.value)}
                  placeholder="Ex: Açude de Banho Norte"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls}>Tipo</label>
                  <select
                    value={ptType}
                    onChange={(e) => setPtType(e.target.value as BuffaloWaterPoint['type'])}
                    className={inputCls}
                  >
                    <option value="Açude de Banho">Açude de Banho</option>
                    <option value="Represa de Resfriamento">Represa de Resfriamento</option>
                    <option value="Lagoa Escavada">Lagoa Escavada</option>
                    <option value="Bebedouro de Alta Vazão">Bebedouro de Alta Vazão</option>
                    <option value="Sistema de Aspersão/Nebulização">Sistema de Aspersão</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Piquete / Setor</label>
                  <input
                    type="text"
                    value={ptPaddock}
                    onChange={(e) => setPtPaddock(e.target.value)}
                    placeholder="Ex: Piquete 01"
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls}>Capacidade (m³)</label>
                  <input
                    type="number"
                    min="0"
                    value={ptCapacity}
                    onChange={(e) => setPtCapacity(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Temperatura Água (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={ptTemp}
                    onChange={(e) => setPtTemp(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls}>Qualidade</label>
                  <select
                    value={ptQuality}
                    onChange={(e) => setPtQuality(e.target.value as BuffaloWaterPoint['currentWaterQuality'])}
                    className={inputCls}
                  >
                    <option value="Excelente">Excelente</option>
                    <option value="Boa">Boa</option>
                    <option value="Regular (Necessita Limpeza)">Regular</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Manutenção</label>
                  <select
                    value={ptMaintenance}
                    onChange={(e) => setPtMaintenance(e.target.value as BuffaloWaterPoint['maintenanceStatus'])}
                    className={inputCls}
                  >
                    <option value="Operacional">Operacional</option>
                    <option value="Limpeza Agendada">Limpeza Agendada</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ptHasMud}
                  onChange={(e) => setPtHasMud(e.target.checked)}
                  className="accent-teal-600"
                />
                <span>Possui área de lama natural (proteção contra insetos e sol)</span>
              </label>
              <div>
                <label className={labelCls}>Observações</label>
                <input
                  type="text"
                  value={ptNotes}
                  onChange={(e) => setPtNotes(e.target.value)}
                  placeholder="Anotações de acesso ou vazão"
                  className={inputCls}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Ponto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
