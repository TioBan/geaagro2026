import React, { useState } from 'react';
import { Smartphone, Check, Download, Info, Laptop } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const AboutPwaInstallCard: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);
  const [installNotification, setInstallNotification] = useState<string | null>(null);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallNotification('GeaAgro instalado com sucesso.');
      }
    } else {
      setShowInstructions(prev => !prev);
    }
  };

  return (
    <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <Smartphone className="w-3.5 h-3.5 shrink-0" />
            <span>Aplicativo Offline (PWA)</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Instalar App GeaAgro no Dispositivo
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Instale no celular, tablet ou computador para operar 100% offline no campo, com abertura instantânea na tela inicial e zero consumo de dados móveis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isInstalled ? (
            <span className="h-8 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap">
              <Check className="w-3.5 h-3.5" />
              <span>App Instalado</span>
            </span>
          ) : (
            <>
              <button
                id="btn-install-geaagro-app"
                type="button"
                onClick={handleInstallClick}
                className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar App GeaAgro</span>
              </button>
              <button
                id="btn-toggle-install-instructions"
                type="button"
                onClick={() => setShowInstructions(prev => !prev)}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Instruções ({isIOS ? 'iOS' : 'Android / PC'})</span>
              </button>
            </>
          )}
        </div>
      </div>

      {installNotification && (
        <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
          {installNotification}
        </div>
      )}

      {showInstructions && (
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>iPhone / iPad (Safari)</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-zinc-400">
              <li>Abra o GeaAgro no navegador Safari.</li>
              <li>Toque em Compartilhar (quadrado com seta para cima).</li>
              <li>Selecione &quot;Adicionar à Tela de Início&quot; e confirme.</li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Android / Chrome / Edge / Desktop</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-zinc-400">
              <li>Toque no menu de três pontos (⋮) do navegador.</li>
              <li>Selecione &quot;Instalar aplicativo&quot; ou &quot;Adicionar à tela inicial&quot;.</li>
              <li>O ícone será adicionado e funcionará 100% offline.</li>
            </ol>
          </div>
        </div>
      )}
    </section>
  );
};
