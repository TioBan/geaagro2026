import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Edit3,
  Edit2,
  Download,
  Upload,
  Grid,
  Save,
  X,
  FileCode,
  FileText,
  Database,
  FileSpreadsheet,
  Image,
  RefreshCw,
  Check,
} from 'lucide-react';
import { PlotBoundary, SoilSamplingPoint, SoilSamplingStatus } from '../../types/soilSampling';

export interface PointFormState {
  code: string;
  lat: number;
  lng: number;
  depth: '0-20' | '20-40' | '0-40';
  date: string;
  subsamplesCount: number;
  status: SoilSamplingStatus;
  soilColor: string;
  notes: string;
}

export interface PlotEditFormState {
  name: string;
  crop: string;
  notes: string;
  areaHa: number;
  perimeterM: number;
}

export interface ImportSummaryState {
  file: File;
  type: string;
  pointsCount: number;
  hasBoundary: boolean;
  hasRaster: boolean;
  parsedData: {
    boundaries?: PlotBoundary[];
    points?: SoilSamplingPoint[];
    overlay?: any;
  };
}

export type ExportFormatType = 'kml' | 'kmz' | 'geojson' | 'gpkg' | 'csv' | 'geotiff';

const INPUT_CLASS =
  'w-full h-8 px-2.5 text-xs border border-slate-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 tabular-nums';

const LABEL_CLASS = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

