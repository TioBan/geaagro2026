import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X,
  Plus,
  Save,
  Navigation,
  FileText,
  Trash2,
  Image as ImageIcon,
  Clock,
  Sparkles,
  Eye,
  Check,
  User,
  Activity
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
  const [name, setName] = useState<string>('Vistoria de Campo & Amostragem');
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

  // Sync state when opening or when inspectionToEdit changes
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
          // Fallback to plot coordinates
          if (currentPlot) {
            setLat(currentPlot.coordinates.lat);
            setLng(currentPlot.coordinates.lng);
          }
          setIsGettingGps(false);
        }
      );
    }
  };

  // Convert File to Base64 data URL for offline storage
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

    // Reset input
    e.target.value = '';
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddSamplePhoto = (sampleUrl: string) => {
    setPhotos(prev => [...prev, sampleUrl]);
  };

  const handleSave = () => {
    const inspectionData: GeoprocessamentoInspectionPoint = {
      id: inspectionToEdit ? inspectionToEdit.id : `insp-${Date.now()}`,
      plotId: selectedPlotId,
      plotCode: currentPlot ? currentPlot.code : 'TAL',
      name: name.trim() || `Vistoria ${currentPlot?.code}`,
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
      photos: photos,
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
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative animate-in fade-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
            isEditing
              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400'
              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
          }`}>
            {isEditing ? <FileText className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {isEditing ? 'Editar Ponto de Inspeção em Campo' : 'Novo Ponto de Inspeção em Campo'}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                status === 'concluido'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : status === 'em_vistoria'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
              }`}>
                {status === 'concluido' ? 'Concluído' : status === 'em_vistoria' ? 'Em Vistoria' : 'Pendente'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {isEditing
                ? 'Atualize fotos de campo, laudos, diagnóstico e coordenadas deste ponto'
                : 'Gere coordenadas GPS para amostragem direcionada por anomalia espectral'}
            </p>
          </div>
        </div>

        {/* Form Body - Scrollable */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Status Switcher Bar */}
          <div className="p-2 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 ml-1">
              Status da Vistoria:
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'pendente' as const, label: 'Pendente 🕒', activeClass: 'bg-amber-600 text-white' },
                { id: 'em_vistoria' as const, label: 'Em Vistoria 🚜', activeClass: 'bg-blue-600 text-white' },
                { id: 'concluido' as const, label: 'Concluído / Laudo ✅', activeClass: 'bg-emerald-600 text-white' },
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatus(st.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    status === st.id
                      ? `${st.activeClass} shadow-2xs`
                      : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 border border-slate-200/60 dark:border-zinc-700'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Plot and Title row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Talhão Alvo:
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 font-medium"
              >
                {plots.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name} ({p.crop})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-7">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Título / Identificação do Ponto:
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 font-medium"
                placeholder="Ex: Ponto #105 - Queda de vigor foliar no bico sul"
              />
            </div>
          </div>

          {/* Anomaly type and Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Tipo da Anomalia / Objeto da Inspeção:
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 font-medium"
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
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Severidade Estimada:
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 font-medium"
              >
                <option value="baixa">Baixa (Monitoramento)</option>
                <option value="media">Média (Atenção)</option>
                <option value="alta">Alta (Ação Rápida)</option>
                <option value="critica">Crítica (Intervenção Imediata)</option>
              </select>
            </div>
          </div>

          {/* Coordinates & GPS */}
          <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Coordenadas Geográficas (WGS84):</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (currentPlot) {
                      setLat(currentPlot.coordinates.lat);
                      setLng(currentPlot.coordinates.lng);
                    }
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                >
                  Usar Centro do Talhão
                </button>
                <button
                  type="button"
                  onClick={handleGetGps}
                  disabled={isGettingGps}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{isGettingGps ? 'Obtendo GPS...' : 'Usar GPS Atual'}</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400">Latitude:</span>
                <input
                  type="number"
                  step="0.000001"
                  value={lat}
                  onChange={e => setLat(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Longitude:</span>
                <input
                  type="number"
                  step="0.000001"
                  value={lng}
                  onChange={e => setLng(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* FOTOS DE CAMPO & REGISTRO FOTOGRÁFICO GEORREFERENCIADO */}
          <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Fotos de Campo &amp; Evidências ({photos.length})</span>
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Anexe fotos tiradas na lavoura com registro georreferenciado
                </span>
              </div>

              {/* Action Upload Buttons */}
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

                {/* Camera direct trigger */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Tirar Foto</span>
                </button>

                {/* Gallery upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-200 dark:border-zinc-600 transition cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span>Galeria</span>
                </button>
              </div>
            </div>

            {/* Photos Preview Grid */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {photos.map((photoUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-black aspect-4/3"
                  >
                    <img
                      src={photoUrl}
                      alt={`Foto de campo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:opacity-90 transition"
                    />

                    {/* Overlay controls */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewPhotoUrl(photoUrl)}
                        className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 cursor-pointer shadow-sm transition"
                        title="Ampliar Foto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-sm transition"
                        title="Remover Foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.2 rounded">
                      Foto #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-700 text-xs text-slate-400 space-y-2">
                <p>Nenhuma foto anexada a este ponto de vistoria ainda.</p>
                {/* Quick Samples for immediate demo */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-[10px] text-slate-500">Exemplos rápidos:</span>
                  <button
                    type="button"
                    onClick={() => handleAddSamplePhoto('https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop')}
                    className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700"
                  >
                    + Foto Folha / Clorose
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddSamplePhoto('https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=600&auto=format&fit=crop')}
                    className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700"
                  >
                    + Foto Frutos / Estufa
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Observações Preliminares */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
              Observações &amp; Sintomas Visuais em Campo:
            </label>
            <textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 font-medium resize-none"
              placeholder="Ex: Folhas apicais com coloração amarelada nas bordas e folhas inferiores caídas."
            />
          </div>

          {/* Diagnóstico e Ação Recomendada (para laudos completos) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Diagnóstico Agronômico:
              </label>
              <textarea
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 font-medium resize-none"
                placeholder="Ex: Entupimento localizado do gotejador gerando déficit hídrico pontual."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Ação Corretiva Recomendada:
              </label>
              <textarea
                value={recommendedAction}
                onChange={e => setRecommendedAction(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 font-medium resize-none"
                placeholder="Ex: Limpeza com ácido fosfórico e ajuste de pressão na linha secundária."
              />
            </div>
          </div>

          {/* Inspector name */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">Responsável Técnico:</span>
            <input
              type="text"
              value={inspectorName}
              onChange={e => setInspectorName(e.target.value)}
              className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium"
              placeholder="Nome do Agrônomo / Técnico"
            />
          </div>
        </div>

        {/* Modal Footer with Actions: Delete, Cancel, Save */}
        <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800 shrink-0">
          <div>
            {isEditing && onDeleteInspection && (
              !isConfirmingDelete ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1.5 cursor-pointer border border-rose-200 dark:border-rose-900/60"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Apagar Ponto</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-rose-600">Confirmar exclusão?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition cursor-pointer"
                  >
                    Sim, Apagar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold transition cursor-pointer"
                  >
                    Não
                  </button>
                </div>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Atualizar Ponto' : 'Salvar Ponto de Vistoria'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Photo Fullscreen Zoom Modal */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white rounded-full bg-black/40 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewPhotoUrl}
              alt="Foto ampliada da inspeção"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}
    </div>
  );
};
