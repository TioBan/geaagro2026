import React, { useState } from 'react';
import { sanitizeSvg } from '../../utils/sanitizeSvg';
import {
  ShieldAlert,
  Search,
  AlertTriangle,
  HeartPulse,
  Info,
  CheckCircle2,
  Filter,
  Maximize2,
  X,
  WifiOff,
  Eye,
  Activity,
  FileText,
  MapPin,
  Camera,
  Layers,
} from 'lucide-react';
import { EQUINE_DISEASES_BANK } from '../../data/equineData';
import { EQUINE_DISEASE_IMAGES, EquineDiseaseImageData } from '../../data/equineDiseasesImages';
import { EquineDiseaseGuide } from '../../types/equine';

interface Props {
  onBack?: () => void;
}

export const EquineDiseasesBankView: React.FC<Props> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDisease, setSelectedDisease] = useState<EquineDiseaseGuide>(EQUINE_DISEASES_BANK[0]);
  const [imageMode, setImageMode] = useState<'photo' | 'diagram'>('photo');
  const [zoomedImage, setZoomedImage] = useState<{
    data: EquineDiseaseImageData;
    mode: 'photo' | 'diagram';
  } | null>(null);

  const filteredDiseases = EQUINE_DISEASES_BANK.filter(d => {
    const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.scientificName && d.scientificName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      d.causesAndPathogenesis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  const activeImageData = selectedDisease ? EQUINE_DISEASE_IMAGES[selectedDisease.id] : null;

  return (
    <div className="space-y-6">
      {/* Top Header with Offline Guarantee Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-200 tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" /> Sanidade Veterinária & Guia Clínico
            </span>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1">
              <WifiOff className="w-3 h-3 text-emerald-700" /> Fotos Reais 100% Offline (Sem Internet)
            </span>
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-200 flex items-center gap-1">
              <Camera className="w-3 h-3 text-sky-700" /> Fotografias Clínicas Veterinárias
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Manual de Enfermidades Equinas & Primeiros Socorros
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Atlas com fotografias clínicas reais de cada patologia em equinos, esquemas diagnósticos e condutas imediatas de emergência
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
          >
            ← Voltar para Sanidade
          </button>
        )}
      </div>

      {/* Search and Category Filter */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar enfermidade, sintoma ou patógeno..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:outline-hidden focus:border-red-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900"
          >
            <option value="all">Todas as Categorias ({EQUINE_DISEASES_BANK.length})</option>
            <option value="Gastrointestinal">Gastrointestinal</option>
            <option value="Locomotor / Podologia">Locomotor / Podologia</option>
            <option value="Infecciosa / Viral">Infecciosa / Viral</option>
            <option value="Bacteriana">Bacteriana</option>
            <option value="Protozoária">Protozoária</option>
          </select>
        </div>
      </div>

      {/* 2-Column Clinical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Disease selection list */}
        <div className="space-y-3">
          {filteredDiseases.map(d => {
            const isSelected = selectedDisease.id === d.id;
            const imgData = EQUINE_DISEASE_IMAGES[d.id];

            return (
              <div
                key={d.id}
                onClick={() => setSelectedDisease(d)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'bg-red-50/90 border-red-500 shadow-sm ring-1 ring-red-400/40'
                    : 'bg-white border-stone-200 hover:border-stone-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  {imgData?.realPhotoUrl && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-stone-300 bg-stone-100 shadow-2xs">
                      <img
                        src={imgData.realPhotoUrl}
                        alt={d.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-black text-sm text-stone-900 leading-tight truncate">{d.name}</h3>
                      <span
                        className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                          d.urgency === 'Emergência Veterinária Máxima'
                            ? 'bg-red-600 text-white'
                            : d.urgency === 'Alta Urgência'
                            ? 'bg-amber-500 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {d.urgency === 'Emergência Veterinária Máxima' ? 'Emergência' : d.urgency}
                      </span>
                    </div>

                    {d.scientificName && (
                      <div className="text-[10.5px] text-stone-500 italic truncate mt-0.5">
                        {d.scientificName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 pt-1 border-t border-stone-100">
                  <span>{d.category}</span>
                  <div className="flex items-center gap-1">
                    {imgData && (
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 text-[9px]">
                        <Camera className="w-2.5 h-2.5" /> Foto Real Offline
                      </span>
                    )}
                    {d.mapaCompulsoryNotification && (
                      <span className="text-red-700 font-extrabold bg-red-100 px-1.5 py-0.5 rounded text-[9px]">
                        MAPA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2-Cols: Disease Deep Dive Card */}
        <div className="lg:col-span-2">
          {selectedDisease && (
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-xs space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-900 block">
                      {selectedDisease.category}
                    </span>
                    {selectedDisease.mapaCompulsoryNotification && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                        Notificação Compulsória MAPA
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                    {selectedDisease.name}
                  </h3>
                  {selectedDisease.scientificName && (
                    <p className="text-xs text-stone-500 italic mt-0.5">
                      {selectedDisease.scientificName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-red-100 text-red-950 text-xs font-black px-3 py-1.5 rounded-xl border border-red-200">
                    Urgência: {selectedDisease.urgency}
                  </span>
                </div>
              </div>

              {/* OFFLINE CLINICAL IMAGE & DIAGNOSTIC ATLAS */}
              {activeImageData && (
                <div className="rounded-2xl border-2 border-stone-800 bg-stone-950 overflow-hidden shadow-lg">
                  {/* Image Header bar with View Mode Switcher */}
                  <div className="px-4 py-3 bg-stone-900 border-b border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-stone-200">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-stone-100">Atlas Clínico:</span>
                      <span className="text-amber-300 font-semibold">{activeImageData.title}</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      {/* View Mode Toggle: Real Photo vs Diagram */}
                      <div className="bg-stone-950 p-1 rounded-xl border border-stone-700 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setImageMode('photo')}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            imageMode === 'photo'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Foto Clínica Real</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageMode('diagram')}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            imageMode === 'diagram'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Esquema Anatômico</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setZoomedImage({ data: activeImageData, mode: imageMode })}
                        className="flex items-center gap-1 text-[11px] bg-stone-800 hover:bg-stone-700 text-stone-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Ampliar Imagem"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Ampliar</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Offline Image Rendering */}
                  <div className="relative group bg-stone-950 flex items-center justify-center p-3 min-h-[280px]">
                    {imageMode === 'photo' && activeImageData.realPhotoUrl ? (
                      <div className="w-full flex flex-col items-center">
                        <img
                          src={activeImageData.realPhotoUrl}
                          alt={activeImageData.imageAlt}
                          className="w-full h-auto max-h-[380px] object-contain rounded-xl cursor-pointer shadow-md"
                          onClick={() => setZoomedImage({ data: activeImageData, mode: 'photo' })}
                          referrerPolicy="no-referrer"
                        />
                        {activeImageData.realPhotoCaption && (
                          <p className="text-[11.5px] text-stone-300 font-medium text-center mt-2.5 px-3 py-1.5 bg-stone-900/90 rounded-lg border border-stone-800">
                            {activeImageData.realPhotoCaption}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div
                        className="w-full max-w-3xl flex flex-col items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[380px] [&>svg]:rounded-xl cursor-pointer"
                        onClick={() => setZoomedImage({ data: activeImageData, mode: 'diagram' })}
                        dangerouslySetInnerHTML={{ __html: sanitizeSvg(activeImageData.svgDataUri) }}
                      />
                    )}

                    <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="bg-stone-900/90 text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 border border-stone-700 shadow-lg">
                        <Eye className="w-4 h-4 text-amber-400" /> Clique para tela cheia
                      </span>
                    </div>
                  </div>

                  {/* Clinical Anatomy Findings Bar */}
                  <div className="p-4 bg-stone-900/95 border-t border-stone-800 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-400 font-black text-[11px] uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sede Anatômica: {activeImageData.anatomicalLocation}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-300 text-[11px]">
                      {activeImageData.keyFindings.map((finding, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Etiology & Causes */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                <span className="text-[10px] font-black text-stone-500 uppercase block">Causas & Patogênese</span>
                <p className="text-stone-800 leading-relaxed font-medium">{selectedDisease.causesAndPathogenesis}</p>
              </div>

              {/* Signs & Symptoms */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-stone-900 tracking-wider flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-red-600" />
                  <span>Sintomas & Sinais Clínicos</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedDisease.symptoms.map((sign, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2">
                      <span className="text-red-600 font-bold text-sm">•</span>
                      <span className="text-stone-800 font-medium">{sign}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Action / Immediate First Aid */}
              <div className="p-4 sm:p-5 bg-red-50 rounded-2xl border-2 border-red-300 space-y-2 text-xs text-red-950 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-red-900 tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Ação Imediata & Primeiros Socorros</span>
                </div>
                <p className="font-semibold text-sm leading-relaxed text-red-900">
                  {selectedDisease.firstAidAdvice}
                </p>
              </div>

              {/* Treatment & Clinical Protocol */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5 text-xs text-stone-800">
                <div className="text-xs font-black uppercase text-stone-900 tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-700" />
                  <span>Tratamento Clínico & Protocolo Veterinário</span>
                </div>
                <p className="leading-relaxed font-medium">{selectedDisease.treatmentProtocol}</p>
              </div>

              {/* Prevention & Biosecurity */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5 text-xs text-emerald-950">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-900 tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Medidas Preventivas & Biosseguridade</span>
                </div>
                <p className="leading-relaxed font-medium">{selectedDisease.preventiveMeasures}</p>
              </div>

              {/* Reference */}
              {selectedDisease.references && (
                <div className="text-[11px] text-stone-400 italic pt-2 border-t flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-stone-400" />
                  <span>Referência Técnica: {selectedDisease.references}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-black text-base">{zoomedImage.data.title}</h3>
                  <span className="text-[10px] bg-red-900/60 text-red-200 border border-red-700/50 px-2 py-0.5 rounded-md font-bold">
                    {zoomedImage.mode === 'photo' ? 'Fotografia Clínica Real' : 'Esquema Anatômico'}
                  </span>
                </div>
                <p className="text-amber-400 text-xs mt-0.5">{zoomedImage.data.clinicalSignLabel}</p>
              </div>
              <button
                onClick={() => setZoomedImage(null)}
                className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex flex-col items-center justify-center bg-stone-950">
              {zoomedImage.mode === 'photo' && zoomedImage.data.realPhotoUrl ? (
                <img
                  src={zoomedImage.data.realPhotoUrl}
                  alt={zoomedImage.data.imageAlt}
                  className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-full max-w-4xl flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[60vh] [&>svg]:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(zoomedImage.data.svgDataUri) }}
                />
              )}

              {zoomedImage.mode === 'photo' && zoomedImage.data.realPhotoCaption && (
                <p className="text-xs text-stone-300 font-medium text-center mt-3 max-w-2xl px-3 py-1.5 bg-stone-900/90 rounded-lg border border-stone-800">
                  {zoomedImage.data.realPhotoCaption}
                </p>
              )}
            </div>

            <div className="p-4 bg-stone-900 border-t border-stone-800 text-xs text-stone-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-amber-400">Sede Anatômica: </span>
                <span>{zoomedImage.data.anatomicalLocation}</span>
              </div>
              <div className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-600/40 px-3 py-1 rounded-full font-bold">
                ✓ Recurso 100% Autônomo & Offline
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


