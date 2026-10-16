import React, { useState, useMemo } from 'react';
import {
  Bug, ArrowRightLeft, ZoomIn, ZoomOut, Maximize2, ShieldAlert,
  ShieldCheck, Leaf, AlertTriangle, Copy, Check, Info, Layers,
  FlaskConical, Sparkles, Filter, CheckCircle2, XCircle, ArrowRight,
  ExternalLink, SlidersHorizontal, BookOpen, Microscope
} from 'lucide-react';
import { NematodeSpecies } from '../types/nematology';
import { NEMATODE_SPECIES_CATALOG } from '../data/nematologyData';
import { getSpeciesMediaData } from '../data/nematodeMediaAtlas';
import { OfflineImage } from './OfflineImage';

interface NematodeComparatorProps {
  initialSpeciesAId?: string;
  initialSpeciesBId?: string;
  onSelectSpecies?: (id: string) => void;
}

// Preset differential comparison pairs commonly faced in agronomy
interface ComparisonPreset {
  id: string;
  title: string;
  speciesAId: string;
  speciesBId: string;
  tag: string;
  description: string;
}

const COMPARISON_PRESETS: ComparisonPreset[] = [
  {
    id: 'm_incognita_vs_m_javanica',
    title: 'Meloidogyne incognita vs. Meloidogyne javanica',
    speciesAId: 'meloidogyne_incognita',
    speciesBId: 'meloidogyne_javanica',
    tag: 'Nematoides das Galhas',
    description: 'Diferenciação crítica em soja e algodão através do padrão perineal, faixas de incisuras laterais e reação de cultivares resistentes.'
  },
  {
    id: 'm_incognita_vs_h_glycines',
    title: 'Meloidogyne incognita vs. Heterodera glycines',
    speciesAId: 'meloidogyne_incognita',
    speciesBId: 'heterodera_glycines',
    tag: 'Galhas vs. Cisto da Soja',
    description: 'Diagnóstico diferencial de reboleiras na soja: galhas hipertróficas vasculares versus fêmeas/cistos visíveis no sistema radicular.'
  },
  {
    id: 'p_brachyurus_vs_p_zeae',
    title: 'Pratylenchus brachyurus vs. Pratylenchus zeae',
    speciesAId: 'pratylenchus_brachyurus',
    speciesBId: 'pratylenchus_zeae',
    tag: 'Nematoides das Lesões',
    description: 'Diferenciação entre o nematoide da soja/algodão (P. brachyurus) e do milho/cana (P. zeae) baseada no número de anéis labiais e cauda.'
  },
  {
    id: 'r_reniformis_vs_m_incognita',
    title: 'Rotylenchulus reniformis vs. Meloidogyne incognita',
    speciesAId: 'rotylenchulus_reniformis',
    speciesBId: 'meloidogyne_incognita',
    tag: 'Algodão & Solanáceas',
    description: 'Sintoma de "raiz suja" com retenção de solo versus grandes galhas arredondadas no córtex e cilindro central.'
  },
  {
    id: 'h_dihystera_vs_p_brachyurus',
    title: 'Helicotylenchus dihystera vs. Pratylenchus brachyurus',
    speciesAId: 'helicotylenchus_dihystera',
    speciesBId: 'pratylenchus_brachyurus',
    tag: 'Espiralado vs. Lesão',
    description: 'Nematoide ectoparasita espiralado de baixo dano direto versus endoparasita migrador agressivo com lesões necróticas profundas.'
  },
  {
    id: 'h_glycines_vs_r_reniformis',
    title: 'Heterodera glycines vs. Rotylenchulus reniformis',
    speciesAId: 'heterodera_glycines',
    speciesBId: 'rotylenchulus_reniformis',
    tag: 'Sedentários de Grãos',
    description: 'Cistos escurecidos perenes e fêmeas limoniformes versus fêmeas reniformes pequenas com matriz gelatinosa que agrega solo.'
  },
  {
    id: 'a_besseyi_vs_d_dipsaci',
    title: 'Aphelenchoides besseyi vs. Ditylenchus dipsaci',
    speciesAId: 'aphelenchoides_besseyi',
    speciesBId: 'ditylenchus_dipsaci',
    tag: 'Parte Aérea & Caules',
    description: 'Nematoide da Ponta-Branca do arroz e haste verde da soja versus nematoide dos bulbos, colmos e caules em hortaliças e alfafa.'
  },
  {
    id: 'x_americanum_vs_c_ornatum',
    title: 'Xiphinema americanum vs. Criconemoides ornatum',
    speciesAId: 'xiphinema_americanum',
    speciesBId: 'criconemoides_ornatum',
    tag: 'Adaga vs. Anelado',
    description: 'Ectoparasita de estilete gigante vetor de nepovírus versus nematoide anelado sedentário espesso de cutícula corrugada.'
  }
];

