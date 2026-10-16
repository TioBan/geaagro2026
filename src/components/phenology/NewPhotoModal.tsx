import React, { useState } from 'react';
import { Camera, Image, X, Upload } from 'lucide-react';
import { PhenologicalStage, FieldPhotoRecord, CropDigitalTwin } from '../../types/phenology';

interface NewPhotoModalProps {
  currentTwin: CropDigitalTwin;
  stages: PhenologicalStage[];
  onClose: () => void;
  onSave: (photo: FieldPhotoRecord) => void;
}

export const NewPhotoModal: React.FC<NewPhotoModalProps> = ({
  currentTwin,
  stages,
  onClose,
  onSave,
}) => {
  const [stageCode, setStageCode] = useState(currentTwin.currentStageCode || 'R1');
  const [caption, setCaption] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80');
  const [observedBy, setObservedBy] = useState('Equipe Agronômica');
  const [healthStatus, setHealthStatus] = useState<'saudavel' | 'atencao' | 'sintoma_detectado'>('saudavel');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: FieldPhotoRecord = {
      id: `fphoto-${Date.now()}`,
      twinId: currentTwin.id,
      plotName: currentTwin.plotName,
      stageCode: stageCode,
      dap: currentTwin.currentDap,
      date: new Date().toISOString().split('T')[0],
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=600&auto=format&fit=crop&q=80',
      caption: caption || 'Registro fenológico de campo.',
      healthStatus: healthStatus,
      observedBy: observedBy,
    };
    onSave(newEntry);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-teal-600" />
            Registrar Foto no Diário Fenológico
          </h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Estádio Observado:</label>
              <select
                value={stageCode}
                onChange={e => setStageCode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
              >
                {stages.map(s => (
                  <option key={s.id} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-zinc-300">Condição de Sanidade:</label>
              <select
                value={healthStatus}
                onChange={e => setHealthStatus(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
              >
                <option value="saudavel">Saudável / Vigoroso</option>
                <option value="atencao">Atenção / Leve Sintoma</option>
                <option value="sintoma_detectado">Sintoma / Alerta</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-zinc-300 block">Fotografia da Planta/Talhão:</label>
            
            <div className="border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500 rounded-xl p-4 transition-colors bg-slate-50/50 dark:bg-zinc-800/30 flex flex-col items-center justify-center text-center group">
              {photoUrl ? (
                <div className="relative w-full max-w-[280px] aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm">
                  <img 
                    src={photoUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-md transition-colors"
                    title="Remover Imagem"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2 py-2">
                  <Camera className="w-8 h-8 text-slate-400 dark:text-zinc-600 group-hover:text-emerald-500 mx-auto transition-colors" />
                  <div className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                    Nenhuma imagem selecionada. Escolha uma das opções abaixo:
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2 mt-3 w-full">
                <label className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold rounded-lg cursor-pointer transition-all active:scale-[0.98]">
                  <Camera className="w-3.5 h-3.5" />
                  Tirar Foto
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPhotoUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                <label className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 text-xs font-bold rounded-lg cursor-pointer transition-all active:scale-[0.98]">
                  <Image className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  Galeria
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPhotoUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-zinc-300">Observações de Campo / Diagnóstico:</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Ex: Excelente pegamento de flores, sem sintomas de pragas ou deficiências."
              rows={2}
              className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2.5 font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-slate-600 dark:text-zinc-300 font-bold hover:bg-slate-50 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold shadow-xs transition cursor-pointer"
            >
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
