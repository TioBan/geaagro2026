import React from 'react';
import { X, Share2, ShieldCheck, FileCheck2, MapPin, Calendar, Clock, Lock } from 'lucide-react';
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
  if (!isOpen || !pericia) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <Share2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Cadeia de Custódia & Auditabilidade do Processo #{pericia.codigoPericia}
              </h3>
              <p className="text-xs text-slate-500">Rastreabilidade integral de fotografias, amostras e diário de campo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 text-xs overflow-y-auto flex-1 overscroll-contain">
          {/* Security Banner */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-emerald-950 dark:text-emerald-200">Garantia de Inalterabilidade de Dados</h4>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
                Todas as evidências registradas contêm marcação temporal, geolocalização e são vinculadas ao perito responsável ({pericia.responsavelTecnico}).
              </p>
            </div>
          </div>

          {/* Chain Items */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] border-b pb-2">
              Evidências Vinculadas Oficialmente ({pericia.cadeiaEvidencias.length})
            </h4>

            {pericia.cadeiaEvidencias.length === 0 ? (
              <p className="text-slate-400 italic">Nenhuma evidência vinculada à cadeia ainda.</p>
            ) : (
              pericia.cadeiaEvidencias.map(ev => (
                <div
                  key={ev.id}
                  className="p-4 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 rounded">
                      {ev.codigoUnico}
                    </span>
                    <span className="text-slate-400 text-[10px]">{ev.data} • {ev.local}</span>
                  </div>

                  <h5 className="font-bold text-slate-900 dark:text-white text-sm">{ev.fato}</h5>
                  <p className="text-slate-600 dark:text-zinc-300"><strong>Análise:</strong> {ev.analise}</p>
                  {ev.conclusao && (
                    <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      <strong>Conclusão:</strong> {ev.conclusao}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