export const NematodeComparator: React.FC<NematodeComparatorProps> = ({
  initialSpeciesAId = 'meloidogyne_incognita',
  initialSpeciesBId = 'pratylenchus_brachyurus',
  onSelectSpecies
}) => {
  const [speciesAId, setSpeciesAId] = useState<string>(initialSpeciesAId);
  const [speciesBId, setSpeciesBId] = useState<string>(initialSpeciesBId);

  const [viewerMode, setViewerMode] = useState<'photo_field' | 'photo_micro' | 'svg'>('photo_field');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'morphology' | 'symptoms' | 'hosts' | 'management'>('all');
  const [searchPreset, setSearchPreset] = useState<string>('');

  // Find species objects
  const speciesA = useMemo(() => {
    return NEMATODE_SPECIES_CATALOG.find(s => s.id === speciesAId) || NEMATODE_SPECIES_CATALOG[0];
  }, [speciesAId]);

  const speciesB = useMemo(() => {
    return NEMATODE_SPECIES_CATALOG.find(s => s.id === speciesBId) || NEMATODE_SPECIES_CATALOG[1] || NEMATODE_SPECIES_CATALOG[0];
  }, [speciesBId]);

  // Helper for anatomy badge colors
  const getAnatomyBadge = (type?: string) => {
    switch (type) {
      case 'globose':
        return { label: 'Galha / Globoso', color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' };
      case 'cyst':
        return { label: 'Cisto Sedentário', color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800' };
      case 'reniform':
        return { label: 'Reniforme', color: 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800' };
      case 'dagger':
        return { label: 'Adaga / Lança', color: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800' };
      case 'spiral':
        return { label: 'Espiralado', color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800' };
      case 'sheath':
        return { label: 'Anelado / Bainha', color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800' };
      default:
        return { label: 'Vermiforme / Lesão', color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800' };
    }
  };

  const photosA = useMemo(() => {
    const media = getSpeciesMediaData(speciesA.id, speciesA.anatomyType);
    return {
      micro: media.microscope.url,
      field: media.fieldDamage.url,
      microDesc: media.microscope.caption,
      fieldDesc: media.fieldDamage.caption,
      magnification: media.microscope.magnification,
      staining: media.microscope.staining,
      markers: media.microscope.markers,
      symptomTitle: media.fieldDamage.symptomTitle,
      fieldMarkers: media.fieldDamage.markers,
      organ: media.fieldDamage.organ,
      severityScore: media.fieldDamage.severityScore,
      microCredit: media.microscope.credit,
      fieldCredit: media.fieldDamage.credit
    };
  }, [speciesA]);

  const photosB = useMemo(() => {
    const media = getSpeciesMediaData(speciesB.id, speciesB.anatomyType);
    return {
      micro: media.microscope.url,
      field: media.fieldDamage.url,
      microDesc: media.microscope.caption,
      fieldDesc: media.fieldDamage.caption,
      magnification: media.microscope.magnification,
      staining: media.microscope.staining,
      markers: media.microscope.markers,
      symptomTitle: media.fieldDamage.symptomTitle,
      fieldMarkers: media.fieldDamage.markers,
      organ: media.fieldDamage.organ,
      severityScore: media.fieldDamage.severityScore,
      microCredit: media.microscope.credit,
      fieldCredit: media.fieldDamage.credit
    };
  }, [speciesB]);

  // Swap Species A and B
  const handleSwap = () => {
    const temp = speciesAId;
    setSpeciesAId(speciesBId);
    setSpeciesBId(temp);
  };

  // Apply Preset
  const handleApplyPreset = (preset: ComparisonPreset) => {
    setSpeciesAId(preset.speciesAId);
    setSpeciesBId(preset.speciesBId);
  };

  // Copy Comparative Report
  const handleCopyComparison = () => {
    const text = `LAUDO COMPARATIVO DE DIAGNÓSTICO DIFERENCIAL FITOPATOLÓGICO
Sistema AgroFarm Pro - Módulo Nematologia Especializada

============================================================
[ESPÉCIE A]: ${speciesA.scientificName} (${speciesA.commonName})
Grupo: ${speciesA.anatomyType || 'Vermiforme'}
Hospedeiros: ${(speciesA.hosts || []).join(', ') || 'N/A'}
Sintomas de Campo: ${speciesA.symptoms || 'N/A'}
Identificação Laboratorial: ${speciesA.identification || speciesA.identificationMethods || 'N/A'}
Limiar de Dano Econômico: ${speciesA.economicDamage || 'N/A'}
Manejo Recomendado: ${speciesA.culturalControl || speciesA.managementStrategies || 'N/A'}

============================================================
[ESPÉCIE B]: ${speciesB.scientificName} (${speciesB.commonName})
Grupo: ${speciesB.anatomyType || 'Vermiforme'}
Hospedeiros: ${(speciesB.hosts || []).join(', ') || 'N/A'}
Sintomas de Campo: ${speciesB.symptoms || 'N/A'}
Identificação Laboratorial: ${speciesB.identification || speciesB.identificationMethods || 'N/A'}
Limiar de Dano Econômico: ${speciesB.economicDamage || 'N/A'}
Manejo Recomendado: ${speciesB.culturalControl || speciesB.managementStrategies || 'N/A'}

============================================================
PONTOS CHAVE DE DIAGNÓSTICO DIFERENCIAL:
1. Morfologia e Padrão de Parasitismo: ${speciesA.anatomyType} vs. ${speciesB.anatomyType}
2. Diagnóstico em Raiz: Analisar presença de galhas nodulares vs. cistos aderidos vs. necroses corticais escuras.
3. Rotação & Coberturas Antagônicas: Verificar suscetibilidade cruzada antes de adotar culturas de entressafra (ex: Crotalaria, Milheto, Braquiária).

Gerado automaticamente via Sistema Agronômico Integrado AgroFarm Pro.`;

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Calculate Shared & Unique Hosts
  const hostsA = speciesA.hosts || [];
  const hostsB = speciesB.hosts || [];
  const sharedHosts = hostsA.filter(h => hostsB.some(hb => hb.toLowerCase().trim() === h.toLowerCase().trim()));
  const uniqueHostsA = hostsA.filter(h => !hostsB.some(hb => hb.toLowerCase().trim() === h.toLowerCase().trim()));
  const uniqueHostsB = hostsB.filter(h => !hostsA.some(ha => ha.toLowerCase().trim() === h.toLowerCase().trim()));

  const badgeA = getAnatomyBadge(speciesA.anatomyType);
  const badgeB = getAnatomyBadge(speciesB.anatomyType);

  // Filter presets by search
  const filteredPresets = useMemo(() => {
    if (!searchPreset) return COMPARISON_PRESETS;
    const q = searchPreset.toLowerCase();
    return COMPARISON_PRESETS.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }, [searchPreset]);

  return (
    <div className="space-y-6 animate-fade-in" id="nematode-comparator-module">
      {/* ========================================================= */}
      {/* 1. CABEÇALHO & SELETORES DE ESPÉCIES LADO A LADO          */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Comparador Diferencial de Nematoides
                </h2>
                <span className="bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-700">
                  Diagnóstico Lado a Lado
                </span>
                <span className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-700">
                  Morfometria & Sintomas
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Selecione duas espécies para confrontar fotos de campo, micrografias, etiologia, espectro de hospedeiras e conflitos de manejo na rotação.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <button
              onClick={handleCopyComparison}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-zinc-700"
              title="Copiar Laudo de Diagnóstico Diferencial"
            >
              {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedSuccess ? 'Laudo Copiado!' : 'Copiar Laudo Comparativo'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SELETORES DUPLOS COM BOTÃO DE INVERSÃO (SWAP)             */}
        {/* ========================================================= */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-900 grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          {/* Espécie A Selector */}
          <div className="md:col-span-5 bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-200 dark:border-blue-900/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span> Espécie A (Referência)
              </span>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${badgeA.color}`}>
                {badgeA.label.split('/')[0]}
              </span>
            </div>
            <select
              value={speciesAId}
              onChange={e => setSpeciesAId(e.target.value)}
              className="w-full py-2 px-3 bg-white dark:bg-zinc-900 border border-blue-300 dark:border-blue-800 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {NEMATODE_SPECIES_CATALOG.map(s => (
                <option key={s.id} value={s.id}>
                  {s.scientificName} — {s.commonName}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center py-1">
            <button
              onClick={handleSwap}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-full border border-slate-200 dark:border-zinc-700 shadow-xs cursor-pointer transition-all hover:scale-110 active:scale-95"
              title="Inverter Espécie A e B"
            >
              <ArrowRightLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>
          </div>

          {/* Espécie B Selector */}
          <div className="md:col-span-5 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Espécie B (Comparada)
              </span>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${badgeB.color}`}>
                {badgeB.label.split('/')[0]}
              </span>
            </div>
            <select
              value={speciesBId}
              onChange={e => setSpeciesBId(e.target.value)}
              className="w-full py-2 px-3 bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {NEMATODE_SPECIES_CATALOG.map(s => (
                <option key={s.id} value={s.id}>
                  {s.scientificName} — {s.commonName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PRESETS AGRONÔMICOS DE DIAGNÓSTICO DIFERENCIAL FREQUENTE  */}
        {/* ========================================================= */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Diagnósticos Diferenciais Críticos (Casos Agronômicos Comuns):
            </span>
            <span className="text-[10px] font-mono text-slate-400">Clique para carregar o par</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {COMPARISON_PRESETS.slice(0, 4).map(preset => {
              const isActive = (speciesAId === preset.speciesAId && speciesBId === preset.speciesBId) ||
                               (speciesAId === preset.speciesBId && speciesBId === preset.speciesAId);
              return (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 dark:border-blue-600 ring-1 ring-blue-500/30'
                      : 'bg-slate-50/70 hover:bg-slate-100 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 truncate">
                      {preset.tag}
                    </span>
                    {isActive && <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />}
                  </div>
                  <strong className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                    {preset.title}
                  </strong>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-tight">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* More presets expandable chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-thin">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">Outros pares:</span>
            {COMPARISON_PRESETS.slice(4).map(preset => (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg text-[10px] font-bold shrink-0 transition-all border border-slate-200 dark:border-zinc-700 cursor-pointer"
              >
                {preset.tag}: {preset.title.split('vs.')[0].trim().split(' ')[0]} vs {preset.title.split('vs.')[1]?.trim().split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. VISUALIZADOR FOTOGRÁFICO LADO A LADO (CAMPO & MICRO)   */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Microscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Galeria Comparativa Visual & Microscópica
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                Confronte o padrão visual de raízes infectadas e anatomia microscópica lado a lado.
              </p>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex p-1 bg-slate-100 dark:bg-zinc-900 rounded-xl text-[10px] font-bold border border-slate-200 dark:border-zinc-800">
              <button
                onClick={() => setViewerMode('photo_field')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  viewerMode === 'photo_field'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-black'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                <Leaf className="w-3 h-3" /> Dano Real (Campo/Raiz)
              </button>
              <button
                onClick={() => setViewerMode('photo_micro')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  viewerMode === 'photo_micro'
                    ? 'bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-400 shadow-xs font-black'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                <FlaskConical className="w-3 h-3" /> Micrografia Laboratorial
              </button>
              <button
                onClick={() => setViewerMode('svg')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  viewerMode === 'svg'
                    ? 'bg-white dark:bg-zinc-800 text-purple-700 dark:text-purple-400 shadow-xs font-black'
                    : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                <Layers className="w-3 h-3" /> Esquema Anatômico
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs">
              <button
                onClick={() => setZoomLevel(prev => Math.max(1.0, +(prev - 0.25).toFixed(2)))}
                disabled={zoomLevel <= 1.0}
                className="p-1 rounded bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 disabled:opacity-40 cursor-pointer"
                title="Diminuir Zoom"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="text-[10px] font-mono font-bold px-1 text-slate-700 dark:text-zinc-300">
                {(zoomLevel * 100).toFixed(0)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(2.5, +(prev + 0.25).toFixed(2)))}
                disabled={zoomLevel >= 2.5}
                className="p-1 rounded bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 disabled:opacity-40 cursor-pointer"
                title="Aumentar Zoom"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* DUAL IMAGE STAGE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* STAGE A */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="text-xs font-black italic text-slate-900 dark:text-white">
                  {speciesA.scientificName}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                {speciesA.commonName}
              </span>
            </div>

            {/* Viewport Frame */}
            <div className="relative w-full aspect-4/3 rounded-2xl bg-stone-950 border-2 border-blue-300 dark:border-blue-800 overflow-hidden shadow-inner flex items-center justify-center group select-none">
              {/* Reticle for micro and svg */}
              {viewerMode !== 'photo_field' && (
                <>
                  <div className="absolute inset-0 border border-white/10 pointer-events-none rounded-full z-10 m-3" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/10 pointer-events-none z-10" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 pointer-events-none z-10" />
                </>
              )}

              {/* Photo View */}
              {viewerMode === 'photo_field' && (
                <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-stone-900">
                  <OfflineImage
                    src={photosA.field}
                    speciesId={speciesA.id}
                    anatomyType={speciesA.anatomyType}
                    scientificName={speciesA.scientificName}
                    viewType="field"
                    alt={`Sintoma de ${speciesA.scientificName}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-200"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_65%,_rgba(0,0,0,0.5)_100%)] pointer-events-none z-10" />
                  <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-bold text-white z-20 border border-white/10">
                    🌾 Sintoma na Raiz / Lavoura
                  </div>
                </div>
              )}

              {viewerMode === 'photo_micro' && (
                <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-stone-950">
                  <OfflineImage
                    src={photosA.micro}
                    speciesId={speciesA.id}
                    anatomyType={speciesA.anatomyType}
                    scientificName={speciesA.scientificName}
                    viewType="microscope"
                    alt={`Micrografia de ${speciesA.scientificName}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-200"
                    style={{ transform: `scale(${zoomLevel * 1.1})` }}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.7)_100%)] pointer-events-none z-10" />
                  <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-bold text-white z-20 border border-white/10">
                    🔬 Micrografia Óptica HD
                  </div>
                </div>
              )}

              {viewerMode === 'svg' && (
                <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                  <svg
                    viewBox="0 0 200 200"
                    className="w-3/4 h-3/4 select-none transition-transform duration-300"
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    {speciesA.anatomyType === 'globose' && (
                      <g>
                        <path d="M 100 120 C 50 140, 40 80, 80 50 C 90 40, 100 20, 100 10 C 100 20, 110 40, 120 50 C 160 80, 150 140, 100 120 Z" fill="rgba(59, 130, 246, 0.25)" stroke="#3b82f6" strokeWidth="3" />
                        <line x1="100" y1="10" x2="100" y2="28" stroke="#3b82f6" strokeWidth="2.5" />
                        <circle cx="100" cy="28" r="2.5" fill="#3b82f6" />
                      </g>
                    )}
                    {speciesA.anatomyType === 'cyst' && (
                      <g>
                        <path d="M 100 140 C 55 130, 45 70, 100 40 C 100 30, 100 30, 100 20 C 100 30, 100 30, 100 40 C 155 70, 145 130, 100 140 Z" fill="rgba(251, 191, 36, 0.25)" stroke="#fbbf24" strokeWidth="3.5" />
                      </g>
                    )}
                    {speciesA.anatomyType === 'reniform' && (
                      <g>
                        <path d="M 50 100 Q 80 40, 130 50 C 170 60, 180 120, 130 140 C 90 150, 70 120, 50 100 Z" fill="rgba(249, 115, 22, 0.25)" stroke="#f97316" strokeWidth="3" />
                      </g>
                    )}
                    {(!speciesA.anatomyType || speciesA.anatomyType === 'vermiform' || speciesA.anatomyType === 'dagger' || speciesA.anatomyType === 'spiral' || speciesA.anatomyType === 'sheath' || speciesA.anatomyType === 'pin') && (
                      <g>
                        <path d="M 30 50 Q 80 40, 120 80 T 170 150 Q 140 140, 110 110 T 30 50 Z" fill="rgba(59, 130, 246, 0.25)" stroke="#60a5fa" strokeWidth="2.5" />
                        <line x1="33" y1="48" x2="47" y2="52" stroke="#60a5fa" strokeWidth="2" />
                      </g>
                    )}
                  </svg>
                </div>
              )}
            </div>

            {/* Stage A Caption */}
            <div className="text-xs bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-blue-700 dark:text-blue-400">
                  {viewerMode === 'photo_micro' ? `🔬 ${photosA.magnification} • ${photosA.staining}` : `🌾 ${photosA.symptomTitle}`}
                </span>
                <span className="text-slate-400">
                  {viewerMode === 'photo_micro' ? photosA.microCredit : photosA.fieldCredit}
                </span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                {viewerMode === 'photo_field' ? photosA.fieldDesc : viewerMode === 'photo_micro' ? photosA.microDesc : 'Esquema morfológico vetorial da espécie A.'}
              </p>
            </div>
          </div>

          {/* STAGE B */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-black italic text-slate-900 dark:text-white">
                  {speciesB.scientificName}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                {speciesB.commonName}
              </span>
            </div>

            {/* Viewport Frame */}
            <div className="relative w-full aspect-4/3 rounded-2xl bg-stone-950 border-2 border-emerald-300 dark:border-emerald-800 overflow-hidden shadow-inner flex items-center justify-center group select-none">
              {/* Reticle for micro and svg */}
              {viewerMode !== 'photo_field' && (
                <>
                  <div className="absolute inset-0 border border-white/10 pointer-events-none rounded-full z-10 m-3" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/10 pointer-events-none z-10" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 pointer-events-none z-10" />
                </>
              )}

              {/* Photo View */}
              {viewerMode === 'photo_field' && (
                <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-stone-900">
                  <OfflineImage
                    src={photosB.field}
                    speciesId={speciesB.id}
                    anatomyType={speciesB.anatomyType}
                    scientificName={speciesB.scientificName}
                    viewType="field"
                    alt={`Sintoma de ${speciesB.scientificName}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-200"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_65%,_rgba(0,0,0,0.5)_100%)] pointer-events-none z-10" />
                  <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-bold text-white z-20 border border-white/10">
                    🌾 Sintoma na Raiz / Lavoura
                  </div>
                </div>
              )}

              {viewerMode === 'photo_micro' && (
                <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-stone-950">
                  <OfflineImage
                    src={photosB.micro}
                    speciesId={speciesB.id}
                    anatomyType={speciesB.anatomyType}
                    scientificName={speciesB.scientificName}
                    viewType="microscope"
                    alt={`Micrografia de ${speciesB.scientificName}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-200"
                    style={{ transform: `scale(${zoomLevel * 1.1})` }}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_50%,_rgba(0,0,0,0.7)_100%)] pointer-events-none z-10" />
                  <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-bold text-white z-20 border border-white/10">
                    🔬 Micrografia Óptica HD
                  </div>
                </div>
              )}

              {viewerMode === 'svg' && (
                <div className="w-full h-full relative flex items-center justify-center bg-slate-900">
                  <svg
                    viewBox="0 0 200 200"
                    className="w-3/4 h-3/4 select-none transition-transform duration-300"
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    {speciesB.anatomyType === 'globose' && (
                      <g>
                        <path d="M 100 120 C 50 140, 40 80, 80 50 C 90 40, 100 20, 100 10 C 100 20, 110 40, 120 50 C 160 80, 150 140, 100 120 Z" fill="rgba(52, 211, 153, 0.25)" stroke="#34d399" strokeWidth="3" />
                        <line x1="100" y1="10" x2="100" y2="28" stroke="#34d399" strokeWidth="2.5" />
                        <circle cx="100" cy="28" r="2.5" fill="#34d399" />
                      </g>
                    )}
                    {speciesB.anatomyType === 'cyst' && (
                      <g>
                        <path d="M 100 140 C 55 130, 45 70, 100 40 C 100 30, 100 30, 100 20 C 100 30, 100 30, 100 40 C 155 70, 145 130, 100 140 Z" fill="rgba(251, 191, 36, 0.25)" stroke="#fbbf24" strokeWidth="3.5" />
                      </g>
                    )}
                    {speciesB.anatomyType === 'reniform' && (
                      <g>
                        <path d="M 50 100 Q 80 40, 130 50 C 170 60, 180 120, 130 140 C 90 150, 70 120, 50 100 Z" fill="rgba(249, 115, 22, 0.25)" stroke="#f97316" strokeWidth="3" />
                      </g>
                    )}
                    {(!speciesB.anatomyType || speciesB.anatomyType === 'vermiform' || speciesB.anatomyType === 'dagger' || speciesB.anatomyType === 'spiral' || speciesB.anatomyType === 'sheath' || speciesB.anatomyType === 'pin') && (
                      <g>
                        <path d="M 30 50 Q 80 40, 120 80 T 170 150 Q 140 140, 110 110 T 30 50 Z" fill="rgba(52, 211, 153, 0.25)" stroke="#34d399" strokeWidth="2.5" />
                        <line x1="33" y1="48" x2="47" y2="52" stroke="#34d399" strokeWidth="2" />
                      </g>
                    )}
                  </svg>
                </div>
              )}
            </div>

            {/* Stage B Caption */}
            <div className="text-xs bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-emerald-700 dark:text-emerald-400">
                  {viewerMode === 'photo_micro' ? `🔬 ${photosB.magnification} • ${photosB.staining}` : `🌾 ${photosB.symptomTitle}`}
                </span>
                <span className="text-slate-400">
                  {viewerMode === 'photo_micro' ? photosB.microCredit : photosB.fieldCredit}
                </span>
              </div>
              <p className="text-[11px] text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                {viewerMode === 'photo_field' ? photosB.fieldDesc : viewerMode === 'photo_micro' ? photosB.microDesc : 'Esquema morfológico vetorial da espécie B.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MATRIZ DE DIAGNÓSTICO DIFERENCIAL E TABELA COMPARATIVA */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-900 pb-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Matriz Técnica de Diagnóstico Diferencial
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">
              Confronto paramétrico detalhado das características fitopatológicas de ambas as espécies.
            </p>
          </div>

          {/* Table Category Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 text-[10px] font-bold">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-500'
              }`}
            >
              Todos os Critérios
            </button>
            <button
              onClick={() => setFilterCategory('morphology')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterCategory === 'morphology'
                  ? 'bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-400 shadow-xs font-black'
                  : 'text-slate-500'
              }`}
            >
              Morfologia
            </button>
            <button
              onClick={() => setFilterCategory('symptoms')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterCategory === 'symptoms'
                  ? 'bg-white dark:bg-zinc-800 text-amber-700 dark:text-amber-400 shadow-xs font-black'
                  : 'text-slate-500'
              }`}
            >
              Sintomas & Dano
            </button>
            <button
              onClick={() => setFilterCategory('hosts')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterCategory === 'hosts'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-black'
                  : 'text-slate-500'
              }`}
            >
              Hospedeiras
            </button>
            <button
              onClick={() => setFilterCategory('management')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterCategory === 'management'
                  ? 'bg-white dark:bg-zinc-800 text-purple-700 dark:text-purple-400 shadow-xs font-black'
                  : 'text-slate-500'
              }`}
            >
              Manejo (MIP)
            </button>
          </div>
        </div>

        {/* COMPARISON ROWS */}
        <div className="space-y-3">
          {/* ROW 1: Grupo Anatômico & Hábito Parasitário */}
          {(filterCategory === 'all' || filterCategory === 'morphology') && (
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="bg-slate-100 dark:bg-zinc-900/80 px-4 py-2 text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                <span>🧬 Grupo Anatômico & Hábito Parasitário</span>
                <span className="text-[10px] font-normal text-slate-500">Morfologia & Biologia</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800 p-3 bg-white dark:bg-zinc-950 text-xs">
                <div className="p-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeA.color}`}>
                      {badgeA.label}
                    </span>
                    <strong className="italic text-slate-900 dark:text-white font-bold">{speciesA.scientificName}</strong>
                  </div>
                  <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {speciesA.morphology || speciesA.etiology || 'Forma vermiforme ou globosa adaptada ao parasitismo radicular.'}
                  </p>
                </div>
                <div className="p-2 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeB.color}`}>
                      {badgeB.label}
                    </span>
                    <strong className="italic text-slate-900 dark:text-white font-bold">{speciesB.scientificName}</strong>
                  </div>
                  <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {speciesB.morphology || speciesB.etiology || 'Forma vermiforme ou globosa adaptada ao parasitismo radicular.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ROW 2: Sintomas Radiculares & Diagnóstico de Campo */}
          {(filterCategory === 'all' || filterCategory === 'symptoms') && (
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="bg-amber-50 dark:bg-amber-950/30 px-4 py-2 text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center justify-between border-b border-amber-200 dark:border-amber-900/40">
                <span>🌾 Sintomas Radiculares & Identificação em Campo</span>
                <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400">Diagnóstico In-Loco</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800 p-3 bg-white dark:bg-zinc-950 text-xs">
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-600 block">{speciesA.scientificName}</span>
                  <p className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                    {speciesA.symptoms}
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-600 block">{speciesB.scientificName}</span>
                  <p className="text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                    {speciesB.symptoms}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ROW 3: Métodos Laboratoriais & Caracteres Diagnósticos */}
          {(filterCategory === 'all' || filterCategory === 'morphology') && (
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="bg-slate-100 dark:bg-zinc-900/80 px-4 py-2 text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center justify-between">
                <span>🔬 Identificação Microscópica & Morfometria</span>
                <span className="text-[10px] font-normal text-slate-500">Chave Dicotômica</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800 p-3 bg-white dark:bg-zinc-950 text-xs">
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-600 block">{speciesA.scientificName}</span>
                  <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {speciesA.identification || speciesA.identificationMethods}
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-600 block">{speciesB.scientificName}</span>
                  <p className="text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {speciesB.identification || speciesB.identificationMethods}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ROW 4: Espectro de Hospedeiras & Cruzamento Agronômico */}
          {(filterCategory === 'all' || filterCategory === 'hosts') && (
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900/40">
                <span>🌱 Comparativo de Culturas Hospedeiras & Cruzamento</span>
                <span className="text-[10px] font-normal text-emerald-700 dark:text-emerald-400">Espectro de Ataque</span>
              </div>
              <div className="p-4 bg-white dark:bg-zinc-950 text-xs space-y-3">
                {/* Shared Hosts Highlight */}
                {sharedHosts.length > 0 && (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Culturas Suscetíveis a Ambas as Espécies (Alto Risco de Multiplicação Simultânea):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sharedHosts.map((h, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-bold text-[10px]">
                          ⚠️ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Unique A */}
                  <div className="space-y-1.5">
                    <strong className="text-blue-700 dark:text-blue-400 block font-bold text-xs">
                      Hospedeiras de {speciesA.scientificName}:
                    </strong>
                    <div className="flex flex-wrap gap-1">
                      {hostsA.map((h, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-[10px] font-medium border border-slate-200 dark:border-zinc-700">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Unique B */}
                  <div className="space-y-1.5">
                    <strong className="text-emerald-700 dark:text-emerald-400 block font-bold text-xs">
                      Hospedeiras de {speciesB.scientificName}:
                    </strong>
                    <div className="flex flex-wrap gap-1">
                      {hostsB.map((h, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-[10px] font-medium border border-slate-200 dark:border-zinc-700">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ROW 5: Limiares de Dano Econômico */}
          {(filterCategory === 'all' || filterCategory === 'symptoms') && (
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="bg-red-50 dark:bg-red-950/30 px-4 py-2 text-xs font-black text-red-900 dark:text-red-300 uppercase tracking-wider flex items-center justify-between border-b border-red-200 dark:border-red-900/40">
                <span>⚠️ Limiares de Dano Econômico (LDE) & Fator de Reprodução</span>
                <span className="text-[10px] font-normal text-red-700 dark:text-red-400">Tolerância da Cultura</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800 p-3 bg-white dark:bg-zinc-950 text-xs">
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-600 block">{speciesA.scientificName}</span>
                  <p className="text-red-600 dark:text-red-400 font-bold leading-relaxed">
                    {speciesA.economicDamage}
                  </p>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Limiares de Alerta: Moderado ({speciesA.riskThresholds?.moderate || 0}) • Alto ({speciesA.riskThresholds?.high || 0}) • Crítico ({speciesA.riskThresholds?.veryHigh || 0})
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-600 block">{speciesB.scientificName}</span>
                  <p className="text-red-600 dark:text-red-400 font-bold leading-relaxed">
                    {speciesB.economicDamage}
                  </p>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Limiares de Alerta: Moderado ({speciesB.riskThresholds?.moderate || 0}) • Alto ({speciesB.riskThresholds?.high || 0}) • Crítico ({speciesB.riskThresholds?.veryHigh || 0})
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ROW 6: Manejo Cultural & Conflitos de Rotação */}
          {(filterCategory === 'all' || filterCategory === 'management') && (
            <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="bg-purple-50 dark:bg-purple-950/30 px-4 py-2 text-xs font-black text-purple-900 dark:text-purple-300 uppercase tracking-wider flex items-center justify-between border-b border-purple-200 dark:border-purple-900/40">
                <span>🛡️ Diretrizes de Rotação & Manejo Integrado (MIP)</span>
                <span className="text-[10px] font-normal text-purple-700 dark:text-purple-400">Estratégias de Controle</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800 p-3 bg-white dark:bg-zinc-950 text-xs">
                <div className="p-2 space-y-2">
                  <span className="text-[10px] font-black uppercase text-blue-600 block">{speciesA.scientificName}</span>
                  <div>
                    <strong className="text-[11px] font-bold text-slate-900 dark:text-white block mb-0.5">🌱 Controle Cultural & Rotação:</strong>
                    <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                      {speciesA.culturalControl || speciesA.managementStrategies}
                    </p>
                  </div>
                  <div>
                    <strong className="text-[11px] font-bold text-slate-900 dark:text-white block mb-0.5">🧪 Químico & Bionematicidas:</strong>
                    <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                      {speciesA.chemicalControl || 'Tratamento de sementes com ingredientes ativos de choque e bionematicidas microbiológicos.'}
                    </p>
                  </div>
                </div>

                <div className="p-2 space-y-2">
                  <span className="text-[10px] font-black uppercase text-emerald-600 block">{speciesB.scientificName}</span>
                  <div>
                    <strong className="text-[11px] font-bold text-slate-900 dark:text-white block mb-0.5">🌱 Controle Cultural & Rotação:</strong>
                    <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                      {speciesB.culturalControl || speciesB.managementStrategies}
                    </p>
                  </div>
                  <div>
                    <strong className="text-[11px] font-bold text-slate-900 dark:text-white block mb-0.5">🧪 Químico & Bionematicidas:</strong>
                    <p className="text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                      {speciesB.chemicalControl || 'Tratamento de sementes com ingredientes ativos de choque e bionematicidas microbiológicos.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. GUIA RÁPIDO: COMO NÃO ERRAR O DIAGNÓSTICO EM CAMPO    */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-blue-900/10 via-slate-900/5 to-emerald-900/10 dark:from-blue-950/40 dark:via-zinc-950 dark:to-emerald-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h4 className="font-black text-sm text-slate-900 dark:text-white">
            Guia Rápido de Campo: Como Diferenciar {speciesA.scientificName.split(' ')[0]} e {speciesB.scientificName.split(' ')[0]}
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/80 dark:bg-zinc-900/80 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 block">
              1. Exame das Raizes Lavadas
            </span>
            <p className="text-slate-700 dark:text-zinc-300 leading-snug font-medium">
              Lave as raízes cuidadosamente com água limpa. Diferencie nós/galhas vasculares ({speciesA.scientificName.split(' ')[0]}) de necroses escuras ou cistos perolados ({speciesB.scientificName.split(' ')[0]}).
            </p>
          </div>

          <div className="bg-white/80 dark:bg-zinc-900/80 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 block">
              2. Padrão da Reboleira
            </span>
            <p className="text-slate-700 dark:text-zinc-300 leading-snug font-medium">
              Reboleiras bem delimitadas e circulares com amarelecimento intenso sugerem parasitismo severo ou cistos, enquanto áreas extensas de definhamento gradual apontam para ectoparasitas ou lesões.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-zinc-900/80 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">
              3. Decisão de Rotação
            </span>
            <p className="text-slate-700 dark:text-zinc-300 leading-snug font-medium">
              Atenção redobrada na escolha da crotalária e braquiária: espécies que reduzem {speciesA.scientificName.split(' ')[0]} podem servir como hospedeiras para {speciesB.scientificName.split(' ')[0]}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NematodeComparator;
