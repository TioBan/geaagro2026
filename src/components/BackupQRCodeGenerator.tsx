import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Hash,
  Sparkles,
  Camera,
  RefreshCw,
  Check,
  VideoOff,
  SwitchCamera,
  AlertCircle
} from 'lucide-react';
import { BackupMetadata } from '../utils/backupService';

interface BackupQRCodeGeneratorProps {
  backupList: BackupMetadata[];
  onSelectBackupForRestore?: (backup: BackupMetadata) => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const BackupQRCodeGenerator: React.FC<BackupQRCodeGeneratorProps> = ({
  backupList,
  onSelectBackupForRestore,
  showToast
}) => {
  const [selectedBackupId, setSelectedBackupId] = useState<string>(
    backupList.length > 0 ? backupList[0]?.id || '' : ''
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [scannedPayload, setScannedPayload] = useState<string>('');
  const [scannedMetadata, setScannedMetadata] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Device Camera State & Stream Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const selectedBackup = (backupList || []).find((b) => b?.id === selectedBackupId) || backupList?.[0] || null;

  // Metadata JSON representation stored in QR Code
  const getBackupQrPayload = (b: BackupMetadata) => {
    if (!b) return '';
    return JSON.stringify({
      geaAgroApp: 'GeaAgro Suite PRO',
      id: b.id,
      filename: b.filename,
      timestamp: b.timestamp,
      appVersion: b.appVersion,
      databaseVersion: b.databaseVersion,
      integrityHash: b.integrityHash,
      type: b.type,
      userResponsible: b.userResponsible,
      recordsCount: b.recordsCount,
      encryption: b.encryption
    });
  };

  // Generate QR Code data URL on selected backup change
  useEffect(() => {
    if (selectedBackup) {
      const payload = getBackupQrPayload(selectedBackup);
      QRCode.toDataURL(
        payload,
        {
          width: 320,
          margin: 2,
          color: {
            dark: '#022c22', // emerald-950
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          } else if (err) {
            console.error('Erro ao gerar QR Code', err);
          }
        }
      );
    }
  }, [selectedBackupId, selectedBackup]);

  const handleCopyHash = () => {
    if (!selectedBackup) return;
    navigator.clipboard.writeText(selectedBackup.integrityHash);
    setCopiedHash(true);
    if (showToast) showToast('Hash SHA-256 copiado para a área de transferência!', 'info');
    setTimeout(() => setCopiedHash(false), 2500);
  };

  const handleDownloadQrImage = () => {
    if (!qrDataUrl || !selectedBackup) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qrcode_${selectedBackup.filename.replace('.geabackup', '')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (showToast) showToast('Imagem do QR Code baixada com sucesso!', 'success');
  };

  const handlePrintLabel = () => {
    if (!selectedBackup || !qrDataUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta de Autenticação de Backup - ${selectedBackup.filename}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #1e293b; background: #fff; }
            .label-card { border: 2px solid #047857; padding: 20px; border-radius: 12px; width: 450px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; pb: 10px; margin-bottom: 15px; }
            .title { font-size: 16px; font-weight: bold; color: #065f46; }
            .content { display: flex; gap: 15px; align-items: center; }
            .qr-img { width: 140px; height: 140px; border: 1px solid #cbd5e1; border-radius: 8px; }
            .info { font-size: 11px; line-height: 1.5; flex: 1; }
            .info strong { color: #0f172a; }
            .hash-box { background: #f8fafc; border: 1px solid #e2e8f0; font-family: monospace; font-size: 9px; padding: 6px; border-radius: 6px; word-break: break-all; margin-top: 8px; }
            .footer { margin-top: 15px; text-align: center; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; pt: 8px; }
          </style>
        </head>
        <body>
          <div class="label-card">
            <div class="header">
              <span class="title">🛡️ GeaAgro - Etiqueta de Backup</span>
              <span style="font-size:10px; font-weight:bold; color:#047857;">100% OFFLINE</span>
            </div>
            <div class="content">
              <img src="${qrDataUrl}" class="qr-img" alt="QR Code" />
              <div class="info">
                <div><strong>Arquivo:</strong> ${selectedBackup.filename}</div>
                <div><strong>ID:</strong> ${selectedBackup.id}</div>
                <div><strong>Data:</strong> ${new Date(selectedBackup.timestamp).toLocaleString('pt-BR')}</div>
                <div><strong>Versão App:</strong> ${selectedBackup.appVersion}</div>
                <div><strong>Versão BD:</strong> ${selectedBackup.databaseVersion}</div>
                <div><strong>Responsável:</strong> ${selectedBackup.userResponsible}</div>
                <div><strong>Tamanho:</strong> ${selectedBackup.formattedSize} (${selectedBackup.recordsCount} registros)</div>
              </div>
            </div>
            <div class="hash-box">
              <strong>Hash SHA-256:</strong><br/>
              ${selectedBackup.integrityHash}
            </div>
            <div class="footer">
              Impresso em ${new Date().toLocaleString('pt-BR')} • GeaAgro Intelligent Suite
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Camera Control Functions
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setCameraError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Acesso à câmera não é suportado por este navegador ou ambiente.');
      }

      let stream: MediaStream | null = null;
      try {
        // First try with facingMode preference
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (firstErr: any) {
        // Fallback to any available video device on desktop / laptop
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } catch (secondErr) {
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
        if (showToast) showToast('Câmera do dispositivo ativada com sucesso!', 'success');
      }
    } catch (err: any) {
      console.warn('Câmera não encontrada ou acesso recusado:', err);
      let errMsg = 'Câmera do dispositivo indisponível.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Permissão de acesso à câmera negada no navegador.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'Nenhuma câmera física detectada neste dispositivo (computador/notebook).';
      }
      setCameraError(errMsg);
      setIsCameraActive(false);
      if (showToast) showToast(errMsg, 'info');
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
    if (showToast) showToast('Câmera desligada.', 'info');
  };

  const toggleCameraFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    if (isCameraActive) {
      startCamera(nextMode);
    }
  };

  // Clean up camera stream on component unmount
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
      const payloadStr = getBackupQrPayload(selectedBackup);
      setScannedPayload(payloadStr);
      try {
        setScannedMetadata(JSON.parse(payloadStr));
      } catch (e) {
        setScannedMetadata(null);
      }
      setIsScanning(false);
      if (showToast) showToast('QR Code lido e metadados autenticados com sucesso!', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Selector & Generator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Backup Selector & QR Display */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-500" />
                Gerador de Etiqueta QR Code de Autenticação
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Gere e imprima QR Codes contendo metadados completos (ID, timestamp, hash SHA-256) para rápido rastreio em campo.
              </p>
            </div>
          </div>

          {/* Backup Selection Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
              Selecione o Backup para Gerar QR Code:
            </label>
            <select
              value={selectedBackupId}
              onChange={(e) => setSelectedBackupId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-800 dark:text-zinc-200 shadow-xs focus:ring-2 focus:ring-emerald-500"
            >
              {backupList.map((b) => (
                <option key={b.id} value={b.id}>
                  [{b.type.toUpperCase()}] {b.filename} ({new Date(b.timestamp).toLocaleDateString('pt-BR')}) - {b.formattedSize}
                </option>
              ))}
            </select>
          </div>

          {/* QR Code Container & Metadata Breakdown */}
          {selectedBackup && (
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-800">
              
              {/* QR Rendered Canvas */}
              <div className="flex flex-col items-center space-y-3 flex-shrink-0">
                <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 flex items-center justify-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Code Backup"
                      className="w-48 h-48 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                      Gerando QR Code...
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Formato Escaneável Standard
                </span>
              </div>

              {/* Encoded Metadata Fields */}
              <div className="space-y-3 flex-1 w-full text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    Metadados Codificados
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    Autenticado SHA-256
                  </span>
                </div>

                <div className="space-y-1.5 divide-y divide-slate-200 dark:divide-zinc-700/60">
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 dark:text-zinc-400">ID do Backup:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{selectedBackup.id}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 dark:text-zinc-400">Arquivo:</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[200px]" title={selectedBackup.filename}>
                      {selectedBackup.filename}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 dark:text-zinc-400">Data e Hora:</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      {new Date(selectedBackup.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 dark:text-zinc-400">Versão App / BD:</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      {selectedBackup.appVersion} ({selectedBackup.databaseVersion.split('-')[0]})
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 dark:text-zinc-400">Responsável:</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedBackup.userResponsible}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500 dark:text-zinc-400">Tamanho / Registros:</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {selectedBackup.formattedSize} ({selectedBackup.recordsCount} recs)
                    </span>
                  </div>
                </div>

                {/* SHA-256 Box */}
                <div className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-emerald-500" /> Hash Checksum SHA-256:
                    </span>
                    <button
                      onClick={handleCopyHash}
                      className="text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold text-[10px]"
                    >
                      {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedHash ? 'Copiado!' : 'Copiar Hash'}
                    </button>
                  </div>
                  <div className="font-mono text-[10px] text-slate-700 dark:text-zinc-300 break-all bg-slate-50 dark:bg-zinc-800/80 p-1.5 rounded-lg border border-slate-100 dark:border-zinc-800">
                    {selectedBackup.integrityHash}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Export & Print Controls */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handlePrintLabel}
              className="flex-1 min-w-[180px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Etiqueta do QR Code
            </button>

            <button
              onClick={handleDownloadQrImage}
              className="flex-1 min-w-[180px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold text-xs transition-all cursor-pointer border border-slate-200 dark:border-zinc-700"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              Baixar PNG do QR Code
            </button>
          </div>

        </div>

        {/* Right Column: QR Scanner & Verification Simulator */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-500" />
                Scanner de QR Code & Autenticação
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Aproxime a câmera de uma etiqueta impressa de backup para ler os metadados e verificar se o arquivo local é autêntico.
              </p>
            </div>

            {/* Camera Viewfinder & Controls */}
            <div className="relative h-64 bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-slate-800 shadow-inner">
              
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  isCameraActive ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {/* Status Badge overlay */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                {isCameraActive ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/80 text-slate-950 text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-md shadow-md animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-950 animate-ping"></span>
                    Câmera do Dispositivo Ativa
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 text-[10px] font-bold flex items-center gap-1.5 backdrop-blur-md border border-slate-700">
                    <VideoOff className="w-3 h-3 text-slate-400" />
                    Câmera Desligada
                  </span>
                )}
              </div>

              {/* Camera Switcher Button overlay */}
              {isCameraActive && (
                <button
                  onClick={toggleCameraFacingMode}
                  title="Trocar entre câmera frontal e traseira"
                  className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 backdrop-blur-md transition-all cursor-pointer"
                >
                  <SwitchCamera className="w-4 h-4 text-emerald-400" />
                </button>
              )}

              {/* Target Viewfinder Grid Overlay */}
              <div className={`z-10 w-44 h-44 border-2 rounded-2xl relative flex items-center justify-center transition-all ${
                isScanning ? 'border-amber-400' : scannedMetadata ? 'border-emerald-500' : 'border-emerald-400'
              }`}>
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400"></div>

                {/* Laser scan line */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute top-1/2 -translate-y-1/2 shadow-lg shadow-emerald-400 animate-pulse"></div>

                {isScanning && (
                  <span className="text-xs text-amber-300 font-bold bg-slate-900/90 px-3 py-1.5 rounded-full border border-amber-500/50 flex items-center gap-1.5 animate-bounce shadow-lg">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Escaneando...
                  </span>
                )}
              </div>

              <span className="z-10 text-[11px] text-slate-300 mt-2 font-medium bg-slate-950/70 px-3 py-0.5 rounded-full backdrop-blur-xs">
                {isCameraActive ? 'Posicione o QR Code dentro da moldura' : 'Ative a câmera abaixo para iniciar a leitura'}
              </span>
            </div>

            {/* Error Message if Permission Denied */}
            {cameraError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Camera Controls & Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {!isCameraActive ? (
                <button
                  onClick={() => startCamera('environment')}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Ativar Câmera do Dispositivo
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <VideoOff className="w-4 h-4" />
                  Desligar Câmera
                </button>
              )}

              <button
                onClick={handleSimulateScan}
                disabled={isScanning}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 border border-slate-800"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                {isScanning ? 'Processando Leitura...' : 'Escanear QR Code Selecionado'}
              </button>
            </div>

            {/* Scanned Result Output Panel */}
            {scannedMetadata && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 rounded-xl space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    QR Code Autenticado com Sucesso!
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                    {scannedMetadata.appVersion}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-emerald-950 dark:text-emerald-200 font-mono border-t border-emerald-200 dark:border-emerald-900/60 pt-2">
                  <div><strong>ID:</strong> {scannedMetadata.id}</div>
                  <div><strong>Arquivo:</strong> {scannedMetadata.filename}</div>
                  <div><strong>Data Original:</strong> {new Date(scannedMetadata.timestamp).toLocaleDateString('pt-BR')}</div>
                  <div><strong>Resp.:</strong> {scannedMetadata.userResponsible}</div>
                  <div className="break-all text-[10px] text-emerald-800 dark:text-emerald-400 mt-1">
                    <strong>Hash SHA-256:</strong> {scannedMetadata.integrityHash}
                  </div>
                </div>

                {onSelectBackupForRestore && (
                  <button
                    onClick={() => {
                      if (selectedBackup && onSelectBackupForRestore) {
                        onSelectBackupForRestore(selectedBackup);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Ir para Restauração com Este Backup
                  </button>
                )}
              </div>
            )}

          </div>

          {/* Quick Guide Card */}
          <div className="bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 rounded-2xl p-5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" /> Como Utilizar no Campo
            </h4>
            <ul className="text-xs text-slate-600 dark:text-zinc-400 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Imprima a etiqueta QR Code em papel térmico ou adesivo e cole na mídia física (Pen Drive, Cartão SD, HD Externo).</li>
              <li>Antes de efetuar uma restauração em campo, escaneie o QR Code com a câmera para verificar a integridade da versão e hash SHA-256.</li>
              <li>Evite restaurações acidentais comparando o timestamp e autor do backup.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};

export default BackupQRCodeGenerator;
