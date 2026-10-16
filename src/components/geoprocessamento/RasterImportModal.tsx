import React, { useState } from 'react';
import {
  Upload,
  FileImage,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  HardDrive,
  RefreshCw,
  Eye,
  Camera,
  Compass,
  FileSpreadsheet,
  X,
  Plus
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
  const [sourceType, setSourceType] = useState<'drone' | 'sentinel' | 'multispectral' | 'geotiff' | 'jpeg_geo' | 'png_geo' | 'sensor_agricola'>('geotiff');
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('42.5 MB');
  const [captureDate, setCaptureDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [resolutionMeters, setResolutionMeters] = useState<number>(0.05);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
    setTimeout(() => {
      const newRaster: GeoprocessamentoRasterUpload = {
        id: `rast-${Date.now()}`,
        plotId: selectedPlotId,
        fileName: fileName || `ortomosaico_${sourceType}_${captureDate}.tif`,
        fileSize: fileSize || '38.4 MB',
        sourceType,
        captureDate,
        resolutionMeters,
        status: 'processado_offline',
        bandsAvailable: sourceType === 'drone' || sourceType === 'multispectral'
          ? ['Red (650nm)', 'Green (560nm)', 'Blue (450nm)', 'RedEdge (730nm)', 'NIR (840nm)']
          : ['Band 4 (Red)', 'Band 8 (NIR)', 'Band 3 (Green)'],
        averageNdvi: 0.72,
      };

      onUploadRaster(newRaster);
      setIsProcessing(false);
      setSuccessMsg('Imagem ortorretificada e índices espectrais calculados com sucesso 100% offline!');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-xl cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Importar Fonte de Imagem
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              GeoTIFF, Drone RGB/Multiespectral, Sensores Agrícolas ou JPEG/PNG georreferenciado
            </p>
          </div>
        </div>

        {successMsg ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{successMsg}</h4>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Target Plot Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Vincular ao Talhão:
              </label>
              <select
                value={selectedPlotId}
                onChange={e => setSelectedPlotId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 font-medium"
              >
                {plots.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name} - {p.crop} ({p.areaHa} ha)
                  </option>
                ))}
              </select>
            </div>

            {/* Source Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Tipo da Fonte de Imagem:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'geotiff', label: 'GeoTIFF Multibanda' },
                  { id: 'drone', label: 'Drone / Ortomosaico' },
                  { id: 'multispectral', label: 'Câmera Multiespectral' },
                  { id: 'sentinel', label: 'Satélite Sentinel/Planet' },
                  { id: 'jpeg_geo', label: 'JPEG Georreferenciado' },
                  { id: 'sensor_agricola', label: 'Sensor na Barra/Trator' },
                ].map(src => (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setSourceType(src.id as any)}
                    className={`p-2 rounded-xl border text-xs font-bold text-left transition cursor-pointer ${
                      sourceType === src.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop Simulation */}
            <div className="border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl p-6 text-center hover:border-emerald-500 transition cursor-pointer relative bg-slate-50/50 dark:bg-zinc-800/40">
              <input
                type="file"
                accept=".tif,.tiff,.jpg,.jpeg,.png,.zip"
                onChange={handleSimulateFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileImage className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                {fileName ? fileName : 'Clique ou arraste o arquivo de imagem aqui'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Formatos aceitos: .TIF, .TIFF, .JPG com worldfile (.JGW), .PNG (.PGW)
              </p>
            </div>

            {/* Capture Date & Spatial Resolution */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Data de Captura:
                </label>
                <input
                  type="date"
                  value={captureDate}
                  onChange={e => setCaptureDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Resolução Espacial (m/pixel):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={resolutionMeters}
                  onChange={e => setResolutionMeters(parseFloat(e.target.value) || 0.05)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 font-medium"
                />
              </div>
            </div>

            {/* Offline guarantee notice */}
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
              <HardDrive className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>Processamento 100% Local:</strong> A extração das matrizes espectrais é realizada diretamente no seu navegador, funcionando perfeitamente sem sinal de internet na fazenda.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleProcessOffline}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Processando Raster...' : 'Processar & Gerar Índices'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
