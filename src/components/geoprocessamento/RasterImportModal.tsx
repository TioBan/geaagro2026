import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileImage,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  X
} from 'lucide-react';
import { GeoprocessamentoPlotState, GeoprocessamentoRasterUpload } from '../../data/geoprocessamentoData';

interface RasterImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plots: GeoprocessamentoPlotState[];
  onUploadRaster: (raster: GeoprocessamentoRasterUpload) => void;
}

export const RasterImportModal: React.FC<RasterImportModalProps> = ({
  isOpen,
  onClose,
  plots,
  onUploadRaster,
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<string>(plots[0]?.id || '');
  const [sourceType, setSourceType] = useState<GeoprocessamentoRasterUpload['sourceType']>('geotiff');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('42.5 MB');
  const [captureDate, setCaptureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [resolutionMeters, setResolutionMeters] = useState<number>(0.05);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedPlotId(prev => (prev && plots.some(p => p.id === prev) ? prev : plots[0]?.id || ''));
    }
  }, [isOpen, plots]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      timersRef.current.forEach(t => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      if (file.name.toLowerCase().endsWith('.tif') || file.name.toLowerCase().endsWith('.tiff')) {
        setSourceType('geotiff');
      }
    }
  };

  const handleProcessOffline = () => {
    setIsProcessing(true);
    const t1 = window.setTimeout(() => {
      const newRaster: GeoprocessamentoRasterUpload = {
        id: `rast-${Date.now()}`,
        plotId: selectedPlotId,
        fileName: fileName || `ortomosaico_${sourceType}_${captureDate}.tif`,
        fileSize: fileSize || '38.4 MB',
        sourceType,
        captureDate,
        resolutionMeters,
        status: 'processado_offline',
        bandsAvailable:
          sourceType === 'drone' || sourceType === 'multispectral'
            ? ['Red (650nm)', 'Green (560nm)', 'Blue (450nm)', 'RedEdge (730nm)', 'NIR (840nm)']
            : ['Band 4 (Red)', 'Band 8 (NIR)', 'Band 3 (Green)'],
        averageNdvi: 0.72,
      };

      onUploadRaster(newRaster);
      setIsProcessing(false);
      setSuccessMsg('Imagem ortorretificada e índices espectrais calculados offline com sucesso.');
      const t2 = window.setTimeout(() => {
        setSuccessMsg(null);
        setFileName('');
        onClose();
      }, 1400);
      timersRef.current.push(t2);
    }, 900);
    timersRef.current.push(t1);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => !isProcessing && onClose()}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl max-w-xl w-full p-5 relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 pb-3.5 mb-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Importar Fonte de Imagem
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                GeoTIFF, Drone RGB/Multiespectral, sensores agrícolas ou imagem georreferenciada
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg ? (
          <div className="py-8 text-center space-y-2.5">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="text-sm font-medium text-slate-900 dark:text-zinc-100">{successMsg}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Target Plot Selection */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                Vincular ao Talhão
              </label>
              <select
                value={selectedPlotId}
                onChange={e => setSelectedPlotId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                {plots.length === 0 ? (
                  <option value="">Sem talhão cadastrado (vincular depois)</option>
                ) : (
                  plots.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} - {p.crop} ({p.areaHa} ha)
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Source Type */}
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1.5">
                Tipo da Fonte de Imagem
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {([
                  { id: 'geotiff', label: 'GeoTIFF Multibanda' },
                  { id: 'drone', label: 'Drone / Ortomosaico' },
                  { id: 'multispectral', label: 'Câmera Multiespectral' },
                  { id: 'sentinel', label: 'Satélite Sentinel/Planet' },
                  { id: 'jpeg_geo', label: 'JPEG Georreferenciado' },
                  { id: 'sensor_agricola', label: 'Sensor na Barra/Trator' },
                ] as const).map(src => (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setSourceType(src.id)}
                    className={`h-9 px-2.5 rounded-lg border text-xs font-medium text-left transition-colors cursor-pointer truncate ${
                      sourceType === src.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/70'
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Dropzone */}
            <div className="border border-dashed border-slate-300 dark:border-zinc-700 rounded-lg p-5 text-center hover:border-emerald-500 transition-colors cursor-pointer relative bg-slate-50/70 dark:bg-zinc-950/60">
              <input
                type="file"
                accept=".tif,.tiff,.jpg,.jpeg,.png,.zip"
                onChange={handleSimulateFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileImage className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-slate-800 dark:text-zinc-200">
                {fileName || 'Clique ou arraste o arquivo de imagem aqui'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                Formatos aceitos: .TIF, .TIFF, .JPG com worldfile (.JGW), .PNG (.PGW)
              </p>
            </div>

            {/* Capture Date & Spatial Resolution */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                  Data de Captura
                </label>
                <input
                  type="date"
                  value={captureDate}
                  onChange={e => setCaptureDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs tabular-nums text-slate-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                  Resolução Espacial (m/pixel)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={resolutionMeters}
                  onChange={e => setResolutionMeters(parseFloat(e.target.value) || 0.05)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs tabular-nums text-slate-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Offline Notice */}
            <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
              <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="font-semibold">Processamento local:</strong> a extração das matrizes espectrais ocorre diretamente no navegador, sem depender de conexão em campo.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessOffline}
                disabled={isProcessing}
                className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Processando Raster...' : 'Processar e Gerar Índices'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
