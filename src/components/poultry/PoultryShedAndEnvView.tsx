import React, { useMemo, useState } from 'react';
import { Home, Plus, Thermometer, Trash2, Wind } from 'lucide-react';
import { EnvironmentRecord, PoultryBatch, PoultryShed } from '../../types/poultry';
import {
  POULTRY_CARD_CLASS,
  POULTRY_INPUT_CLASS,
  POULTRY_LABEL_CLASS,
  POULTRY_PRIMARY_BTN_CLASS,
  POULTRY_SECONDARY_BTN_CLASS,
  POULTRY_SUBCARD_CLASS,
  calculatePoultryItu,
  formatBrDate,
  getEnvironmentComfortStatus,
  getTodayIsoDate,
} from './poultryUi';

interface PoultryShedAndEnvViewProps {
  mode: 'galpao_twin' | 'ambiente';
  sheds: PoultryShed[];
  batches: PoultryBatch[];
  onOpenAddShed: () => void;
  onUpdateShed: (shed: PoultryShed) => Promise<void>;
  onDeleteShed: (id: string) => Promise<void>;
}

export const PoultryShedAndEnvView: React.FC<PoultryShedAndEnvViewProps> = ({
  mode,
  sheds,
  batches,
  onOpenAddShed,
  onUpdateShed,
  onDeleteShed,
}) => {
  const [selectedShedId, setSelectedShedId] = useState<string>(() => sheds[0]?.id || '');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Environment reading form
  const [date, setDate] = useState<string>(getTodayIsoDate);
  const [temperature, setTemperature] = useState<string>('26.5');
  const [humidity, setHumidity] = useState<string>('62');
  const [ammonia, setAmmonia] = useState<string>('8');
  const [co2, setCo2] = useState<string>('1800');
  const [isSaving, setIsSaving] = useState(false);

  const activeShed = useMemo(
    () => sheds.find(s => s.id === selectedShedId) ?? sheds[0] ?? null,
    [sheds, selectedShedId]
  );

  if (sheds.length === 0 || !activeShed) {
    return (
      <div className={`${POULTRY_CARD_CLASS} p-8 text-center space-y-3`}>
        <div className="w-11 h-11 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center mx-auto">
          <Home className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Nenhum galpão avícola cadastrado
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Cadastre seus aviários para gerenciar capacidade, ventilação, aquecimento e leituras climáticas (Temperatura, Umidade, NH₃, CO₂ e ITU).
          </p>
        </div>
        <button type="button" onClick={onOpenAddShed} className={POULTRY_PRIMARY_BTN_CLASS}>
          <Plus className="w-3.5 h-3.5" />
          Cadastrar Primeiro Galpão
        </button>
      </div>
    );
  }

  const linkedBatches = batches.filter(b => b.shedId === activeShed.id);
  const housedBirds = linkedBatches.reduce((sum, b) => sum + b.currentQuantity, 0);
  const occupancyPct =
    activeShed.capacity > 0 ? Math.min(100, Math.round((housedBirds / activeShed.capacity) * 100)) : 0;

  const history = activeShed.environmentHistory || [];
  const latestReading = history.length > 0 ? history[0] : null;
  const latestComfort = latestReading ? getEnvironmentComfortStatus(latestReading) : null;

  const handleAddReading = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempVal = Number(temperature);
    const humVal = Number(humidity);
    const nh3Val = Number(ammonia);
    const co2Val = Number(co2);
    if (!Number.isFinite(tempVal) || !Number.isFinite(humVal)) return;

    setIsSaving(true);
    try {
      const nextRecord: EnvironmentRecord = {
        id: `env-${Date.now()}`,
        date: date || getTodayIsoDate(),
        temperature: tempVal,
        humidity: humVal,
        ammonia: Number.isFinite(nh3Val) ? nh3Val : 0,
        co2: Number.isFinite(co2Val) ? co2Val : 0,
      };
      const updatedShed: PoultryShed = {
        ...activeShed,
        environmentHistory: [nextRecord, ...history],
      };
      await onUpdateShed(updatedShed);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Shed Selector Bar */}
      <div className={`${POULTRY_CARD_CLASS} p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
            Aviário selecionado:
          </span>
          <select
            aria-label="Selecionar galpão"
            value={activeShed.id}
            onChange={e => {
              setSelectedShedId(e.target.value);
              setConfirmDeleteId(null);
            }}
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            {sheds.map(s => (
              <option key={s.id} value={s.id}>
                {s.identification} ({s.capacity.toLocaleString('pt-BR')} aves)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onOpenAddShed} className={POULTRY_SECONDARY_BTN_CLASS}>
            <Plus className="w-3.5 h-3.5" />
            Novo Galpão
          </button>

          {confirmDeleteId === activeShed.id ? (
            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={async () => {
                  await onDeleteShed(activeShed.id);
                  setConfirmDeleteId(null);
                }}
                className="h-8 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium cursor-pointer"
              >
                Confirmar exclusão
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className={POULTRY_SECONDARY_BTN_CLASS}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDeleteId(activeShed.id)}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remover
            </button>
          )}
        </div>
      </div>

      {/* Digital Twin Structural Specs */}
      {mode === 'galpao_twin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <section className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-5 space-y-3`}>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                {activeShed.identification}
              </h2>
              <span className="text-xs font-medium tabular-nums text-slate-600 dark:text-zinc-400">
                Ocupação {occupancyPct}%
              </span>
            </div>

            <dl className="space-y-2 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Capacidade Máxima</dt>
                <dd className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
                  {activeShed.capacity.toLocaleString('pt-BR')} aves
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Aves Alojadas Atualmente</dt>
                <dd className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
                  {housedBirds.toLocaleString('pt-BR')} aves
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Dimensões</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100">
                  {activeShed.dimensions || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Ventilação</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100 text-right">
                  {activeShed.ventilationType || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Aquecimento</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100 text-right">
                  {activeShed.heatingSystem || '—'}
                </dd>
              </div>
            </dl>

            {/* Occupancy bar */}
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                <span>Taxa de Lotação</span>
                <span>{occupancyPct}%</span>
              </div>
              <div className="h-2 rounded bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-amber-600 transition-all"
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
            </div>
          </section>

          <section className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-7 space-y-3`}>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Wind className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                Lotes Vinculados & Último Microclima
              </h3>
              {latestComfort && (
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${latestComfort.badgeClass}`}>
                  {latestComfort.label}
                </span>
              )}
            </div>

            {latestReading ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div className={`${POULTRY_SUBCARD_CLASS} p-2.5`}>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Temperatura</p>
                  <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
                    {latestReading.temperature} °C
                  </p>
                </div>
                <div className={`${POULTRY_SUBCARD_CLASS} p-2.5`}>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Umidade</p>
                  <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
                    {latestReading.humidity}%
                  </p>
                </div>
                <div className={`${POULTRY_SUBCARD_CLASS} p-2.5`}>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">ITU</p>
                  <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
                    {calculatePoultryItu(latestReading.temperature, latestReading.humidity)}
                  </p>
                </div>
                <div className={`${POULTRY_SUBCARD_CLASS} p-2.5`}>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">Amônia (NH₃)</p>
                  <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
                    {latestReading.ammonia} ppm
                  </p>
                </div>
                <div className={`${POULTRY_SUBCARD_CLASS} p-2.5 col-span-2 sm:col-span-1`}>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">CO₂</p>
                  <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
                    {latestReading.co2} ppm
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Sem leituras climáticas registradas para este galpão. Acesse a aba Climatização & Ambiência para registrar.
              </p>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-2">
              <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Lotes alojados neste galpão ({linkedBatches.length})
              </p>
              {linkedBatches.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Galpão em vazio sanitário ou sem lotes vinculados.
                </p>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg">
                  {linkedBatches.map(b => (
                    <div key={b.id} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-zinc-100">{b.code}</span>
                        <span className="text-slate-500 dark:text-zinc-400"> · {b.lineage} ({b.purpose})</span>
                      </div>
                      <span className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
                        {b.currentQuantity.toLocaleString('pt-BR')} aves
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Environment & Climate Monitoring */}
      {mode === 'ambiente' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <form onSubmit={handleAddReading} className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-5 space-y-3`}>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              <Thermometer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Registrar Leitura de Ambiência
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={POULTRY_LABEL_CLASS}>Data da Leitura</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={POULTRY_LABEL_CLASS}>Temperatura (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={temperature}
                  onChange={e => setTemperature(e.target.value)}
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={POULTRY_LABEL_CLASS}>Umidade Relativa (%)</label>
                <input
                  type="number"
                  step="1"
                  min={0}
                  max={100}
                  required
                  value={humidity}
                  onChange={e => setHumidity(e.target.value)}
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={POULTRY_LABEL_CLASS}>Amônia NH₃ (ppm)</label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={ammonia}
                  onChange={e => setAmmonia(e.target.value)}
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={POULTRY_LABEL_CLASS}>CO₂ (ppm)</label>
                <input
                  type="number"
                  step="50"
                  min={0}
                  value={co2}
                  onChange={e => setCo2(e.target.value)}
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
            </div>

            <div className={`${POULTRY_SUBCARD_CLASS} p-2.5 flex items-center justify-between text-xs`}>
              <span className="text-slate-500 dark:text-zinc-400">ITU Calculado</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                {calculatePoultryItu(Number(temperature), Number(humidity))}
              </span>
            </div>

            <button type="submit" disabled={isSaving} className={`${POULTRY_PRIMARY_BTN_CLASS} w-full`}>
              <Plus className="w-3.5 h-3.5" />
              {isSaving ? 'Salvando...' : 'Salvar Leitura Ambiental'}
            </button>
          </form>

          <section className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-7 space-y-3`}>
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Histórico Climático — {activeShed.identification}
              </h3>
              <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                {history.length} {history.length === 1 ? 'leitura' : 'leituras'}
              </span>
            </div>

            {history.length === 0 ? (
              <div className={`${POULTRY_SUBCARD_CLASS} p-6 text-center`}>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Nenhuma leitura climática registrada neste galpão ainda.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
                      <th className="py-2 pr-3 font-medium">Data</th>
                      <th className="py-2 px-2 font-medium text-right">Temp.</th>
                      <th className="py-2 px-2 font-medium text-right">UR</th>
                      <th className="py-2 px-2 font-medium text-right">ITU</th>
                      <th className="py-2 px-2 font-medium text-right">NH₃</th>
                      <th className="py-2 px-2 font-medium text-right">CO₂</th>
                      <th className="py-2 pl-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
                    {history.map(rec => {
                      const itu = calculatePoultryItu(rec.temperature, rec.humidity);
                      const comfort = getEnvironmentComfortStatus(rec);
                      return (
                        <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                          <td className="py-2 pr-3 tabular-nums text-slate-700 dark:text-zinc-300">
                            {formatBrDate(rec.date)}
                          </td>
                          <td className="py-2 px-2 text-right tabular-nums font-medium text-slate-900 dark:text-zinc-100">
                            {rec.temperature} °C
                          </td>
                          <td className="py-2 px-2 text-right tabular-nums text-slate-700 dark:text-zinc-300">
                            {rec.humidity}%
                          </td>
                          <td className="py-2 px-2 text-right tabular-nums font-medium text-slate-900 dark:text-zinc-100">
                            {itu}
                          </td>
                          <td className="py-2 px-2 text-right tabular-nums text-slate-700 dark:text-zinc-300">
                            {rec.ammonia} ppm
                          </td>
                          <td className="py-2 px-2 text-right tabular-nums text-slate-700 dark:text-zinc-300">
                            {rec.co2} ppm
                          </td>
                          <td className="py-2 pl-2 text-right">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${comfort.badgeClass}`}>
                              {comfort.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
