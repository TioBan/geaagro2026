import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Heart,
  FileText,
  Sparkles,
} from 'lucide-react';
import {
  SwineDiseaseInfo,
} from '../../types/swine';
import { DEFAULT_SWINE_DISEASES } from '../../data/swineDefaultData';

export const SwineDiseasesLibraryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDisease, setSelectedDisease] = useState<SwineDiseaseInfo>(DEFAULT_SWINE_DISEASES[0]);

  const filteredDiseases = DEFAULT_SWINE_DISEASES.filter(d => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.causativeAgent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.symptoms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-pink-600" />
          <span>Manual Técnico de Patologias & Sanidade Suína</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Guia de diagnóstico a campo, sinais clínicos, transmissão, medidas de biosseguridade e protocolos terapêuticos.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por doença, agente etiológico ou sintoma (ex: febre, diarreia, tosse)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-pink-500"
        >
          <option value="all">Todas as Categorias</option>
          <option value="Viral">Vírus</option>
          <option value="Bacteriana">Bactérias</option>
          <option value="Parasitária">Parasitas & Protozoários</option>
          <option value="Nutricional / Manejo">Nutricional / Manejo</option>
        </select>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disease List */}
        <div className="space-y-2.5">
          {filteredDiseases.map(disease => (
            <div
              key={disease.id}
              onClick={() => setSelectedDisease(disease)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedDisease?.id === disease.id
                  ? 'bg-pink-50/60 border-pink-500 shadow-xs'
                  : 'bg-white border-gray-200 hover:border-pink-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-gray-900">{disease.name}</h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    disease.severity.includes('Notificação')
                      ? 'bg-red-100 text-red-800'
                      : disease.severity === 'Alta'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {disease.category}
                </span>
              </div>
              <p className="text-xs text-gray-500 italic mt-0.5">{disease.scientificName || disease.causativeAgent}</p>
              <div className="mt-2 text-[11px] text-gray-600 truncate">
                Fase: {disease.affectedStages.join(', ')}
              </div>
            </div>
          ))}
        </div>

        {/* Disease Detail Sheet */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          {selectedDisease ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-gray-900">{selectedDisease.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        selectedDisease.severity.includes('Notificação')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedDisease.severity}
                    </span>
                  </div>
                  <p className="text-xs text-pink-700 font-semibold italic mt-0.5">
                    Agente Etiológico: {selectedDisease.causativeAgent}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-gray-500 block">Fases Suscetíveis</span>
                  <span className="text-xs font-bold text-gray-800">
                    {selectedDisease.affectedStages.join(', ')}
                  </span>
                </div>
              </div>

              {/* Sinais Clínicos */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Sinais Clínicos & Sintomatologia</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDisease.symptoms.map((sign, idx) => (
                    <div key={idx} className="p-2.5 bg-amber-50/40 border border-amber-100 rounded-xl text-xs text-gray-800 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span>{sign}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lesões Anatomopatológicas */}
              {selectedDisease.anatomopathologicalLesions && selectedDisease.anatomopathologicalLesions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-600" />
                    <span>Lesões de Necropsia & Anatomopatologia</span>
                  </h4>
                  <div className="space-y-1">
                    {selectedDisease.anatomopathologicalLesions.map((lesion, idx) => (
                      <div key={idx} className="p-2.5 bg-red-50/40 border border-red-100 rounded-xl text-xs text-red-950 font-medium">
                        • {lesion}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transmissão & Prevenção */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                  <span className="text-xs font-bold text-gray-900 block">Forma de Transmissão</span>
                  <ul className="text-xs text-gray-700 leading-relaxed list-disc list-inside space-y-0.5">
                    {selectedDisease.transmission.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-1.5">
                  <span className="text-xs font-bold text-emerald-900 block">Prevenção & Biossegurança</span>
                  <ul className="text-xs text-emerald-800 leading-relaxed list-disc list-inside space-y-0.5">
                    {selectedDisease.preventionAndBiosecurity.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tratamento */}
              <div className="p-4 bg-pink-50/40 rounded-2xl border border-pink-100 space-y-2">
                <span className="text-xs font-bold text-pink-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-pink-600" />
                  <span>Protocolo de Tratamento / Ação Recomendada</span>
                </span>
                <ul className="text-xs text-gray-800 leading-relaxed list-disc list-inside space-y-0.5">
                  {selectedDisease.treatmentAndControl.map((tc, i) => (
                    <li key={i}>{tc}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500">Selecione uma enfermidade para visualizar a ficha técnica.</p>
          )}
        </div>
      </div>
    </div>
  );
};
