import React, { useState } from 'react';
import { BuffaloAnimal } from '../../types/buffalo';
import {
  Camera,
  Image as ImageIcon,
  Tag,
  Calendar,
  Plus,
  X
} from 'lucide-react';

interface BuffaloPhotoDiaryViewProps {
  animals: BuffaloAnimal[];
  onOpenDigitalTwin: (animalId: string) => void;
}

export const BuffaloPhotoDiaryView: React.FC<BuffaloPhotoDiaryViewProps> = ({
  animals,
  onOpenDigitalTwin
}) => {
  // Coletar todas as fotos de todos os animais
  const allPhotos = animals.flatMap(a =>
    a.photos.map(p => ({
      ...p,
      animalId: a.id,
      animalName: a.name,
      animalNumber: a.identificationNumber
    }))
  );

  const displayPhotos = allPhotos;

  return (
    <div className="space-y-6">
      {/* Top Banner do Diário Fotográfico */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-teal-600 block">
            Monitoramento Visual Contínuo
          </span>
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-teal-600" />
            <span>Diário Fotográfico do Rebanho de Búfalos</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro fotográfico de evolução zootécnica, partos, piquetes, açudes e sanidade.
          </p>
        </div>
      </div>

      {/* Galeria de Fotos em Grid Responsivo */}
      {displayPhotos.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs space-y-2">
          <Camera className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Nenhuma foto registrada no diário</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Adicione fotos da evolução dos búfalos, açudes e piquetes acessando o Gêmeo Digital de cada animal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {displayPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-teal-300 font-bold text-[10px] rounded-md">
                  {photo.tag}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{photo.animalNumber} - {photo.animalName}</span>
                  <span>{photo.date}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-snug">
                  {photo.caption}
                </p>

                <button
                  onClick={() => onOpenDigitalTwin(photo.animalId)}
                  className="w-full mt-2 py-1.5 bg-slate-50 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-700 dark:text-zinc-300 hover:text-teal-600 rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  Ver Gêmeo do Animal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
