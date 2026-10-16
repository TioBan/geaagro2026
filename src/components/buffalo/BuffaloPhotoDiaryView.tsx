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

  // Fotos de demonstração se a lista for pequena
  const samplePhotos = [
    {
      id: 'demo-1',
      date: '2026-08-20',
      url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&auto=format&fit=crop&q=80',
      caption: 'Lote de matrizes Murrah no banho do Açude Principal.',
      tag: 'Açudes & Banho' as const,
      animalId: 'buf-001',
      animalName: 'Morena do Pontal',
      animalNumber: 'BUF-1042'
    },
    {
      id: 'demo-2',
      date: '2026-08-15',
      url: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&auto=format&fit=crop&q=80',
      caption: 'Pasto de Capim Mombaça no Piquete 01 com altura de entrada ideal.',
      tag: 'Piquetes' as const,
      animalId: 'buf-002',
      animalName: 'Soberana de Caserta',
      animalNumber: 'BUF-1048'
    },
    {
      id: 'demo-3',
      date: '2026-07-10',
      url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop&q=80',
      caption: 'Bezerra Moreninha no bezerreiro após cura de umbigo e colostragem.',
      tag: 'Partos & Bezerros' as const,
      animalId: 'buf-005',
      animalName: 'Moreninha do Pontal',
      animalNumber: 'BUF-BEZ-1088'
    }
  ];

  const displayPhotos = allPhotos.length > 0 ? allPhotos : samplePhotos;

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
    </div>
  );
};
