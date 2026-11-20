import React, { useMemo, useState } from 'react';
import { Bird, Droplets, Egg, Plus, Scale, Syringe, Target, Trash2 } from 'lucide-react';
import { PoultryBatch, PoultryShed, PoultryTab } from '../../types/poultry';
import {
  POULTRY_CARD_CLASS,
  POULTRY_PRIMARY_BTN_CLASS,
  POULTRY_SECONDARY_BTN_CLASS,
  POULTRY_SUBCARD_CLASS,
  formatBrDate,
  getBatchAgeDays,
} from './poultryUi';

interface PoultryBatchTwinViewProps {
  batches: PoultryBatch[];
  sheds: PoultryShed[];
  currentBatch: PoultryBatch | null;
  onSelectBatch: (id: string) => void;
  onDeleteBatch: (id: string) => void;
  onOpenAddBatch: () => void;
  onNavigate: (tab: PoultryTab) => void;
}

type TimelineFilter = 'all' | 'weighing' | 'consumption' | 'health' | 'production';

interface TimelineEntry {
  id: string;
  date: string;
  kind: Exclude<TimelineFilter, 'all'>;
  title: string;
  detail: string;
}

export const PoultryBatchTwinView: React.FC<PoultryBatchTwinViewProps> = ({
  batches,
  sheds,
  currentBatch,
  onSelectBatch,
  onDeleteBatch,
  onOpenAddBatch,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<TimelineFilter>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const timeline = useMemo<TimelineEntry[]>(() => {
    if (!currentBatch) return [];
    const items: TimelineEntry[] = [];

    currentBatch.weighings.forEach(w => {
      items.push({
        id: `w-${w.id}`,
        date: w.date,
        kind: 'weighing',
        title: 'Pesagem Amostral',
        detail: `Peso médio ${w.averageWeight.toLocaleString('pt-BR')} g · Uniformidade ${w.uniformity}% · GMD ${w.dailyGain} g/dia`,
      });
    });

    currentBatch.consumptions.forEach(c => {
      items.push({
        id: `c-${c.id}`,
        date: c.date,
        kind: 'consumption',
        title: `Consumo — ${c.feedType}`,
        detail: `Ração ${c.feedConsumed.toLocaleString('pt-BR')} kg · Água ${c.waterConsumed.toLocaleString('pt-BR')} L`,
      });
    });

    currentBatch.healthEvents.forEach(h => {
      items.push({
        id: `h-${h.id}`,
        date: h.date,
        kind: 'health',
        title: h.type,
        detail: `${h.description}${h.quantity ? ` · Qtd: ${h.quantity.toLocaleString('pt-BR')} aves` : ''}`,
      });
    });

    currentBatch.productions.forEach(p => {
      items.push({
        id: `p-${p.id}`,
        date: p.date,
        kind: 'production',
        title: 'Coleta de Postura',
        detail: `${(p.totalEggs ?? 0).toLocaleString('pt-BR')} ovos · Quebrados: ${(p.brokenEggs ?? 0).toLocaleString('pt-BR')} · Peso médio: ${p.eggWeightAverage ?? 0} g`,
      });
    });

    return items
      .filter(item => filter === 'all' || item.kind === filter)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [currentBatch, filter]);

  if (!currentBatch) {
    return (
      <div className={`${POULTRY_CARD_CLASS} p-8 text-center space-y-3`}>
        <Bird className="w-7 h-7 text-slate-400 dark:text-zinc-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nenhum lote selecionado para o Gêmeo Digital
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          Aloje um lote para visualizar origem, incubatório, galpão e linha do tempo completa de manejos.
        </p>
        <button type="button" onClick={onOpenAddBatch} className={POULTRY_PRIMARY_BTN_CLASS}>
          <Plus className="w-3.5 h-3.5" />
          Novo Lote
        </button>
      </div>
    );
  }

  const shedName =
    sheds.find(s => s.id === currentBatch.shedId)?.identification || 'Galpão não vinculado';
  const ageDays = getBatchAgeDays(currentBatch.housingDate);
  const deadBirds = Math.max(0, currentBatch.initialQuantity - currentBatch.currentQuantity);
  const viabilityPct =
    currentBatch.initialQuantity > 0
      ? ((currentBatch.currentQuantity / currentBatch.initialQuantity) * 100).toFixed(2)
      : '0.00';

  return (
    <div className={`${POULTRY_CARD_CLASS} p-4 sm:p-5 space-y-4`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Gêmeo Digital do Lote
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Identidade zootécnica consolidada e histórico cronológico de eventos do lote.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            aria-label="Selecionar lote"
            value={currentBatch.id}
            onChange={e => {
              onSelectBatch(e.target.value);
              setConfirmDeleteId(null);
            }}
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-medium text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          >
            {batches.map(b => (
              <option key={b.id} value={b.id}>
                {b.code} ({b.lineage})
              </option>
            ))}
          </select>

          {confirmDeleteId === currentBatch.id ? (
            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onDeleteBatch(currentBatch.id);
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
              onClick={() => setConfirmDeleteId(currentBatch.id)}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium transition-colors cursor-pointer"
              title="Remover lote"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remover
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Identity Panel */}
        <div className="lg:col-span-4 space-y-3">
          <div className={`${POULTRY_SUBCARD_CLASS} p-4 space-y-3`}>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                {currentBatch.code}
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                {currentBatch.lineage} · {currentBatch.purpose}
              </p>
            </div>

            <dl className="space-y-2 text-xs pt-2 border-t border-slate-200 dark:border-zinc-800">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Alojamento</dt>
                <dd className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
                  {formatBrDate(currentBatch.housingDate)} ({ageDays} d)
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Qtd. Inicial</dt>
                <dd className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
                  {currentBatch.initialQuantity.toLocaleString('pt-BR')}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Aves Atuais</dt>
                <dd className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
                  {currentBatch.currentQuantity.toLocaleString('pt-BR')} ({viabilityPct}%)
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Baixas Acumuladas</dt>
                <dd className="font-medium tabular-nums text-rose-600 dark:text-rose-400">
                  {deadBirds.toLocaleString('pt-BR')}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Incubatório</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100 text-right">
                  {currentBatch.hatchery || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Fornecedor</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100 text-right">
                  {currentBatch.supplier || '—'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Galpão</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100 text-right">
                  {shedName}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500 dark:text-zinc-400">Responsável Técnico</dt>
                <dd className="font-medium text-slate-900 dark:text-zinc-100 text-right">
                  {currentBatch.technicalResponsible || '—'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onNavigate('pesagem')}
              className={POULTRY_SECONDARY_BTN_CLASS}
            >
              <Scale className="w-3.5 h-3.5" />
              Nova Pesagem
            </button>
            <button
              type="button"
              onClick={() => onNavigate('sanidade')}
              className={POULTRY_SECONDARY_BTN_CLASS}
            >
              <Syringe className="w-3.5 h-3.5" />
              Evento Sanitário
            </button>
          </div>
        </div>

        {/* Chronological Timeline */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Linha do Tempo ({timeline.length} {timeline.length === 1 ? 'registro' : 'registros'})
            </h3>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'weighing', label: 'Pesagens' },
                  { id: 'consumption', label: 'Consumo' },
                  { id: 'health', label: 'Sanidade' },
                  { id: 'production', label: 'Postura' },
                ] as const
              ).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`h-7 px-2.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    filter === tab.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {timeline.length === 0 ? (
            <div className={`${POULTRY_SUBCARD_CLASS} p-6 text-center`}>
              <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                Nenhum evento encontrado para o filtro selecionado.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-1">
                Os lançamentos feitos em Pesagens, Nutrição, Água, Sanidade e Postura aparecem automaticamente aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
              {timeline.map(entry => {
                const Icon =
                  entry.kind === 'weighing'
                    ? Scale
                    : entry.kind === 'consumption'
                      ? Droplets
                      : entry.kind === 'health'
                        ? Syringe
                        : Egg;
                const iconColor =
                  entry.kind === 'weighing'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : entry.kind === 'consumption'
                      ? 'text-sky-600 dark:text-sky-400'
                      : entry.kind === 'health'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-amber-600 dark:text-amber-400';

                return (
                  <div
                    key={entry.id}
                    className="p-3 bg-white dark:bg-zinc-900 flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-md bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                          {entry.title}
                        </p>
                        <span className="text-[11px] tabular-nums text-slate-500 dark:text-zinc-400 shrink-0">
                          {formatBrDate(entry.date)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                        {entry.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
