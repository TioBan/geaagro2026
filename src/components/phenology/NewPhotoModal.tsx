import React, { useState, useEffect } from 'react';
import { Camera, Image, X } from 'lucide-react';
import { PhenologicalStage, FieldPhotoRecord, CropDigitalTwin } from '../../types/phenology';

interface NewPhotoModalProps {
  currentTwin: CropDigitalTwin;
  stages: PhenologicalStage[];
  onClose: () => void;
  onSave: (photo: FieldPhotoRecord) => void;
}

const inputClass =
  'w-full h-9 px-3 mt-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500';

export const NewPhotoModal: React.FC<NewPhotoModalProps> = ({
  currentTwin,
  stages,
  onClose,
  onSave
}) => {
  const [stageCode, setStageCode] = useState(currentTwin.currentStageCode || 'R1');
  const [caption, setCaption] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [observedBy, setObservedBy] = useState('Equipe Agronômica');
  const [healthStatus, setHealthStatus] =
    useState<'saudavel' | 'atencao' | 'sintoma_detectado'>('saudavel');

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) return;

    const newEntry: FieldPhotoRecord = {
      id: `fphoto-${Date.now()}`,
      twinId: currentTwin.id,
      plotName: currentTwin.plotName,
      stageCode,
      dap: currentTwin.currentDap,
      date: new Date().toISOString().split('T')[0],
      photoUrl,
      caption: caption.trim() || 'Registro fenológico de campo.',
      healthStatus,
      observedBy: observedBy.trim() || 'Equipe Agronômica'
    };
    onSave(newEntry);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Registrar Foto no Diário Fenológico</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Estádio Observado</label>
              <select
                value={stageCode}
                onChange={e => setStageCode(e.target.value)}
                className={inputClass}
              >
                {stages.map(s => (
                  <option key={s.id} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-600 dark:text-zinc-300">Condição de Sanidade</label>
              <select
                value={healthStatus}
                onChange={e =>
                  setHealthStatus(e.target.value as FieldPhotoRecord['healthStatus'])
                }
                className={inputClass}
              >
                <option value="saudavel">Saudável / Vigoroso</option>
                <option value="atencao">Atenção / Leve Sintoma</option>
                <option value="sintoma_detectado">Sintoma / Alerta</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-slate-600 dark:text-zinc-300 block">
              Fotografia da Planta / Talhão
            </label>

            <div className="border border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500 rounded-xl p-4 transition-colors bg-slate-50/70 dark:bg-zinc-950/60 flex flex-col items-center justify-center text-center">
              {photoUrl ? (
                <div className="relative w-full max-w-[280px] aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700">
                  <img
                    src={photoUrl}
                    alt="Prévia da foto"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-2 right-2 h-7 w-7 bg-rose-600 hover:bg-rose-500 text-white rounded-md inline-flex items-center justify-center cursor-pointer"
                    title="Remover imagem"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 py-2">
                  <Camera className="w-7 h-7 text-slate-400 dark:text-zinc-500 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Capture pela câmera ou selecione um arquivo da galeria.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2 mt-3 w-full">
                <label className="h-8 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Tirar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                <label className="h-8 px-3 bg-white hover:bg-slate-100 text-slate-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 text-xs font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer">
                  <Image className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  <span>Galeria</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-600 dark:text-zinc-300">Responsável pela Observação</label>
            <input
              type="text"
              value={observedBy}
              onChange={e => setObservedBy(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="font-medium text-slate-600 dark:text-zinc-300">
              Observações de Campo / Diagnóstico
            </label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Ex: Bom pegamento de flores, sem sintomas de pragas ou deficiências."
              rows={2}
              className="w-full p-2.5 mt-1 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!photoUrl}
              className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed text-white font-medium cursor-pointer"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
