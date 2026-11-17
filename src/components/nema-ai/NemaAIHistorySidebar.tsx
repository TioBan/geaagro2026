import React, { useState, useMemo } from 'react';
import {
  History,
  Trash2,
  Clock,
  Download,
  FileText,
  FileCode,
  Search,
  Plus,
  Brain,
} from 'lucide-react';
import { NemaAIDiagnosisLog } from '../../utils/nemaAiDb';
import { AIDomain } from './types';
import { DOMAINS_CONFIG } from './presets';

interface NemaAIHistorySidebarProps {
  diagnosesHistory: NemaAIDiagnosisLog[];
  selectedHistoryId: string | null;
  memoryEnabled: boolean;
  memoryCount: number;
  onOpenMemory: () => void;
  onNewChat: () => void;
  onSelect: (item: NemaAIDiagnosisLog) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onClearAll: () => void;
  onExportItem?: (item: NemaAIDiagnosisLog, format: 'pdf' | 'txt') => void;
}

export const NemaAIHistorySidebar: React.FC<NemaAIHistorySidebarProps> = ({
  diagnosesHistory,
  selectedHistoryId,
  memoryEnabled,
  memoryCount,
  onOpenMemory,
  onNewChat,
  onSelect,
  onDelete,
  onClearAll,
  onExportItem,
}) => {
  const [activeExportMenuId, setActiveExportMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState<'all' | AIDomain>('all');

  const filteredHistory = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return diagnosesHistory.filter((item) => {
      if (domainFilter !== 'all' && item.domain !== domainFilter) return false;
      if (!q) return true;
      return (
        item.prompt?.toLowerCase().includes(q) ||
        item.farmName?.toLowerCase().includes(q) ||
        item.cropOrPasture?.toLowerCase().includes(q) ||
        item.fieldName?.toLowerCase().includes(q)
      );
    });
  }, [diagnosesHistory, searchTerm, domainFilter]);

  const getDomainLabel = (domain: string) => {
    return DOMAINS_CONFIG.find((d) => d.id === domain)?.label || 'Agronomia';
  };

  return (
    <aside className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 flex flex-col h-[640px] lg:h-[760px] min-w-0 overflow-hidden">
      {/* Top Bar */}
      <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              Histórico de Conversas
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {diagnosesHistory.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-[11px] font-medium text-slate-400 hover:text-rose-600 transition-colors cursor-pointer px-1.5 py-0.5 rounded"
                title="Apagar todo o histórico"
              >
                Limpar
              </button>
            )}
            <button
              onClick={onNewChat}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
              title="Iniciar nova conversa"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova</span>
            </button>
          </div>
        </div>

        {/* Search & Domain Filter */}
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conversa..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value as 'all' | AIDomain)}
            className="w-24 px-2 py-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-emerald-500"
            title="Filtrar por especialidade"
          >
            <option value="all">Todas</option>
            {DOMAINS_CONFIG.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Clock className="w-7 h-7 text-slate-300 dark:text-zinc-700 mb-2" />
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              {diagnosesHistory.length === 0 ? 'Sem conversas salvas' : 'Nenhum resultado encontrado'}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
              Suas consultas com a Nema IA ficam organizadas aqui localmente.
            </p>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const dateStr = new Date(item.timestamp).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
            const isSelected = selectedHistoryId === item.id;
            const isMenuOpen = activeExportMenuId === item.id;
            const msgCount = item.messages?.length || 2;

            return (
              <div
                key={item.id}
                onClick={() => onSelect(item)}
                className={`relative group p-3 rounded-xl border transition-colors cursor-pointer text-xs space-y-1.5 ${
                  isSelected
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500/60'
                    : 'bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-950/60 border-slate-200/80 dark:border-zinc-800/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                    {getDomainLabel(item.domain)}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-slate-400">{dateStr}</span>

                    {onExportItem && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveExportMenuId(isMenuOpen ? null : item.id);
                          }}
                          className="text-slate-400 hover:text-emerald-600 opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 cursor-pointer rounded"
                          title="Exportar conversa"
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
                              className="w-full text-left px-2 py-1.5 text-[11px] font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded flex items-center gap-1.5 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-rose-500" />
                              <span>Prontuário PDF</span>
                            </button>
                            <button
                              onClick={() => {
                                onExportItem(item, 'txt');
                                setActiveExportMenuId(null);
                              }}
                              className="w-full text-left px-2 py-1.5 text-[11px] font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded flex items-center gap-1.5 cursor-pointer"
                            >
                              <FileCode className="w-3.5 h-3.5 text-sky-500" />
                              <span>Arquivo TXT</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={(e) => onDelete(e, item.id)}
                      className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 cursor-pointer rounded"
                      title="Excluir conversa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {item.prompt}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400">
                  <span className="truncate">
                    {item.farmName || 'Fazenda'} • {item.cropOrPasture}
                  </span>
                  <span className="shrink-0 ml-1 tabular-nums">{msgCount} msgs</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Memory Status Bar */}
      <div className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60">
        <button
          onClick={onOpenMemory}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/60 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Brain
              className={`w-4 h-4 shrink-0 ${
                memoryEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
              }`}
            />
            <div className="min-w-0">
              <span className="text-[11px] font-semibold text-slate-900 dark:text-white block">
                Modo Memória {memoryEnabled ? 'Ativo' : 'Pausado'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block truncate">
                {memoryCount} {memoryCount === 1 ? 'fato registrado' : 'fatos registrados'}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
            Gerenciar
          </span>
        </button>
      </div>
    </aside>
  );
};