interface ModalShellProps {
  title: string;
  icon: React.ReactNode;
  maxWidth?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalShell: React.FC<ModalShellProps> = ({
  title,
  icon,
  maxWidth = 'max-w-lg',
  onClose,
  children,
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[1500] bg-black/55 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        className={`bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl w-full ${maxWidth} overflow-hidden max-h-[90vh] flex flex-col`}
      >
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela"
            className="h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 1. MODAL PONTO DE AMOSTRAGEM
 * ============================================================================ */
interface PointModalProps {
  isOpen: boolean;
  editingPoint: SoilSamplingPoint | null;
  pointForm: PointFormState;
  setPointForm: React.Dispatch<React.SetStateAction<PointFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const SoilPointModal: React.FC<PointModalProps> = ({
  isOpen,
  editingPoint,
  pointForm,
  setPointForm,
  onSubmit,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <ModalShell
      title={editingPoint ? `Editar Ponto ${editingPoint.code}` : 'Novo Ponto de Amostragem'}
      icon={<MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="p-4 space-y-3.5 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLASS}>Código da Amostra *</label>
            <input
              type="text"
              required
              value={pointForm.code}
              onChange={(e) => setPointForm({ ...pointForm, code: e.target.value })}
              placeholder="Ex: P-01, ZL-02"
              className={`${INPUT_CLASS} font-mono font-semibold`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Profundidade da Coleta</label>
            <select
              value={pointForm.depth}
              onChange={(e) =>
                setPointForm({ ...pointForm, depth: e.target.value as '0-20' | '20-40' | '0-40' })
              }
              className={`${INPUT_CLASS} cursor-pointer`}
            >
              <option value="0-20">0-20 cm (Camada Arável)</option>
              <option value="20-40">20-40 cm (Subsolo)</option>
              <option value="0-40">0-40 cm (Perfil Total)</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
          <span className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 block">
            Coordenadas Geográficas (WGS84)
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-zinc-400 mb-0.5">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                required
                value={pointForm.lat}
                onChange={(e) =>
                  setPointForm({ ...pointForm, lat: parseFloat(e.target.value) || 0 })
                }
                className={`${INPUT_CLASS} font-mono`}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 dark:text-zinc-400 mb-0.5">
                Longitude
              </label>
              <input
                type="number"
                step="0.000001"
                required
                value={pointForm.lng}
                onChange={(e) =>
                  setPointForm({ ...pointForm, lng: parseFloat(e.target.value) || 0 })
                }
                className={`${INPUT_CLASS} font-mono`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={LABEL_CLASS}>Status da Coleta</label>
            <select
              value={pointForm.status}
              onChange={(e) =>
                setPointForm({ ...pointForm, status: e.target.value as SoilSamplingStatus })
              }
              className={`${INPUT_CLASS} cursor-pointer`}
            >
              <option value="planejado">Planejado</option>
              <option value="coletado">Coletado</option>
              <option value="enviado_laboratorio">Em Laboratório</option>
              <option value="analisado">Laudo Concluído</option>
            </select>
          </div>

          <div>
            <label className={LABEL_CLASS}>Data da Coleta</label>
            <input
              type="date"
              value={pointForm.date}
              onChange={(e) => setPointForm({ ...pointForm, date: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Subamostras</label>
            <input
              type="number"
              min="1"
              max="50"
              value={pointForm.subsamplesCount}
              onChange={(e) =>
                setPointForm({
                  ...pointForm,
                  subsamplesCount: parseInt(e.target.value, 10) || 15,
                })
              }
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>Cor / Classe de Solo</label>
          <input
            type="text"
            value={pointForm.soilColor}
            onChange={(e) => setPointForm({ ...pointForm, soilColor: e.target.value })}
            placeholder="Ex: Latossolo Vermelho Eutrófico"
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>Observações de Campo</label>
          <textarea
            rows={2}
            value={pointForm.notes}
            onChange={(e) => setPointForm({ ...pointForm, notes: e.target.value })}
            placeholder="Anotações de relevo, palhada ou referência no talhão..."
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 border border-slate-200 dark:border-zinc-700 rounded-md font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{editingPoint ? 'Salvar Alterações' : 'Adicionar Ponto'}</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

/* ============================================================================
 * 2. MODAL EDITAR TALHÃO
 * ============================================================================ */
interface EditPlotModalProps {
  isOpen: boolean;
  plotEditForm: PlotEditFormState;
  setPlotEditForm: React.Dispatch<React.SetStateAction<PlotEditFormState>>;
  currentBoundary?: PlotBoundary;
  onSubmit: (e: React.FormEvent) => void;
  onEditVertices: () => void;
  onClearPolygon: () => void;
  onClose: () => void;
}

export const SoilEditPlotModal: React.FC<EditPlotModalProps> = ({
  isOpen,
  plotEditForm,
  setPlotEditForm,
  currentBoundary,
  onSubmit,
  onEditVertices,
  onClearPolygon,
  onClose,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  return (
    <ModalShell
      title="Editar Dados do Talhão"
      icon={<Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="p-4 space-y-3.5 text-xs">
        <div>
          <label className={LABEL_CLASS}>Nome / Identificação do Talhão *</label>
          <input
            type="text"
            required
            value={plotEditForm.name}
            onChange={(e) => setPlotEditForm({ ...plotEditForm, name: e.target.value })}
            className={`${INPUT_CLASS} font-semibold`}
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>Cultura / Variedade Atual</label>
          <input
            type="text"
            placeholder="Ex: Soja Intacta 2, Milho Safrinha"
            value={plotEditForm.crop}
            onChange={(e) => setPlotEditForm({ ...plotEditForm, crop: e.target.value })}
            className={INPUT_CLASS}
          />
        </div>

        <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2.5">
          <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs block">
            Geometria do Contorno
          </span>
          <div className="grid grid-cols-2 gap-3 tabular-nums">
            <div>
              <span className="text-slate-500 dark:text-zinc-400 block text-[10px]">
                Área Calculada
              </span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                {currentBoundary?.areaHa ? `${currentBoundary.areaHa} ha` : 'Não delimitado'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-zinc-400 block text-[10px]">Perímetro</span>
              <strong className="text-slate-900 dark:text-zinc-100 font-semibold text-sm">
                {currentBoundary?.perimeterM ? `${currentBoundary.perimeterM} m` : '—'}
              </strong>
            </div>
          </div>

          {currentBoundary && (
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={onEditVertices}
                className="text-xs text-amber-700 dark:text-amber-400 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ajustar vértices no mapa</span>
              </button>

              {confirmClear ? (
                <div className="inline-flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClearPolygon();
                      setConfirmClear(false);
                      onClose();
                    }}
                    className="h-7 px-2 bg-rose-600 text-white rounded text-[11px] font-semibold cursor-pointer"
                  >
                    Confirmar remoção
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="h-7 px-2 border border-slate-200 dark:border-zinc-700 rounded text-[11px] text-slate-600 dark:text-zinc-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium cursor-pointer"
                >
                  Excluir Contorno
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <label className={LABEL_CLASS}>Observações do Talhão</label>
          <textarea
            rows={2}
            value={plotEditForm.notes}
            onChange={(e) => setPlotEditForm({ ...plotEditForm, notes: e.target.value })}
            placeholder="Histórico de manejo, calagem ou declividade..."
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 border border-slate-200 dark:border-zinc-700 rounded-md font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Dados</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

/* ============================================================================
 * 3. MODAL EXPORTAÇÃO GEOESPACIAL
 * ============================================================================ */
interface ExportModalProps {
  isOpen: boolean;
  exportFormat: ExportFormatType;
  setExportFormat: (fmt: ExportFormatType) => void;
  isExporting: boolean;
  plotName: string;
  areaHa: number | string;
  pointsCount: number;
  onExecute: () => void;
  onClose: () => void;
}

const EXPORT_OPTIONS: Array<{
  id: ExportFormatType;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'kml', title: 'KML (Google Earth)', desc: 'Visualização 3D no Google Earth e monitores GPS.', icon: FileCode },
  { id: 'kmz', title: 'KMZ Compactado', desc: 'Pacote KML compactado com ícones e metadados.', icon: FileCode },
  { id: 'geojson', title: 'GeoJSON (QGIS / SIG)', desc: 'Padrão OGC RFC 7946 para QGIS, ArcGIS e scripts.', icon: FileText },
  { id: 'gpkg', title: 'GeoPackage (.gpkg)', desc: 'Banco espacial padrão aberto para softwares SIG.', icon: Database },
  { id: 'csv', title: 'Planilha CSV', desc: 'Tabela com Lat/Lng, código, profundidade e status.', icon: FileSpreadsheet },
  { id: 'geotiff', title: 'GeoTIFF / Raster', desc: 'Imagem raster ou camadas geoespaciais combinadas.', icon: Image },
];

export const SoilExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  exportFormat,
  setExportFormat,
  isExporting,
  plotName,
  areaHa,
  pointsCount,
  onExecute,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <ModalShell
      title="Exportar Dados de Mapeamento"
      icon={<Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      <div className="p-4 space-y-4 text-xs">
        <p className="text-slate-500 dark:text-zinc-400">
          Selecione o formato para exportar o contorno e os pontos georreferenciados do talhão.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {EXPORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = exportFormat === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setExportFormat(opt.id)}
                className={`text-left p-3 rounded-lg border transition-colors cursor-pointer flex items-start gap-2.5 ${
                  active
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <strong className="block text-slate-900 dark:text-zinc-100 font-semibold">
                    {opt.title}
                  </strong>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug block mt-0.5">
                    {opt.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-between tabular-nums">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Talhão</span>
            <strong className="text-slate-900 dark:text-zinc-100 font-semibold">
              {plotName} ({areaHa} ha)
            </strong>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Pontos</span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {pointsCount}
            </strong>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 border border-slate-200 dark:border-zinc-700 rounded-md font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={onExecute}
            className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>
              {isExporting ? 'Exportando...' : `Baixar ${exportFormat.toUpperCase()}`}
            </span>
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

/* ============================================================================
 * 4. MODAL IMPORTAÇÃO GEOESPACIAL
 * ============================================================================ */
interface ImportModalProps {
  isOpen: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  importDragOver: boolean;
  setImportDragOver: (over: boolean) => void;
  importLoading: boolean;
  importSummary: ImportSummaryState | null;
  importMergeMode: 'replace' | 'append';
  setImportMergeMode: (mode: 'replace' | 'append') => void;
  onFileSelect: (file: File) => void;
  onApply: () => void;
  onClose: () => void;
}

export const SoilImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  fileInputRef,
  importDragOver,
  setImportDragOver,
  importLoading,
  importSummary,
  importMergeMode,
  setImportMergeMode,
  onFileSelect,
  onApply,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <ModalShell
      title="Importar Arquivo Geoespacial"
      icon={<Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
      maxWidth="max-w-xl"
      onClose={onClose}
    >
      <div className="p-4 space-y-4 text-xs">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setImportDragOver(true);
          }}
          onDragLeave={() => setImportDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setImportDragOver(false);
            if (e.dataTransfer.files?.[0]) {
              onFileSelect(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-lg px-5 py-7 text-center cursor-pointer transition-colors ${
            importDragOver
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-slate-300 dark:border-zinc-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-zinc-950/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".kml,.kmz,.geojson,.json,.csv,.txt,.gpkg,.tif,.tiff"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onFileSelect(e.target.files[0]);
                e.target.value = '';
              }
            }}
          />
          <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
            Arraste o arquivo ou clique para selecionar
          </p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            KML, KMZ, GeoJSON, CSV, GeoPackage (.gpkg) e GeoTIFF (.tif)
          </p>
        </div>

        {importLoading && (
          <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-center space-y-1.5">
            <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Processando camadas georreferenciadas...
            </p>
          </div>
        )}

        {importSummary && (
          <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-200/70 dark:border-emerald-900 pb-2">
              <div className="min-w-0">
                <strong className="block text-slate-900 dark:text-zinc-100 font-semibold truncate">
                  {importSummary.file.name}
                </strong>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {importSummary.type} · {(importSummary.file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 tabular-nums">
              <div className="p-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                  Contorno do Talhão
                </span>
                <strong className="text-slate-900 dark:text-zinc-100 font-semibold">
                  {importSummary.hasBoundary ? 'Detectado' : 'Não encontrado'}
                </strong>
              </div>
              <div className="p-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                  Pontos de Amostragem
                </span>
                <strong className="text-slate-900 dark:text-zinc-100 font-semibold">
                  {importSummary.pointsCount} pontos
                </strong>
              </div>
            </div>

            {importSummary.hasRaster && (
              <p className="text-[11px] text-slate-700 dark:text-zinc-300">
                Camada raster GeoTIFF detectada e pronta para sobreposição com controle de opacidade.
              </p>
            )}

            {importSummary.pointsCount > 0 && (
              <div className="pt-2 border-t border-emerald-200/70 dark:border-emerald-900 flex items-center justify-between">
                <span className="text-slate-700 dark:text-zinc-300 font-medium">
                  Modo de gravação:
                </span>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mergeMode"
                      checked={importMergeMode === 'replace'}
                      onChange={() => setImportMergeMode('replace')}
                    />
                    <span>Substituir</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="mergeMode"
                      checked={importMergeMode === 'append'}
                      onChange={() => setImportMergeMode('append')}
                    />
                    <span>Mesclar</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 border border-slate-200 dark:border-zinc-700 rounded-md font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!importSummary}
            onClick={onApply}
            className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Carregar no Mapa</span>
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

/* ============================================================================
 * 5. MODAL GRADE AMOSTRAL REGULAR
 * ============================================================================ */
interface GridModalProps {
  isOpen: boolean;
  areaHa: number;
  gridDensityHa: number;
  setGridDensityHa: (val: number) => void;
  gridDepth: '0-20' | '20-40';
  setGridDepth: (val: '0-20' | '20-40') => void;
  gridSubsamples: number;
  setGridSubsamples: (val: number) => void;
  onGenerate: () => void;
  onClose: () => void;
}

export const SoilGridModal: React.FC<GridModalProps> = ({
  isOpen,
  areaHa,
  gridDensityHa,
  setGridDensityHa,
  gridDepth,
  setGridDepth,
  gridSubsamples,
  setGridSubsamples,
  onGenerate,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <ModalShell
      title="Gerar Grade Amostral Regular"
      icon={<Grid className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
      maxWidth="max-w-md"
      onClose={onClose}
    >
      <div className="p-4 space-y-3.5 text-xs">
        <p className="text-slate-500 dark:text-zinc-400">
          Distribui pontos georreferenciados uniformemente no contorno do talhão ({areaHa} ha).
        </p>

        <div>
          <label className={LABEL_CLASS}>Densidade Amostral (hectares por ponto)</label>
          <select
            value={gridDensityHa}
            onChange={(e) => setGridDensityHa(parseFloat(e.target.value) || 2)}
            className={`${INPUT_CLASS} cursor-pointer`}
          >
            <option value="1">1 ponto a cada 1,0 ha (Alta Precisão)</option>
            <option value="2">1 ponto a cada 2,0 ha (Padrão Recomendado)</option>
            <option value="2.5">1 ponto a cada 2,5 ha</option>
            <option value="3">1 ponto a cada 3,0 ha</option>
            <option value="5">1 ponto a cada 5,0 ha (Extensivo)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLASS}>Profundidade</label>
            <select
              value={gridDepth}
              onChange={(e) => setGridDepth(e.target.value as '0-20' | '20-40')}
              className={`${INPUT_CLASS} cursor-pointer`}
            >
              <option value="0-20">0-20 cm</option>
              <option value="20-40">20-40 cm</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Subamostras / Ponto</label>
            <input
              type="number"
              min="5"
              max="30"
              value={gridSubsamples}
              onChange={(e) => setGridSubsamples(parseInt(e.target.value, 10) || 15)}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg flex items-center justify-between tabular-nums">
          <span className="text-slate-600 dark:text-zinc-400">Estimativa de pontos:</span>
          <strong className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            ~{Math.max(1, Math.round((areaHa || 10) / gridDensityHa))} pontos
          </strong>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 border border-slate-200 dark:border-zinc-700 rounded-md font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onGenerate}
            className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Gerar Grade</span>
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
