import React, { useState } from 'react';
import { Camera, Plus, Trash2 } from 'lucide-react';
import { FieldPhotoRecord } from '../../types/phenology';

interface PhenologyPhotoDiaryProps {
  photos: FieldPhotoRecord[];
  onOpenPhotoModal: () => void;
  onDeletePhoto?: (id: string) => void;
}

const getHealthBadge = (status: FieldPhotoRecord['healthStatus']) => {
  switch (status) {
    case 'saudavel':
      return {
        label: 'Saudável',
        cls: 'bg-emerald-600 text-white'
      };
    case 'atencao':
      return {
        label: 'Atenção',
        cls: 'bg-amber-600 text-white'
      };
    case 'sintoma_detectado':
      return {
        label: 'Alerta',
        cls: 'bg-rose-600 text-white'
      };
  }
};

export const PhenologyPhotoDiary: React.FC<PhenologyPhotoDiaryProps> = ({
  photos,
  onOpenPhotoModal,
  onDeletePhoto
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Diário Fotográfico Cronológico</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Fotos registradas em campo organizadas por data e estádio fenológico para comparação visual da safra.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenPhotoModal}
          className="h-9 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar Foto</span>
        </button>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/70 dark:bg-zinc-950/60 rounded-xl border border-slate-200/70 dark:border-zinc-800 space-y-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Camera className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-200">
            Nenhuma foto registrada para esta lavoura
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Capture ou anexe imagens do dossel e das estruturas reprodutivas ao longo do ciclo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {photos.map(photo => {
            const badge = getHealthBadge(photo.healthStatus);
            return (
              <div
                key={photo.id}
                className="bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="relative h-44 overflow-hidden bg-slate-200 dark:bg-zinc-800">
                  <img
                    src={photo.photoUrl}
                    alt={photo.caption}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 left-2 bg-zinc-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded tabular-nums">
                    {photo.stageCode} • {photo.dap} DAP
                  </span>
                  <span
                    className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="p-3.5 space-y-2 text-xs flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                      <span className="truncate">{photo.plotName}</span>
                      <span className="shrink-0">{photo.date}</span>
                    </div>
                    <p className="text-slate-800 dark:text-zinc-200 leading-relaxed">{photo.caption}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate">
                      {photo.observedBy}
                    </span>

                    {onDeletePhoto && (
                      confirmDeleteId === photo.id ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="h-6 px-2 rounded border border-slate-200 dark:border-zinc-700 text-[10px] text-slate-600 dark:text-zinc-300 cursor-pointer"
                          >
                            Não
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onDeletePhoto(photo.id);
                              setConfirmDeleteId(null);
                            }}
                            className="h-6 px-2 rounded bg-rose-600 text-white text-[10px] cursor-pointer"
                          >
                            Excluir
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(photo.id)}
                          title="Remover foto"
                          className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
