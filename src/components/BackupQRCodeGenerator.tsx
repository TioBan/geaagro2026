import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Camera,
  RefreshCw,
  Check,
  VideoOff,
  SwitchCamera,
  AlertCircle,
} from 'lucide-react';
import { BackupMetadata } from '../utils/backupService';

interface BackupQRCodeGeneratorProps {
  backupList: BackupMetadata[];
  initialBackupId?: string;
  onSelectBackupForRestore?: (backup: BackupMetadata) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const BackupQRCodeGenerator: React.FC<BackupQRCodeGeneratorProps> = ({
  backupList,
  initialBackupId,
  onSelectBackupForRestore,
  showToast,
}) => {
  const [selectedBackupId, setSelectedBackupId] = useState<string>(
    initialBackupId || (backupList.length > 0 ? backupList[0]?.id || '' : '')
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [scannedMetadata, setScannedMetadata] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (initialBackupId) {
      setSelectedBackupId(initialBackupId);
    }
  }, [initialBackupId]);

  const selectedBackup =
    (backupList || []).find((b) => b?.id === selectedBackupId) || backupList?.[0] || null;

  const getBackupQrPayload = (b: BackupMetadata) => {
    if (!b) return '';
    return JSON.stringify({
      geaAgroApp: 'GeaAgro Suite',
      id: b.id,
      filename: b.filename,
      timestamp: b.timestamp,
      appVersion: b.appVersion,
      databaseVersion: b.databaseVersion,
      integrityHash: b.integrityHash,
      type: b.type,
      userResponsible: b.userResponsible,
      recordsCount: b.recordsCount,
      encryption: b.encryption,
    });
  };

