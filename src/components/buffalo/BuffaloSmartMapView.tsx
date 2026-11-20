import React, { useMemo, useState } from 'react';
import { BuffaloPaddock, BuffaloWaterPoint, BuffaloAnimal } from '../../types/buffalo';
import {
  Map,
  Droplets,
  Trees,
  ArrowUpRight,
  Layers,
  Sun,
  Users,
} from 'lucide-react';

interface BuffaloSmartMapViewProps {
  paddocks: BuffaloPaddock[];
  waterPoints: BuffaloWaterPoint[];
  animals: BuffaloAnimal[];
  onOpenDigitalTwin: (animalId: string) => void;
  onNavigateTab: (tab: string) => void;
}

const getStatusBadge = (status: BuffaloPaddock['status']) => {
  switch (status) {
    case 'Ocupado':
      return 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/60';
    case 'Em Descanso':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
    case 'Adubado':
      return 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60';
    case 'Diferido':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
    default:
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
  }
};

export const BuffaloSmartMapView: React.FC<BuffaloSmartMapViewProps> = ({
  paddocks,
  waterPoints,
  animals,
  onOpenDigitalTwin,
  onNavigateTab,
}) => {
  const [selectedPaddockId, setSelectedPaddockId] = useState<string | null>(paddocks[0]?.id || null);

  const selectedPaddock = useMemo(
    () => paddocks.find((p) => p.id === selectedPaddockId) || paddocks[0] || null,
    [paddocks, selectedPaddockId]
  );

  const totalAreaHa = useMemo(
    () => paddocks.reduce((sum, p) => sum + (p.areaHa || 0), 0),
    [paddocks]
  );

  const occupiedCount = useMemo(
    () => paddocks.filter((p) => p.status === 'Ocupado').length,
    [paddocks]
  );

  const animalsInSelected = useMemo(() => {
    if (!selectedPaddock) return [];
    return animals.filter((a) => a.paddockId === selectedPaddock.id);
  }, [animals, selectedPaddock]);

  const matchingWaterPoints = useMemo(() => {
    if (!selectedPaddock) return [];
    const target = selectedPaddock.name.toLowerCase();
    return waterPoints.filter(
      (wp) =>
        wp.locationPaddock.toLowerCase().includes(target) ||
        target.includes(wp.locationPaddock.toLowerCase())
    );
  }, [waterPoints, selectedPaddock]);

  return (
    <div className="space-y-4">
      {/* KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Área Mapeada</span>
          <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
            {totalAreaHa.toFixed(1)} ha
          </p>
        </div>
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Piquetes Ocupados</span>
          <p className="text-lg font-semibold text-teal-600 dark:text-teal-400 tabular-nums mt-0.5">
            {occupiedCount} / {paddocks.length}
          </p>
        </div>
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Pontos de Água &amp; Banho</span>
          <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
            {waterPoints.length}
          </p>
        </div>
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Rebanho Alocado</span>
          <p className="text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
            {animals.length} cabeças
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Planta Esquemática de Piquetes & Recursos Hídricos */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Mapa Esquemático de Piquetes &amp; Lotes
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Selecione um piquete para inspecionar altura do pasto, lotação, sombreamento e animais vinculados.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('pastures')}
                className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
              >
                Gerenciar Piquetes
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {paddocks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-zinc-950 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800">
                <Trees className="w-6 h-6 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Nenhum piquete cadastrado. Cadastre piquetes na aba Pastagens &amp; Rotação para visualizar o croqui.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 rounded-lg">
                {paddocks.map((pad) => {
                  const isSelected = selectedPaddock?.id === pad.id;
                  const linkedCount = animals.filter((a) => a.paddockId === pad.id).length;
                  const headCount = linkedCount > 0 ? linkedCount : pad.currentAnimalCount;
                  const canopyPct = Math.min(
                    100,
                    Math.round((pad.currentCanopyHeightCm / Math.max(1, pad.entryCanopyHeightCm)) * 100)
                  );

                  return (
                    <button
                      key={pad.id}
                      type="button"
                      onClick={() => setSelectedPaddockId(pad.id)}
                      className={`text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-white dark:bg-zinc-900 border-teal-500 ring-1 ring-teal-500/30'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                            {pad.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                            {pad.forageSpecies}
                          </p>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-semibold rounded border shrink-0 ${getStatusBadge(
                            pad.status
                          )}`}
                        >
                          {pad.status}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] tabular-nums">
                        <div>
                          <span className="text-slate-400 dark:text-zinc-500 block">Área</span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200">{pad.areaHa} ha</span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-zinc-500 block">Animais</span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200">{headCount} cab</span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-zinc-500 block">Sombra</span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200">{pad.shadeAreaPct}%</span>
                        </div>
                      </div>

                      <div className="mt-2.5 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 tabular-nums">
                          <span>Dossel: {pad.currentCanopyHeightCm} cm</span>
                          <span>Meta entrada: {pad.entryCanopyHeightCm} cm</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-600 dark:bg-teal-500 rounded-full"
                            style={{ width: `${canopyPct}%` }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pontos de Água & Termorregulação */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Pontos de Água, Açudes &amp; Banho de Lama
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('welfare_water')}
                className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
              >
                Bem-Estar &amp; Água
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {waterPoints.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Nenhum ponto hídrico cadastrado.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {waterPoints.map((wp) => (
                  <div
                    key={wp.id}
                    className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 rounded-lg flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {wp.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                        {wp.type} • {wp.locationPaddock}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 tabular-nums mt-1">
                        {wp.waterTemperatureC}°C • Cap. {wp.bathAreaCapacityAnimals} animais
                        {wp.hasMudWall ? ' • Com lama' : ''}
                      </p>
                    </div>
                    <span className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded text-[10px] font-medium text-slate-700 dark:text-zinc-300 shrink-0">
                      {wp.maintenanceStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Painel Inspetor do Piquete Selecionado */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400 inline-flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Inspetor de Piquete
              </span>
              {selectedPaddock && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded border ${getStatusBadge(
                    selectedPaddock.status
                  )}`}
                >
                  {selectedPaddock.status}
                </span>
              )}
            </div>

            {!selectedPaddock ? (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Selecione um piquete no mapa para consultar seus indicadores técnicos.
              </p>
            ) : (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {selectedPaddock.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Forrageira: {selectedPaddock.forageSpecies}
                  </p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs tabular-nums">
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Área útil</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {selectedPaddock.areaHa} ha
                    </span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Taxa de lotação</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {selectedPaddock.currentStockingRateUaHa.toFixed(2)} /{' '}
                      {selectedPaddock.carryingCapacityAnimalUnits.toFixed(2)} UA/ha
                    </span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Massa de forragem</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {selectedPaddock.forageMassKgMsPerHa.toLocaleString('pt-BR')} kg MS/ha
                    </span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Altura (atual / saída)</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {selectedPaddock.currentCanopyHeightCm} cm / {selectedPaddock.exitCanopyHeightCm} cm
                    </span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Descanso / Ocupação</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {selectedPaddock.currentRestDays}d / {selectedPaddock.currentOccupationDays}d
                    </span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Ponto de água</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {selectedPaddock.waterPointType}
                    </span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400 inline-flex items-center gap-1">
                      <Sun className="w-3 h-3" /> Sombreamento
                    </span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {selectedPaddock.shadeAreaPct}% • Fertilidade {selectedPaddock.soilFertilityScore}
                    </span>
                  </div>
                </div>

                {matchingWaterPoints.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                      Recursos Hídricos Vinculados
                    </span>
                    {matchingWaterPoints.map((wp) => (
                      <div
                        key={wp.id}
                        className="p-2 bg-slate-50 dark:bg-zinc-950 rounded border border-slate-200 dark:border-zinc-800 text-[11px] flex justify-between"
                      >
                        <span className="font-medium text-slate-800 dark:text-zinc-200">{wp.name}</span>
                        <span className="text-slate-500 dark:text-zinc-400 tabular-nums">
                          {wp.waterTemperatureC}°C
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300 inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    Animais neste Piquete ({animalsInSelected.length})
                  </span>

                  {animalsInSelected.length === 0 ? (
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Nenhum animal vinculado diretamente pelo ID do piquete. Selecione abaixo para abrir o Gêmeo 360°:
                    </p>
                  ) : null}

                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {(animalsInSelected.length > 0 ? animalsInSelected : animals.slice(0, 5)).map(
                      (animal) => (
                        <button
                          key={animal.id}
                          type="button"
                          onClick={() => onOpenDigitalTwin(animal.id)}
                          className="w-full p-2 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-teal-500/60 bg-slate-50/50 dark:bg-zinc-950/60 flex items-center justify-between gap-2 text-left cursor-pointer transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-900 dark:text-zinc-100 truncate">
                              {animal.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                              #{animal.identificationNumber} • {animal.category}
                            </p>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
