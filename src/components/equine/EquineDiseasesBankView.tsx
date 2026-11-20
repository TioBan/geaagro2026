import React, { useState } from 'react';
import { sanitizeSvg } from '../../utils/sanitizeSvg';
import {
  ShieldAlert,
  Search,
  AlertTriangle,
  HeartPulse,
  CheckCircle2,
  Maximize2,
  X,
  Activity,
  FileText,
  MapPin,
  Camera,
  Layers,
  ArrowLeft,
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
    const q = searchTerm.trim().toLowerCase();
    const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      (d.scientificName && d.scientificName.toLowerCase().includes(q)) ||
      d.causesAndPathogenesis.toLowerCase().includes(q) ||
      d.symptoms.some(s => s.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const activeImageData = selectedDisease ? EQUINE_DISEASE_IMAGES[selectedDisease.id] : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Manual de Enfermidades Equinas & Primeiros Socorros</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Atlas clínico offline com fotografias reais, esquemas anatômicos e protocolos emergenciais
          </p>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Sanidade</span>
          </button>
        )}
      </div>

      {/* Search & Category Toolbar */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar enfermidade, sintoma ou patógeno..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">Todas as categorias ({EQUINE_DISEASES_BANK.length})</option>
          <option value="Gastrointestinal">Gastrointestinal</option>
          <option value="Locomotor / Podologia">Locomotor / Podologia</option>
          <option value="Infecciosa / Viral">Infecciosa / Viral</option>
          <option value="Bacteriana">Bacteriana</option>
          <option value="Protozoária">Protozoária</option>
        </select>
      </div>

      {/* 2-Column Clinical Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Disease Index List */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-zinc-800 self-start">
          {filteredDiseases.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma enfermidade encontrada para os filtros aplicados.
            </div>
          ) : (
            filteredDiseases.map(d => {
              const isSelected = selectedDisease?.id === d.id;
              const imgData = EQUINE_DISEASE_IMAGES[d.id];
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDisease(d)}
                  className={`w-full p-3 text-left transition-colors cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-slate-50 dark:bg-zinc-800/80 border-l-2 border-l-emerald-600'
                      : 'hover:bg-slate-50/70 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  {imgData?.realPhotoUrl && (
                    <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800">
                      <img
                        src={imgData.realPhotoUrl}
                        alt={d.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {d.name}
                    </div>
                    {d.scientificName && (
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 italic truncate">
                        {d.scientificName}
                      </div>
                    )}
                    <div className="mt-1 flex items-center gap-2 text-[10px]">
                      <span className="text-slate-500 dark:text-zinc-400">{d.category}</span>
                      <span
                        className={`font-medium ${
                          d.urgency === 'Emergência Veterinária Máxima'
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        · {d.urgency === 'Emergência Veterinária Máxima' ? 'Emergência' : d.urgency}
                      </span>
                      {d.mapaCompulsoryNotification && (
                        <span className="text-rose-700 dark:text-rose-400 font-semibold">· MAPA</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Disease Deep Dive */}
        <div className="lg:col-span-8">
          {selectedDisease && (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 space-y-5">
              {/* Disease Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-4 border-b border-slate-200 dark:border-zinc-800">
                <div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex flex-wrap items-center gap-1.5">
                    <span>{selectedDisease.category}</span>
                    {selectedDisease.mapaCompulsoryNotification && (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">
                        · Notificação Compulsória MAPA
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                    {selectedDisease.name}
                  </h3>
                  {selectedDisease.scientificName && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 italic">
                      {selectedDisease.scientificName}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs font-medium shrink-0 ${
                    selectedDisease.urgency === 'Emergência Veterinária Máxima'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {selectedDisease.urgency}
                </span>
              </div>

              {/* Clinical Image & Anatomical Diagram Viewer */}
              {activeImageData && (
                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-slate-50 dark:bg-zinc-950">
                  <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-xs font-medium text-slate-800 dark:text-zinc-200 truncate">
                      {activeImageData.title}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setImageMode('photo')}
                        className={`h-7 px-2.5 rounded-md text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors ${
                          imageMode === 'photo'
                            ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                            : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Camera className="w-3 h-3" />
                        <span>Foto Clínica</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode('diagram')}
                        className={`h-7 px-2.5 rounded-md text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors ${
                          imageMode === 'diagram'
                            ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                            : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Layers className="w-3 h-3" />
                        <span>Esquema</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoomedImage({ data: activeImageData, mode: imageMode })}
                        className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-[11px] font-medium text-slate-700 dark:text-zinc-200 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Ampliar</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 flex flex-col items-center justify-center min-h-[240px]">
                    {imageMode === 'photo' && activeImageData.realPhotoUrl ? (
                      <>
                        <img
                          src={activeImageData.realPhotoUrl}
                          alt={activeImageData.imageAlt}
                          onClick={() => setZoomedImage({ data: activeImageData, mode: 'photo' })}
                          className="w-full h-auto max-h-[340px] object-contain rounded-lg cursor-pointer"
                          referrerPolicy="no-referrer"
                        />
                        {activeImageData.realPhotoCaption && (
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 text-center mt-2">
                            {activeImageData.realPhotoCaption}
                          </p>
                        )}
                      </>
                    ) : (
                      <div
                        onClick={() => setZoomedImage({ data: activeImageData, mode: 'diagram' })}
                        className="w-full max-w-3xl flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[340px] [&>svg]:rounded-lg cursor-pointer"
                        dangerouslySetInnerHTML={{ __html: sanitizeSvg(activeImageData.svgDataUri) }}
                      />
                    )}
                  </div>

                  <div className="px-4 py-3 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Sede Anatômica: {activeImageData.anatomicalLocation}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-zinc-400">
                      {activeImageData.keyFindings.map((finding, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 dark:text-emerald-400">•</span>
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* First Aid Callout */}
              <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-1">
                <div className="text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Ação Imediata & Primeiros Socorros</span>
                </div>
                <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed">
                  {selectedDisease.firstAidAdvice}
                </p>
              </div>

              {/* Clinical Details Sections */}
              <div className="divide-y divide-slate-200 dark:divide-zinc-800 text-xs">
                <div className="py-3 space-y-1">
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100">
                    Causas & Patogênese
                  </h4>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {selectedDisease.causesAndPathogenesis}
                  </p>
                </div>

                <div className="py-3 space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>Sintomas & Sinais Clínicos</span>
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-700 dark:text-zinc-300">
                    {selectedDisease.symptoms.map((sign, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-600 dark:text-rose-400">•</span>
                        <span>{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="py-3 space-y-1">
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Tratamento Clínico & Protocolo Veterinário</span>
                  </h4>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {selectedDisease.treatmentProtocol}
                  </p>
                </div>

                <div className="py-3 space-y-1">
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Medidas Preventivas & Biosseguridade</span>
                  </h4>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {selectedDisease.preventiveMeasures}
                  </p>
                </div>
              </div>

              {selectedDisease.references && (
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>Referência: {selectedDisease.references}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  {zoomedImage.data.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {zoomedImage.data.clinicalSignLabel} · {zoomedImage.data.anatomicalLocation}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950">
              {zoomedImage.mode === 'photo' && zoomedImage.data.realPhotoUrl ? (
                <img
                  src={zoomedImage.data.realPhotoUrl}
                  alt={zoomedImage.data.imageAlt}
                  className="max-w-full max-h-[65vh] object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-full max-w-4xl flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[65vh] [&>svg]:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: sanitizeSvg(zoomedImage.data.svgDataUri) }}
                />
              )}
              {zoomedImage.mode === 'photo' && zoomedImage.data.realPhotoCaption && (
                <p className="text-xs text-slate-600 dark:text-zinc-300 text-center mt-3 max-w-2xl">
                  {zoomedImage.data.realPhotoCaption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
