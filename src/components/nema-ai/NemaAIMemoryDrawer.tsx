import React, { useState, useEffect } from 'react';
import { Brain, X, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { MemoryCategory, NemaMemoryState } from './types';
import { MEMORY_CATEGORY_LABELS } from '../../utils/nemaAiMemory';

interface NemaAIMemoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  memoryState: NemaMemoryState;
  onToggleEnabled: (enabled: boolean) => void;
  onUpdateSummary: (summary: string) => void;
  onAddManualFact: (category: MemoryCategory, content: string) => void;
  onRemoveFact: (id: string) => void;
  onClearAll: () => void;
}

export const NemaAIMemoryDrawer: React.FC<NemaAIMemoryDrawerProps> = ({
  isOpen,
  onClose,
  memoryState,
  onToggleEnabled,
  onUpdateSummary,
  onAddManualFact,
  onRemoveFact,
  onClearAll,
}) => {
  const [newFactText, setNewFactText] = useState('');
  const [newFactCategory, setNewFactCategory] = useState<MemoryCategory>('observacao_campo');
  const [editingSummary, setEditingSummary] = useState(memoryState.situationSummary);
  const [summarySaved, setSummarySaved] = useState(false);

  useEffect(() => {
    setEditingSummary(memoryState.situationSummary);
  }, [memoryState.situationSummary, isOpen]);

  if (!isOpen) return null;

  const handleSaveSummary = () => {
    onUpdateSummary(editingSummary);
    setSummarySaved(true);
    setTimeout(() => setSummarySaved(false), 2000);
  };

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactText.trim()) return;
    onAddManualFact(newFactCategory, newFactText.trim());
    setNewFactText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Modo Memória Contínua da Nema IA
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Mantém contexto vivo do que está acontecendo na fazenda entre atendimentos.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            title="Fechar painel de memória"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Activation switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800">
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                Memória Contínua {memoryState.enabled ? 'Ativada' : 'Pausada'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                Quando ativa, a IA lembra fatos anteriores e atualiza a situação automaticamente a cada consulta.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onToggleEnabled(!memoryState.enabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                memoryState.enabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
              }`}
              role="switch"
              aria-checked={memoryState.enabled}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
                  memoryState.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Rolling situation summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Cenário Atual (O que está havendo agora)
              </label>
              <button
                type="button"
                onClick={handleSaveSummary}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {summarySaved ? (
                  <>
                    <Check className="w-3 h-3" /> Salvo
                  </>
                ) : (
                  'Salvar resumo'
                )}
              </button>
            </div>
            <textarea
              rows={2}
              value={editingSummary}
              onChange={(e) => setEditingSummary(e.target.value)}
              placeholder="Ex: Talhão 04 com reboleira de Pratylenchus e V% baixo; lote de recria entrando em suplementação de seca..."
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Add manual fact */}
          <form onSubmit={handleAddFact} className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">
              Registrar fato ou ocorrência manualmente
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={newFactCategory}
                onChange={(e) => setNewFactCategory(e.target.value as MemoryCategory)}
                className="sm:w-44 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(MEMORY_CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newFactText}
                onChange={(e) => setNewFactText(e.target.value)}
                placeholder="Ex: Aplicado 2 t/ha de calcário dolomítico no Pivô 02 em out/2025..."
                className="flex-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!newFactText.trim()}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Fixar</span>
              </button>
            </div>
          </form>

          {/* Stored memory items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Fatos Memorizados ({memoryState.items.length})
              </span>
              {memoryState.items.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Limpar memória</span>
                </button>
              )}
            </div>

            {memoryState.items.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
                <AlertCircle className="w-5 h-5 mx-auto mb-1.5 text-slate-400" />
                Nenhum fato memorizado ainda. Converse com a Nema IA ou adicione registros acima.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {memoryState.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-400">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {MEMORY_CATEGORY_LABELS[item.category] || 'Observação'}
                        </span>
                        <span>•</span>
                        <span>{item.source === 'auto' ? 'Aprendido na conversa' : 'Manual'}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <p className="text-slate-800 dark:text-zinc-200 leading-relaxed">{item.content}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveFact(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer shrink-0"
                      title="Remover fato"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
