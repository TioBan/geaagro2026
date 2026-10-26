import React from 'react';
import {
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Database
} from 'lucide-react';

interface AppUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyUpdate: () => void;
  currentVersion?: string;
  isChecking?: boolean;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  isOpen,
  onClose,
  onApplyUpdate,
  currentVersion = '4.2.3.4',
  isChecking = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-emerald-200 dark:border-emerald-800/60 overflow-hidden space-y-0 transform transition-all animate-scale-up">
        {/* Banner Superior com Gradiente */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-2xl shrink-0 shadow-inner">
                <RefreshCw className="w-6 h-6 animate-spin-slow text-emerald-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[11px] font-black text-emerald-300 uppercase tracking-wide">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Atualização Detectada</span>
                </div>
                <h3 id="update-modal-title" className="text-xl font-black text-white mt-1">
                  Nova Versão Disponível
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Fechar notificação (Atualizar mais tarde)"
              aria-label="Fechar notificação"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo Informativo */}
        <div className="p-6 space-y-5">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
            Uma nova versão do <strong>GeaAgro CRM</strong> foi compilada e está pronta para uso no seu dispositivo. Você tem controle total sobre quando deseja atualizar.
          </p>

          {/* Card de Garantia de Integridade de Dados */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2 text-xs">
            <div className="font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Garantia de Preservação dos Seus Dados</span>
            </div>
            <p className="text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed text-[11px]">
              A atualização substitui apenas os arquivos do código do aplicativo. <strong>Todos os seus laudos, análises de solo, propriedades e cadastros no banco de dados local continuam 100% seguros e intactos.</strong>
            </p>
          </div>

          {/* Destaques da Atualização */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              O que esta atualização inclui:
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Melhorias na estabilidade offline e sincronização PWA.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Atualização nos módulos agronômicos e tabelas técnicas.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Correções de desempenho e segurança de código.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Rodapé de Ação / Escolha do Usuário */}
        <div className="p-6 bg-slate-50 dark:bg-zinc-950/80 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-zinc-700 font-bold text-xs text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Atualizar Mais Tarde</span>
          </button>

          <button
            type="button"
            onClick={onApplyUpdate}
            disabled={isChecking}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isChecking ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Atualizando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Atualizar Agora</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export interface AppUpdateBannerProps {
  onOpenModal: () => void;
  onApplyUpdate: () => void;
  onDismiss: () => void;
}

export const AppUpdateBanner: React.FC<AppUpdateBannerProps> = () => {
  // Conforme solicitação do usuário: "não é necessário ter este botão de atualização aqui"
  return null;
};

