import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Camera,
  X,
  Save,
  Navigation,
  FileText,
  Trash2,
  Image as ImageIcon,
  Eye,
  User
} from 'lucide-react';
import { GeoprocessamentoPlotState, GeoprocessamentoInspectionPoint } from '../../data/geoprocessamentoData';

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  plots: GeoprocessamentoPlotState[];
  initialPlotId?: string;
  inspectionToEdit?: GeoprocessamentoInspectionPoint | null;
  onSaveInspection: (inspection: GeoprocessamentoInspectionPoint) => void;
  onDeleteInspection?: (id: string) => void;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({
  isOpen,
  onClose,
  plots,
  initialPlotId,
  inspectionToEdit,
  onSaveInspection,
  onDeleteInspection,
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<string>('');
  const [name, setName] = useState<string>('Vistoria de Campo e Amostragem');
  const [type, setType] = useState<GeoprocessamentoInspectionPoint['type']>('baixo_vigor');
  const [severity, setSeverity] = useState<GeoprocessamentoInspectionPoint['severity']>('media');
  const [status, setStatus] = useState<GeoprocessamentoInspectionPoint['status']>('pendente');
  const [inspectorName, setInspectorName] = useState<string>('Eng. Agr. Responsável');
  const [observations, setObservations] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [recommendedAction, setRecommendedAction] = useState<string>('');
  const [lat, setLat] = useState<number>(-22.3725);
  const [lng, setLng] = useState<number>(-46.9425);
  const [isGettingGps, setIsGettingGps] = useState<boolean>(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (inspectionToEdit) {
      setSelectedPlotId(inspectionToEdit.plotId || plots[0]?.id || '');
      setName(inspectionToEdit.name);
      setType(inspectionToEdit.type);
      setSeverity(inspectionToEdit.severity);
      setStatus(inspectionToEdit.status || 'pendente');
      setInspectorName(inspectionToEdit.inspectorName || 'Eng. Agr. Responsável');
      setObservations(inspectionToEdit.observations || '');
      setDiagnosis(inspectionToEdit.diagnosis || '');
      setRecommendedAction(inspectionToEdit.recommendedAction || '');
      setLat(inspectionToEdit.lat);
      setLng(inspectionToEdit.lng);

      const combinedPhotos: string[] = [];
      if (inspectionToEdit.photoUrl) combinedPhotos.push(inspectionToEdit.photoUrl);
      if (inspectionToEdit.photos && Array.isArray(inspectionToEdit.photos)) {
        inspectionToEdit.photos.forEach(p => {
          if (!combinedPhotos.includes(p)) combinedPhotos.push(p);
        });
      }
      setPhotos(combinedPhotos);
      setIsConfirmingDelete(false);
    } else {
      const defaultPlot = plots.find(p => p.id === initialPlotId) || plots[0];
      setSelectedPlotId(defaultPlot?.id || '');
      setName(`Vistoria ${defaultPlot?.code || 'Talhão'} - ${new Date().toLocaleDateString('pt-BR')}`);
      setType('baixo_vigor');
      setSeverity('media');
      setStatus('pendente');
      setInspectorName('Eng. Agr. Responsável');
      setObservations('');
      setDiagnosis('');
      setRecommendedAction('');
      if (defaultPlot) {
        setLat(defaultPlot.coordinates.lat);
        setLng(defaultPlot.coordinates.lng);
      }
      setPhotos([]);
      setIsConfirmingDelete(false);
    }
  }, [isOpen, inspectionToEdit, initialPlotId, plots]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen) return;
      if (previewPhotoUrl) {
        setPreviewPhotoUrl(null);
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previewPhotoUrl, onClose]);

  if (!isOpen) return null;

  const isEditing = !!inspectionToEdit;
  const currentPlot = plots.find(p => p.id === selectedPlotId) || plots[0];

  const handleGetGps = () => {
    if (navigator.geolocation) {
      setIsGettingGps(true);
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLat(parseFloat(pos.coords.latitude.toFixed(6)));
          setLng(parseFloat(pos.coords.longitude.toFixed(6)));
          setIsGettingGps(false);
        },
        () => {
          if (currentPlot) {
            setLat(currentPlot.coordinates.lat);
            setLng(currentPlot.coordinates.lng);
          }
          setIsGettingGps(false);
        }
      );
    }
  };

  const handlePhotoFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          setPhotos(prev => [...prev, base64]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = () => {
    const inspectionData: GeoprocessamentoInspectionPoint = {
      id: inspectionToEdit ? inspectionToEdit.id : `insp-${Date.now()}`,
      plotId: selectedPlotId,
      plotCode: currentPlot ? currentPlot.code : 'TAL',
      name: name.trim() || `Vistoria ${currentPlot?.code || 'Campo'}`,
      lat,
      lng,
      type,
      severity,
      status,
      dateCreated: inspectionToEdit ? inspectionToEdit.dateCreated : new Date().toISOString().split('T')[0],
      dateInspected: status !== 'pendente' ? new Date().toISOString().split('T')[0] : undefined,
      inspectorName,
      observations: observations.trim(),
      diagnosis: diagnosis.trim(),
      recommendedAction: recommendedAction.trim(),
      photoUrl: photos[0] || undefined,
      photos,
      associatedIndexValue: inspectionToEdit?.associatedIndexValue || currentPlot?.currentNdvi || 0.65,
    };

    onSaveInspection(inspectionData);
    onClose();
  };

  const handleDelete = () => {
    if (inspectionToEdit && onDeleteInspection) {
      onDeleteInspection(inspectionToEdit.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl max-w-2xl w-full p-5 relative my-auto max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-3.5 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
              isEditing
                ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-200/80 dark:border-sky-800/60 text-sky-600 dark:text-sky-400'
                : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400'
            }`}>
              {isEditing ? <FileText className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  {isEditing ? 'Editar Ponto de Vistoria em Campo' : 'Novo Ponto de Vistoria em Campo'}
                </h3>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                  status === 'concluido'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                    : status === 'em_vistoria'
                      ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                }`}>
                  {status === 'concluido' ? 'Concluído' : status === 'em_vistoria' ? 'Em Vistoria' : 'Pendente'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {isEditing
                  ? 'Atualize fotos de campo, diagnóstico, recomendações e coordenadas GPS'
                  : 'Registre coordenadas GPS para amostragem direcionada por anomalia espectral'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Status Segmented Bar */}
          <div className="p-2.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
              Status da Vistoria
            </span>
            <div className="inline-flex items-center gap-1 flex-wrap">
              {([
                { id: 'pendente', label: 'Pendente', activeClass: 'bg-amber-600 text-white border-amber-600' },
                { id: 'em_vistoria', label: 'Em Vistoria', activeClass: 'bg-sky-600 text-white border-sky-600' },
                { id: 'concluido', label: 'Concluído', activeClass: 'bg-emerald-600 text-white border-emerald-600' },
              ] as const).map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatus(st.id)}
                  className={`h-7 px-2.5 rounded-md text-xs font-medium transition-colors cursor-pointer border whitespace-nowrap ${
                    status === st.id
                      ? st.activeClass
                      : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plot and Title */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                Talhão Alvo
              </label>
              <select
                value={selectedPlotId}
                onChange={e => {
                  setSelectedPlotId(e.target.value);
                  const p = plots.find(plot => plot.id === e.target.value);
                  if (p && !isEditing) {
                    setLat(p.coordinates.lat);
                    setLng(p.coordinates.lng);
                  }
                }}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                {plots.length === 0 ? (
                  <option value="">Sem talhão cadastrado</option>
                ) : (
                  plots.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} ({p.crop})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="sm:col-span-7">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                Título / Identificação do Ponto
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                placeholder="Ex: Ponto #105 - Queda de vigor foliar no bico sul"
              />
            </div>
          </div>

          {/* Anomaly Type and Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                Tipo da Anomalia / Inspeção
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as GeoprocessamentoInspectionPoint['type'])}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="baixo_vigor">Baixo Vigor (NDVI)</option>
                <option value="estresse_hidrico">Estresse Hídrico (NDWI)</option>
                <option value="deficiencia_nutricional">Deficiência Nutricional (GNDVI)</option>
                <option value="falha_plantio">Falha de Plantio (SAVI)</option>
                <option value="praga_doenca">Praga ou Doença (MIP)</option>
                <option value="dano_seca">Dano por Seca</option>
                <option value="dano_geada">Dano por Geada / Frio</option>
                <option value="rotina">Vistoria de Rotina</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                Severidade Estimada
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as GeoprocessamentoInspectionPoint['severity'])}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="baixa">Baixa (Monitoramento)</option>
                <option value="media">Média (Atenção)</option>
                <option value="alta">Alta (Ação Rápida)</option>
                <option value="critica">Crítica (Intervenção Imediata)</option>
              </select>
            </div>
          </div>

          {/* Coordinates & GPS */}
          <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Coordenadas Geográficas (WGS84)</span>
              </span>
              <div className="flex items-center gap-2">
                {currentPlot && (
                  <button
                    type="button"
                    onClick={() => {
                      setLat(currentPlot.coordinates.lat);
                      setLng(currentPlot.coordinates.lng);
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    Centro do Talhão
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleGetGps}
                  disabled={isGettingGps}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{isGettingGps ? 'Obtendo GPS...' : 'Usar GPS Atual'}</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-0.5">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={lat}
                  onChange={e => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono tabular-nums text-slate-800 dark:text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 dark:text-zinc-400 block mb-0.5">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={lng}
                  onChange={e => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono tabular-nums text-slate-800 dark:text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Field Photos */}
          <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 tabular-nums">
                  <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Fotos de Campo e Evidências ({photos.length})</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Anexe registros capturados diretamente na lavoura
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoFilesSelected}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoFilesSelected}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Tirar Foto</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-2.5 bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Galeria</span>
                </button>
              </div>
            </div>

            {photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {photos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 bg-zinc-950 aspect-4/3"
                  >
                    <img
                      src={photoUrl}
                      alt={`Foto de campo ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewPhotoUrl(photoUrl)}
                        className="h-7 w-7 rounded-md bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center cursor-pointer"
                        title="Ampliar foto"
                        aria-label="Ampliar foto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="h-7 w-7 rounded-md bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center cursor-pointer"
                        title="Remover foto"
                        aria-label="Remover foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3.5 text-center rounded-lg border border-dashed border-slate-200 dark:border-zinc-700 text-xs text-slate-500 dark:text-zinc-400">
                Nenhuma foto anexada a este ponto de vistoria. Utilize a câmera ou a galeria acima.
              </div>
            )}
          </div>

          {/* Observations */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
              Observações e Sintomas Visuais em Campo
            </label>
            <textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-800 dark:text-zinc-100 resize-none outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              placeholder="Ex: Folhas apicais com clorose nas bordas e menor turgescência na reboleira."
            />
          </div>

          {/* Diagnosis and Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                Diagnóstico Agronômico
              </label>
              <textarea
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-800 dark:text-zinc-100 resize-none outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                placeholder="Ex: Entupimento localizado do gotejador gerando déficit hídrico pontual."
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1">
                Ação Corretiva Recomendada
              </label>
              <textarea
                value={recommendedAction}
                onChange={e => setRecommendedAction(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-800 dark:text-zinc-100 resize-none outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                placeholder="Ex: Limpeza de linha e ajuste de pressão na derivação secundária."
              />
            </div>
          </div>

          {/* Inspector Name */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <label className="text-xs font-medium text-slate-600 dark:text-zinc-400 shrink-0">
              Responsável Técnico
            </label>
            <input
              type="text"
              value={inspectorName}
              onChange={e => setInspectorName(e.target.value)}
              className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-800 dark:text-zinc-100 outline-none focus:border-emerald-500"
              placeholder="Nome do Agrônomo / Técnico"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3.5 mt-4 border-t border-slate-100 dark:border-zinc-800 shrink-0">
          <div>
            {isEditing && onDeleteInspection && (
              !isConfirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="h-9 px-3 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-200 dark:border-rose-900/60 whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Confirmar?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="h-8 px-2.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    Excluir
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Atualizar Ponto' : 'Salvar Ponto'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Photo Fullscreen Lightbox */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute -top-10 right-0 h-8 w-8 flex items-center justify-center text-white/80 hover:text-white rounded-lg bg-black/50 cursor-pointer"
              aria-label="Fechar ampliação"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewPhotoUrl}
              alt="Foto ampliada da inspeção"
              referrerPolicy="no-referrer"
              className="max-h-[85vh] max-w-full object-contain rounded-xl border border-white/15"
            />
          </div>
        </div>
      )}
    </div>
  );
};
