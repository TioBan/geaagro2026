import React, { useState } from 'react';
import { History, Trash2, Clock, Download, FileText, FileCode } from 'lucide-react';
import { NemaAIDiagnosisLog } from '../../utils/nemaAiDb';

interface NemaAIHistorySidebarProps {
  diagnosesHistory: NemaAIDiagnosisLog[];
  selectedHistoryId: string | null;
  onSelect: (item: NemaAIDiagnosisLog) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onClearAll: () => void;
  onExportItem?: (item: NemaAIDiagnosisLog, format: 'pdf' | 'txt') => void;
}

export const NemaAIHistorySidebar: React.FC<NemaAIHistorySidebarProps> = ({
  diagnosesHistory,
  selectedHistoryId,
  onSelect,
  onDelete,
  onClearAll,
  onExportItem,
}) => {
  const [activeExportMenuId, setActiveExportMenuId] = useState<string | null>(null);

  return (
    <div className="lg:col-span-1 space-y-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex flex-col h-[600px] lg:h-[800px] min-w-0">
      <div className="flex items-center justify-between border-b pb-3 dark:border-zinc-800">
        <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
          <History className="w-4 h-4 text-amber-500 animate-pulse" />
          Histórico Nema IA
        </h3>
        {diagnosesHistory.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] font-bold text-rose-600 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-none">
        {diagnosesHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Clock className="w-8 h-8 text-slate-350 dark:text-zinc-650 mb-2 animate-bounce" />
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500">Sem Diagnósticos Salvos</p>
            <p className="text-[10px] text-slate-500 mt-1">Realize uma consulta ao lado para registrar seu histórico localmente.</p>
          </div>
        ) : (
          diagnosesHistory.map((item) => {
            const dateStr = new Date(item.timestamp).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            // Domain badges
            let domainLabel = 'Agronomia';
            let domainColor = 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30';
            if (item.domain === 'fertilidade') {
              domainLabel = 'Nutrição';
              domainColor = 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30';
            } else if (item.domain === 'nematologia') {
              domainLabel = 'Nematologia';
              domainColor = 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30';
            } else if (item.domain === 'pecuaria') {
              domainLabel = 'Pecuária';
              domainColor = 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/30';
            } else if (item.domain === 'avicultura') {
              domainLabel = 'Avicultura';
              domainColor = 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-900/30';
            }

            const isSelected = selectedHistoryId === item.id;
            const isMenuOpen = activeExportMenuId === item.id;

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className={`relative group p-3 rounded-xl border transition-all cursor-pointer text-xs flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-amber-500/5 border-amber-500 shadow-3xs'
                    : 'bg-slate-50/50 hover:bg-slate-50 dark:bg-zinc-950/30 dark:hover:bg-zinc-950/80 border-slate-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${domainColor}`}>
                    {domainLabel}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-bold mr-1">{dateStr}</span>

                    {/* Export dropdown toggle */}
                    {onExportItem && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveExportMenuId(isMenuOpen ? null : item.id);
                          }}
                          className="text-slate-400 hover:text-amber-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 cursor-pointer rounded"
                          title="Exportar prontuário deste atendimento"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-6 w-36 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-lg p-1 z-30"
                          >
                            <button
                              onClick={() => {
                                onExportItem(item, 'pdf');
                                setActiveExportMenuId(null);
                              }}
                              className="w-full text-left px-2 py-1.5 text-[10px] font-bold text-slate-700 dark:text-zinc-200 hover:bg-amber-50 dark:hover:bg-zinc-800 rounded flex items-center gap-1.5 cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-rose-500" />
                              <span>Prontuário PDF</span>
                            </button>
                            <button
                              onClick={() => {
                                onExportItem(item, 'txt');
                                setActiveExportMenuId(null);
                              }}
                              className="w-full text-left px-2 py-1.5 text-[10px] font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded flex items-center gap-1.5 cursor-pointer"
                            >
                              <FileCode className="w-3 h-3 text-blue-500" />
                              <span>Arquivo TXT</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={(e) => onDelete(e, item.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 cursor-pointer rounded"
                      title="Excluir do histórico"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-extrabold text-slate-900 dark:text-white truncate">
                    {item.prompt}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium truncate">
                    {item.farmName} • {item.fieldName}
                  </p>
                </div>

                {item.result?.riskLevel && (
                  <div className="flex items-center gap-1 text-[9px] font-extrabold mt-1 text-slate-500 dark:text-zinc-400">
                    <span>Risco:</span>
                    <span className={
                      item.result.riskLevel === 'Muito Alta' || item.result.riskLevel === 'Alta'
                        ? 'text-rose-600 dark:text-rose-400'
                        : item.result.riskLevel === 'Moderada'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }>
                      {item.result.riskLevel}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

