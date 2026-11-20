import React, { useState, useMemo } from 'react';
import { FORAGES_CATALOG } from '../../data/foragesCatalogData';
import { Sprout, Info, CheckCircle2 } from 'lucide-react';

type PlantingMethod = 'drill' | 'broadcast' | 'aerial' | 'ilpfIntercrop';

const METHOD_CONFIG: Record<
  PlantingMethod,
  { multiplier: number; label: string; shortNote: string }
> = {
  drill: { multiplier: 1.0, label: 'Em Linha (Plantadeira)', shortNote: '1,0×' },
  broadcast: { multiplier: 1.25, label: 'A Lanço (Incorporado)', shortNote: '+25%' },
  aerial: { multiplier: 1.5, label: 'Aéreo / Sobressemeadura', shortNote: '+50%' },
  ilpfIntercrop: { multiplier: 0.9, label: 'Consórcio ILPF (Milho/Soja)', shortNote: '0,9×' },
};

export const ForageSeedingCalculator: React.FC = () => {
  const [selectedForageId, setSelectedForageId] = useState<string>(FORAGES_CATALOG[0].id);
  const [areaHa, setAreaHa] = useState<number>(20);
  const [vcPercent, setVcPercent] = useState<number>(60);
  const [method, setMethod] = useState<PlantingMethod>('broadcast');
  const [seedPriceKg, setSeedPriceKg] = useState<number>(28);

  const selectedForage = useMemo(
    () => FORAGES_CATALOG.find(f => f.id === selectedForageId) || FORAGES_CATALOG[0],
    [selectedForageId]
  );

  const isVegetative =
    selectedForage.seeding.pureLiveSeedPointsVC === 0 &&
    selectedForage.seeding.seedingRateKgHa.broadcast.max === 0;

  const calculation = useMemo(() => {
    const basePointsVC = selectedForage.seeding.pureLiveSeedPointsVC;
    const multiplier = METHOD_CONFIG[method].multiplier;
    const effectiveVc = Math.max(10, Math.min(100, vcPercent || 10));

    const adjustedPoints = Math.round(basePointsVC * multiplier);
    const kgPerHa = isVegetative ? 0 : adjustedPoints / effectiveVc;
    const totalKg = kgPerHa * Math.max(0, areaHa);
    const sacks20kg = Math.ceil(totalKg / 20);
    const totalCost = totalKg * Math.max(0, seedPriceKg);
    const costPerHa = kgPerHa * Math.max(0, seedPriceKg);

    const methodRange = selectedForage.seeding.seedingRateKgHa[method];

    return {
      adjustedPoints,
      kgPerHa: Math.round(kgPerHa * 10) / 10,
      totalKg: Math.round(totalKg),
      sacks20kg,
      totalCost,
      costPerHa,
      methodRange,
    };
  }, [selectedForage, areaHa, vcPercent, method, seedPriceKg, isVegetative]);

  const formatBRL = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  return (
    <div className="space-y-4">
      {/* Parameter Input Panel */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Calculadora de Semeadura por Valor Cultural (VC%)
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Dimensione a taxa de sementes (kg/ha), volume de sacas de 20 kg e investimento estimado.
            </p>
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
            Pontos VC base:{' '}
            <strong className="font-semibold text-slate-800 dark:text-zinc-200">
              {isVegetative ? 'Mudas (vegetativo)' : `${selectedForage.seeding.pureLiveSeedPointsVC} pts`}
            </strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Espécie / Cultivar
            </label>
            <select
              value={selectedForageId}
              onChange={e => setSelectedForageId(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/90 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
            >
              {FORAGES_CATALOG.map(f => (
                <option key={f.id} value={f.id}>
                  {f.commonName} ({f.cultivar})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Área de Plantio (ha)
            </label>
            <input
              type="number"
              min={0.5}
              max={100000}
              step={1}
              value={areaHa}
              onChange={e => setAreaHa(Math.max(0, Number(e.target.value)))}
              className="w-full h-9 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/90 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Valor Cultural (VC%)
            </label>
            <input
              type="number"
              min={20}
              max={100}
              step={1}
              disabled={isVegetative}
              value={vcPercent}
              onChange={e =>
                setVcPercent(Math.min(100, Math.max(10, Number(e.target.value) || 10)))
              }
              className="w-full h-9 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/90 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-100 tabular-nums disabled:opacity-50 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Preço Semente (R$/kg)
            </label>
            <input
              type="number"
              min={0}
              step={1}
              disabled={isVegetative}
              value={seedPriceKg}
              onChange={e => setSeedPriceKg(Math.max(0, Number(e.target.value)))}
              className="w-full h-9 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/90 dark:border-zinc-800 text-xs text-slate-800 dark:text-zinc-100 tabular-nums disabled:opacity-50 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Planting Method Segmented Row */}
        {!isVegetative && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 mr-1">
              Método de Semeadura:
            </span>
            {(Object.keys(METHOD_CONFIG) as PlantingMethod[]).map(key => {
              const active = method === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMethod(key)}
                  className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {METHOD_CONFIG[key].label}{' '}
                  <span className={active ? 'text-emerald-100' : 'text-slate-400 dark:text-zinc-500'}>
                    ({METHOD_CONFIG[key].shortNote})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Vegetative Notice OR Hairline 4-KPI Result Strip */}
      {isVegetative ? (
        <section className="bg-white dark:bg-zinc-900 border border-amber-500/40 dark:border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <Sprout className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h3 className="font-semibold text-slate-900 dark:text-zinc-100">
              {selectedForage.commonName} ({selectedForage.cultivar}) utiliza propagação vegetativa por mudas
            </h3>
            <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
              Esta cultivar não é implantada por semente comercial (VC%). O estabelecimento ocorre via mudas, estolões ou colmos maduros distribuídos em sulcos adubados.
            </p>
            <p className="text-slate-700 dark:text-zinc-200 font-medium pt-0.5 tabular-nums">
              Estabelecimento estimado: {selectedForage.phenology.establishmentDays.min} a{' '}
              {selectedForage.phenology.establishmentDays.max} dias até o primeiro corte/pastejo.
            </p>
          </div>
        </section>
      ) : (
        <section className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-zinc-800">
            <div className="p-4">
              <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                Taxa Recomendada
              </span>
              <span className="block text-xl font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums mt-1">
                {calculation.kgPerHa.toFixed(1)} <span className="text-xs font-medium">kg/ha</span>
              </span>
              <span className="block text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums mt-0.5">
                {calculation.adjustedPoints} pts VC ÷ {vcPercent}%
              </span>
            </div>

            <div className="p-4">
              <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                Volume Total ({areaHa} ha)
              </span>
              <span className="block text-xl font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-1">
                {calculation.totalKg.toLocaleString('pt-BR')}{' '}
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">kg</span>
              </span>
              <span className="block text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                Semente comercial necessária
              </span>
            </div>

            <div className="p-4">
              <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                Embalagens (20 kg)
              </span>
              <span className="block text-xl font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-1">
                {calculation.sacks20kg}{' '}
                <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">sacas</span>
              </span>
              <span className="block text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                Arredondamento operacional
              </span>
            </div>

            <div className="p-4">
              <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                Investimento Estimado
              </span>
              <span className="block text-xl font-semibold text-slate-900 dark:text-zinc-100 tabular-nums mt-1">
                {formatBRL(calculation.totalCost)}
              </span>
              <span className="block text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums mt-0.5">
                {formatBRL(calculation.costPerHa)} / ha
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Technical Guidelines (2-Column Single Elevation) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <section className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-zinc-100">
            <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Parâmetros Técnicos de {selectedForage.commonName}</span>
          </div>

          <dl className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
            <div className="py-1.5 flex items-center justify-between gap-2">
              <dt className="text-slate-500 dark:text-zinc-400">Profundidade de Plantio</dt>
              <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                {selectedForage.seeding.seedPlantingDepthCm.min} a{' '}
                {selectedForage.seeding.seedPlantingDepthCm.max} cm
              </dd>
            </div>
            <div className="py-1.5 flex items-center justify-between gap-2">
              <dt className="text-slate-500 dark:text-zinc-400">Faixa Referência ({METHOD_CONFIG[method].label})</dt>
              <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                {calculation.methodRange.max > 0
                  ? `${calculation.methodRange.min} a ${calculation.methodRange.max} kg/ha`
                  : 'Plantio por mudas'}
              </dd>
            </div>
            <div className="py-1.5 flex items-center justify-between gap-2">
              <dt className="text-slate-500 dark:text-zinc-400">Estabelecimento (1º Pastejo)</dt>
              <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                {selectedForage.phenology.establishmentDays.min} a{' '}
                {selectedForage.phenology.establishmentDays.max} dias
              </dd>
            </div>
            <div className="py-1.5 flex items-center justify-between gap-2">
              <dt className="text-slate-500 dark:text-zinc-400">Sementes por Grama (aprox.)</dt>
              <dd className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                {selectedForage.seeding.seedsPerGramApprox > 0
                  ? selectedForage.seeding.seedsPerGramApprox.toLocaleString('pt-BR')
                  : 'N/A (vegetativo)'}
              </dd>
            </div>
          </dl>

          <p className="text-[11px] text-slate-600 dark:text-zinc-400 pt-1 leading-relaxed">
            <strong className="text-slate-800 dark:text-zinc-200">Adubação de formação:</strong>{' '}
            {selectedForage.fertilization.establishmentFertilizerNPK}
          </p>
        </section>

        <section className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-zinc-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Boas Práticas de Formação</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">1.</span>
              <span>
                <strong>Cálculo do VC%:</strong> VC = (% Pureza × % Germinação) ÷ 100. Conferir o boletim de análise do lote antes de regular a semeadora.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">2.</span>
              <span>
                <strong>Profundidade rasa:</strong> sementes forrageiras pequenas perdem vigor acima de 2–3 cm. Prefira incorporação leve com grade fechada ou rolo compactador.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">3.</span>
              <span>
                <strong>Pastejo de uniformização:</strong> realize o primeiro pastejo leve com animais jovens para estimular o perfilhamento basal sem arrancar touceiras.
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
