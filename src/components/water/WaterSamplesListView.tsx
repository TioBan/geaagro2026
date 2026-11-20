import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Microscope,
  FlaskConical,
  Check,
  X,
} from 'lucide-react';
import { CollectionPoint, WaterAnalysisRecord, WaterPurpose } from '../../types/waterAnalysis';
import {
  EMITTER_RISK_META,
  IGA_META,
  WATER_PURPOSE_LABELS,
  WATER_PURPOSE_OPTIONS,
} from './waterConstants';

interface WaterSamplesListViewProps {
  analyses: WaterAnalysisRecord[];
  collectionPoints: CollectionPoint[];
  selectedAnalysisId: string;
  onSelectAnalysis: (id: string) => void;
  onCreateAnalysis: () => void;
  onEditAnalysis: (record: WaterAnalysisRecord) => void;
  onDeleteAnalysis: (id: string) => void;
  onOpenInterpretation: (id: string) => void;
}

export const WaterSamplesListView: React.FC<WaterSamplesListViewProps> = ({
  analyses,
  collectionPoints,
  selectedAnalysisId,
  onSelectAnalysis,
  onCreateAnalysis,
  onEditAnalysis,
  onDeleteAnalysis,
  onOpenInterpretation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [purposeFilter, setPurposeFilter] = useState<'all' | WaterPurpose>('all');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const pointMap = useMemo(() => {
    const map = new Map<string, CollectionPoint>();
    for (const pt of collectionPoints) {
      map.set(pt.id, pt);
    }
    return map;
  }, [collectionPoints]);

  const filteredAnalyses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return analyses.filter((item) => {
      const pointName = pointMap.get(item.collectionPointId)?.name.toLowerCase() ?? '';
      const matchesSearch =
        !q ||
        item.sampleCode.toLowerCase().includes(q) ||
        item.propertyName.toLowerCase().includes(q) ||
        item.clientName.toLowerCase().includes(q) ||
        item.responsibleTechnician.toLowerCase().includes(q) ||
        pointName.includes(q);
      const matchesPurpose = purposeFilter === 'all' || item.purposes.includes(purposeFilter);
      return matchesSearch && matchesPurpose;
    });
  }, [analyses, pointMap, searchQuery, purposeFilter]);

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por código, fazenda, cliente ou manancial..."
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <select
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value as 'all' | WaterPurpose)}
            aria-label="Filtrar por finalidade"
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas as finalidades</option>
            {WATER_PURPOSE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
            {filteredAnalyses.length} {filteredAnalyses.length === 1 ? 'amostra' : 'amostras'}
          </span>
          <button
            type="button"
            onClick={onCreateAnalysis}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Amostra
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredAnalyses.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 text-center">
          <div className="w-9 h-9 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 flex items-center justify-center mx-auto mb-2.5">
            <FlaskConical className="w-4 h-4" />
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            {analyses.length === 0
              ? 'Nenhuma amostra de água registrada'
              : 'Nenhuma amostra corresponde aos filtros'}
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {analyses.length === 0
              ? 'Clique em "Nova Amostra" para cadastrar um laudo laboratorial.'
              : 'Ajuste os termos de busca ou selecione outra finalidade.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredAnalyses.map((item) => {
            const pt = pointMap.get(item.collectionPointId);
            const isSelected = item.id === selectedAnalysisId;
            const igaMeta = IGA_META[item.calculated.igaClassification];
            const emitterMeta = EMITTER_RISK_META[item.calculated.emitterCloggingRisk];
            const isConfirmingDelete = pendingDeleteId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelectAnalysis(item.id)}
                className={`bg-white dark:bg-zinc-900 border rounded-xl p-4 transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 dark:border-emerald-600'
                    : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                        {item.sampleCode}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500">•</span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                        {item.collectionDate}
                      </span>
                      {isSelected && (
                        <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                          Em foco
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-700 dark:text-zinc-300 mt-0.5 truncate">
                      {pt ? pt.name : 'Manancial não vinculado'} — {item.propertyName || 'Sem propriedade'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                      {item.purposes.map((p) => WATER_PURPOSE_LABELS[p] ?? p).join(' · ') || 'Irrigação'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-bold tabular-nums text-slate-900 dark:text-zinc-100 leading-none">
                      {item.calculated.igaScore}
                    </div>
                    <span className={`text-[11px] font-medium ${igaMeta.textClass}`}>
                      IGA {igaMeta.label}
                    </span>
                  </div>
                </div>

                {/* Metrics Strip */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">pH</span>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                      {item.chemical.ph.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">CE (dS/m)</span>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                      {(item.physical.electricalConductivityMicroS / 1000).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">RAS</span>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                      {item.calculated.sar.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Entupimento</span>
                    <span className={`font-semibold ${emitterMeta.textClass}`}>
                      {emitterMeta.label}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onOpenInterpretation(item.id)}
                    className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Microscope className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    Ver Interpretação
                  </button>

                  <div className="flex items-center gap-1.5">
                    {!isConfirmingDelete ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onEditAnalysis(item)}
                          className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(item.id)}
                          aria-label={`Excluir amostra ${item.sampleCode}`}
                          className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/60 inline-flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="inline-flex items-center gap-1">
                        <span className="text-[11px] font-medium text-rose-700 dark:text-rose-400 mr-1">
                          Excluir?
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteAnalysis(item.id);
                            setPendingDeleteId(null);
                          }}
                          className="h-7 px-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(null)}
                          className="h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          Não
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
