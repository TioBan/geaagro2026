import React, { useEffect } from 'react';
import { X, Share2, ShieldCheck } from 'lucide-react';
import { Pericia } from '../../types/pericia';

interface EvidenceChainModalProps {
  isOpen: boolean;
  pericia: Pericia | null;
  onClose: () => void;
}

export const EvidenceChainModal: React.FC<EvidenceChainModalProps> = ({
  isOpen,
  pericia,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !pericia) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[88vh]">
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Cadeia de Custódia — {pericia.codigoPericia}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Rastreabilidade de evidências fotográficas, amostras e registros de campo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          <div className="p-3.5 rounded-lg border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-900 dark:text-zinc-100">Rastreabilidade e Auditabilidade</div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                Registros vinculados com data, local e responsabilidade técnica de {pericia.responsavelTecnico || 'Perito RT'}.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Evidências Vinculadas ({pericia.cadeiaEvidencias.length})
            </div>

            {pericia.cadeiaEvidencias.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg text-slate-500 dark:text-zinc-400">
                Nenhuma evidência vinculada à cadeia ainda.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800 border border-slate-200/80 dark:border-zinc-800 rounded-lg">
                {pericia.cadeiaEvidencias.map(ev => (
                  <div key={ev.id} className="p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        {ev.codigoUnico}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                        {ev.data} · {ev.local}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-zinc-100">{ev.fato}</div>
                    <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                      <span className="font-medium text-slate-700 dark:text-zinc-200">Análise:</span> {ev.analise}
                    </p>
                    {ev.conclusao && (
                      <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                        Conclusão: {ev.conclusao}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200/80 dark:border-zinc-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