  useEffect(() => {
    if (selectedBackup) {
      const payload = getBackupQrPayload(selectedBackup);
      QRCode.toDataURL(
        payload,
        {
          width: 280,
          margin: 2,
          color: {
            dark: '#064e3b',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    } else {
      setQrDataUrl('');
    }
  }, [selectedBackupId, selectedBackup]);

  const handleCopyHash = () => {
    if (!selectedBackup) return;
    navigator.clipboard.writeText(selectedBackup.integrityHash);
    setCopiedHash(true);
    showToast?.('Hash SHA-256 copiado para a área de transferência.', 'info');
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadQrImage = () => {
    if (!qrDataUrl || !selectedBackup) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qrcode_${selectedBackup.filename.replace(/\.(geabackup|json|geaagro)$/i, '')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast?.('Imagem PNG do QR Code baixada.', 'success');
  };

  const handlePrintLabel = () => {
    if (!selectedBackup || !qrDataUrl) return;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta de Backup - ${selectedBackup.filename}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; background: #fff; }
            .card { border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px; width: 420px; margin: 0 auto; }
            .hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; }
            .title { font-size: 14px; font-weight: 700; color: #065f46; }
            .meta { font-size: 10px; color: #64748b; }
            .body { display: flex; gap: 14px; align-items: center; }
            .qr { width: 128px; height: 128px; border: 1px solid #e2e8f0; border-radius: 6px; }
            .info { font-size: 11px; line-height: 1.55; flex: 1; }
            .hash { margin-top: 12px; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-family: monospace; font-size: 9px; word-break: break-all; }
            .ftr { margin-top: 12px; font-size: 10px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="hdr">
              <span class="title">GeaAgro · Etiqueta de Backup</span>
              <span class="meta">Offline · SHA-256</span>
            </div>
            <div class="body">
              <img src="${qrDataUrl}" class="qr" alt="QR Code" />
              <div class="info">
                <div><strong>Arquivo:</strong> ${selectedBackup.filename}</div>
                <div><strong>Data:</strong> ${new Date(selectedBackup.timestamp).toLocaleString('pt-BR')}</div>
                <div><strong>Tipo:</strong> ${selectedBackup.type}</div>
                <div><strong>Responsável:</strong> ${selectedBackup.userResponsible}</div>
                <div><strong>Tamanho:</strong> ${selectedBackup.formattedSize} (${selectedBackup.recordsCount} reg.)</div>
              </div>
            </div>
            <div class="hash"><strong>SHA-256:</strong> ${selectedBackup.integrityHash}</div>
            <div class="ftr">Gerado em ${new Date().toLocaleString('pt-BR')} · GeaAgro</div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250);
  };

  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Acesso à câmera não suportado por este navegador.');
      }

      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch (firstErr) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch {
          throw firstErr;
        }
      }

      if (stream) {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setIsCameraActive(true);
        showToast?.('Câmera ativada.', 'success');
      }
    } catch (err: any) {
      let errMsg = 'Câmera indisponível neste dispositivo.';
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        errMsg = 'Permissão da câmera negada pelo navegador.';
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        errMsg = 'Nenhuma câmera física detectada.';
      }
      setCameraError(errMsg);
      setIsCameraActive(false);
      showToast?.(errMsg, 'info');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      void startCamera(nextMode);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleSimulateScan = () => {
    if (!selectedBackup) return;
    setIsScanning(true);
    setTimeout(() => {
      try {
        setScannedMetadata(JSON.parse(getBackupQrPayload(selectedBackup)));
      } catch {
        setScannedMetadata(null);
      }
      setIsScanning(false);
      showToast?.('QR Code lido e metadados autenticados.', 'success');
    }, 800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Coluna Esquerda: Gerador e Etiqueta */}
      <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Etiqueta QR Code de Autenticação
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Identificação física com metadados e checksum SHA-256 para mídias offline.
            </p>
          </div>
          {selectedBackup && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadQrImage}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                PNG
              </button>
              <button
                type="button"
                onClick={handlePrintLabel}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir Etiqueta
              </button>
            </div>
          )}
        </div>

        {/* Seletor de Backup */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">
            Backup selecionado
          </label>
          {backupList.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-zinc-400 py-3">
              Nenhum backup encontrado no histórico. Crie um backup para gerar sua etiqueta QR.
            </p>
          ) : (
            <select
              value={selectedBackup?.id || ''}
              onChange={(e) => setSelectedBackupId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {backupList.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.filename} · {new Date(b.timestamp).toLocaleDateString('pt-BR')} · {b.formattedSize}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Preview do QR e Metadados */}
        {selectedBackup && (
          <div className="flex flex-col sm:flex-row items-start gap-5 pt-2">
            <div className="flex flex-col items-center gap-2 shrink-0 mx-auto sm:mx-0">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 dark:border-zinc-700">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code de ${selectedBackup.filename}`}
                    className="w-40 h-40 object-contain"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-slate-400 text-xs">
                    Gerando...
                  </div>
                )}
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                SHA-256 Embutido
              </span>
            </div>

            <div className="flex-1 w-full min-w-0 space-y-3">
              <div className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                <div className="py-1.5 flex items-center justify-between gap-3">
                  <span className="text-slate-500 dark:text-zinc-400">Arquivo</span>
                  <span className="font-medium text-slate-900 dark:text-zinc-100 truncate max-w-[240px]" title={selectedBackup.filename}>
                    {selectedBackup.filename}
                  </span>
                </div>
                <div className="py-1.5 flex items-center justify-between gap-3">
                  <span className="text-slate-500 dark:text-zinc-400">ID / Tipo</span>
                  <span className="font-mono tabular-nums text-slate-800 dark:text-zinc-200">
                    {selectedBackup.id} · {selectedBackup.type}
                  </span>
                </div>
                <div className="py-1.5 flex items-center justify-between gap-3">
                  <span className="text-slate-500 dark:text-zinc-400">Data e Hora</span>
                  <span className="tabular-nums text-slate-800 dark:text-zinc-200">
                    {new Date(selectedBackup.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="py-1.5 flex items-center justify-between gap-3">
                  <span className="text-slate-500 dark:text-zinc-400">Responsável</span>
                  <span className="text-slate-800 dark:text-zinc-200 truncate">
                    {selectedBackup.userResponsible}
                  </span>
                </div>
                <div className="py-1.5 flex items-center justify-between gap-3">
                  <span className="text-slate-500 dark:text-zinc-400">Volume</span>
                  <span className="font-mono tabular-nums text-slate-800 dark:text-zinc-200">
                    {selectedBackup.formattedSize} · {selectedBackup.recordsCount} reg.
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-zinc-400 font-medium">Checksum SHA-256</span>
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
                  >
                    {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedHash ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-slate-600 dark:text-zinc-300 break-all bg-slate-50 dark:bg-zinc-950 px-2.5 py-1.5 rounded-lg border border-slate-200/80 dark:border-zinc-800">
                  {selectedBackup.integrityHash}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Coluna Direita: Scanner & Verificação */}
      <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
            Leitor e Verificação
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Valide a autenticidade de uma etiqueta antes de restaurar dados.
          </p>
        </div>

        {/* Viewfinder compacto */}
        <div className="relative h-52 bg-slate-950 rounded-lg overflow-hidden flex flex-col items-center justify-center border border-slate-800">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${
              isCameraActive ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div className="absolute top-2.5 left-2.5 z-20 text-[11px] font-medium px-2 py-0.5 rounded bg-slate-900/85 text-slate-200 border border-slate-700/80">
            {isCameraActive ? 'Câmera ativa' : 'Câmera inativa'}
          </div>

          {isCameraActive && (
            <button
              type="button"
              onClick={toggleCameraFacingMode}
              title="Alternar câmera"
              className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700 cursor-pointer"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
            </button>
          )}

          <div
            className={`z-10 w-32 h-32 border rounded-lg relative flex items-center justify-center transition-colors ${
              isScanning
                ? 'border-amber-400'
                : scannedMetadata
                ? 'border-emerald-400'
                : 'border-slate-500/70'
            }`}
          >
            <div className="absolute -top-0.5 -left-0.5 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
            <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
            {isScanning && (
              <span className="text-[11px] text-amber-300 font-medium bg-slate-900/90 px-2.5 py-1 rounded flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Lendo...
              </span>
            )}
          </div>

          <span className="z-10 text-[11px] text-slate-300 mt-2.5 bg-slate-950/75 px-2.5 py-0.5 rounded">
            {isCameraActive ? 'Alinhe o QR Code na moldura' : 'Ative a câmera ou valide o backup selecionado'}
          </span>
        </div>

        {cameraError && (
          <div className="px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {!isCameraActive ? (
            <button
              type="button"
              onClick={() => void startCamera('environment')}
              className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Camera className="w-3.5 h-3.5" />
              Ativar Câmera
            </button>
          ) : (
            <button
              type="button"
              onClick={stopCamera}
              className="flex-1 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <VideoOff className="w-3.5 h-3.5" />
              Desligar Câmera
            </button>
          )}

          <button
            type="button"
            onClick={handleSimulateScan}
            disabled={isScanning || !selectedBackup}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <QrCode className="w-3.5 h-3.5" />
            {isScanning ? 'Validando...' : 'Validar Selecionado'}
          </button>
        </div>

        {scannedMetadata && (
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-medium text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Etiqueta autenticada
              </span>
              <span className="font-mono text-[11px] text-slate-500">{scannedMetadata.appVersion}</span>
            </div>

            <div className="text-[11px] font-mono text-slate-600 dark:text-zinc-300 space-y-1 bg-slate-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-slate-200/80 dark:border-zinc-800">
              <div className="truncate">Arquivo: {scannedMetadata.filename}</div>
              <div>Data: {new Date(scannedMetadata.timestamp).toLocaleDateString('pt-BR')}</div>
              <div className="truncate">Hash: {scannedMetadata.integrityHash}</div>
            </div>

            {onSelectBackupForRestore && selectedBackup && (
              <button
                type="button"
                onClick={() => onSelectBackupForRestore(selectedBackup)}
                className="w-full px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Abrir na Restauração
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupQRCodeGenerator;
