import React from 'react';
import { Camera, PlusCircle } from 'lucide-react';
import { FieldPhotoRecord } from '../../types/phenology';

interface PhenologyPhotoDiaryProps {
  photos: FieldPhotoRecord[];
  onOpenPhotoModal: () => void;
}

export const PhenologyPhotoDiary: React.FC<PhenologyPhotoDiaryProps> = ({
  photos,
  onOpenPhotoModal,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-teal-600" />
              Diário Fotográfico Cronológico da Lavoura
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Fotos registradas em campo organizadas por data e estádio fenológico para comparação visual da safra.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenPhotoModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            Adicionar Nova Foto
          </button>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
            <Camera className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">Nenhuma foto registrada para este lote ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map(photo => (
              <div
                key={photo.id}
                className="bg-slate-50/70 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs space-y-3"
              >
                <div className="relative h-44 overflow-hidden bg-slate-200 dark:bg-zinc-800">
                  <img
                    src={photo.photoUrl}
                    alt={photo.caption}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    Estádio {photo.stageCode} • {photo.dap} DAP
                  </span>
                  <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {photo.healthStatus}
                  </span>
                </div>

                <div className="p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{photo.plotName}</span>
                    <span>{photo.date}</span>
                  </div>
                  <p className="text-slate-800 dark:text-zinc-200 leading-relaxed">{photo.caption}</p>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold block pt-1 border-t border-slate-200/60 dark:border-zinc-800">
                    Responsável: {photo.observedBy}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
