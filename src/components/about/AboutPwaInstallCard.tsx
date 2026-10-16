import React, { useState } from 'react';
import {
  Smartphone,
  WifiOff,
  CheckCircle2,
  Check,
  Download,
  Info,
  Laptop,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const AboutPwaInstallCard: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [installNotification, setInstallNotification] = useState<string | null>(null);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallNotification('GeaAgro instalado com sucesso!');
      }
    } else {
      setShowIOSInstructions(prev => !prev);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border-2 border-emerald-500/40 relative overflow-hidden">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500"></div>
      <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
            <span>GeaAgro em seu celular</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-2.5">
            <Smartphone className="w-6 h-6 text-emerald-400" />
            <span>Instalar App GeaAgro no Dispositivo</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Instale o aplicativo <strong>GeaAgro</strong> diretamente no seu smartphone, tablet ou computador. 
            Uma vez instalado, ele roda como aplicativo nativo <strong>100% sem necessidade de conexão com a internet</strong> no campo, salvando seus dados localmente com segurança.
          </p>

          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start pt-1 text-xs">
            <span className="bg-emerald-950/90 border border-emerald-700/60 px-2.5 py-1 rounded-md text-emerald-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Uso em áreas sem sinal de celular
            </span>
            <span className="bg-emerald-950/90 border border-emerald-700/60 px-2.5 py-1 rounded-md text-emerald-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Abertura instantânea na tela inicial
            </span>
            <span className="bg-emerald-950/90 border border-emerald-700/60 px-2.5 py-1 rounded-md text-emerald-200 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Zero consumo de dados móveis
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-auto">
          {installNotification && (
            <div className="mb-3 p-2 bg-emerald-500/30 border border-emerald-400 text-emerald-200 text-xs font-bold rounded-lg text-center animate-fade-in">
              {installNotification}
            </div>
          )}

          {isInstalled ? (
            <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-4 text-center space-y-2 w-full max-w-xs">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 mx-auto flex items-center justify-center font-bold">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="text-sm font-bold text-emerald-300">App GeaAgro Instalado!</div>
              <p className="text-xs text-slate-300">
                Você já está executando o aplicativo no modo PWA standalone e pronto para uso offline no campo.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-center w-full max-w-xs">
              <button
                id="btn-install-geaagro-app"
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm sm:text-base border border-emerald-200/50"
              >
                <Download className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                <span>Instalar App GeaAgro</span>
              </button>

              <p className="text-[11px] text-slate-300 text-center font-medium">
                {isInstallable
                  ? 'Clique para instalar no seu celular, tablet ou computador'
                  : 'Instalação instantânea PWA para Android, iOS e Desktop'}
              </p>

              <button
                id="btn-toggle-install-instructions"
                onClick={() => setShowIOSInstructions(!showIOSInstructions)}
                className="text-xs text-emerald-400 hover:text-emerald-300 underline font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Instruções de Instalação ({isIOS ? 'iPhone / iOS' : 'Android / PC'})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions Drawer / Card */}
      {showIOSInstructions && (
        <div className="mt-6 pt-6 border-t border-emerald-800/60 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in text-xs">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-emerald-500/30 space-y-2">
            <h4 className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
              <Smartphone className="w-4 h-4" />
              <span>No iPhone / iPad (Safari):</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 font-medium">
              <li>Abra o GeaAgro no navegador <strong>Safari</strong>.</li>
              <li>Toque no botão <strong>Compartilhar</strong> (quadrado com seta para cima).</li>
              <li>Role a lista para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</li>
              <li>Confirme o nome <strong>GeaAgro</strong> e toque em <strong>Adicionar</strong>.</li>
            </ol>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-emerald-500/30 space-y-2">
            <h4 className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
              <Laptop className="w-4 h-4" />
              <span>No Android / Chrome / Edge / Desktop:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 font-medium">
              <li>Toque no menu de três pontos <strong>(⋮)</strong> do navegador no topo.</li>
              <li>Selecione a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
              <li>O ícone do <strong>GeaAgro</strong> será adicionado e funcionará 100% offline.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
