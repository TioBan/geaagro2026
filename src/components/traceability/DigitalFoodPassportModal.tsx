import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Calendar,
  Building2,
  Leaf,
  CheckCircle2,
  Award,
  Lock,
  Eye,
  FileText,
  Share2,
  X,
  ExternalLink,
  ChevronRight,
  Heart,
  Droplets,
  Tractor,
} from 'lucide-react';
import {
  TraceabilityLot,
  TraceabilityProperty,
  TraceabilityOperation,
  TraceabilityHarvestItem,
  TraceabilityPhotoDiaryItem,
} from '../../types/traceability';

interface PassportModalProps {
  lot: TraceabilityLot;
  property: TraceabilityProperty;
  operations: TraceabilityOperation[];
  harvests: TraceabilityHarvestItem[];
  photos: TraceabilityPhotoDiaryItem[];
  onClose: () => void;
}

export const DigitalFoodPassportModal: React.FC<PassportModalProps> = ({
  lot,
  property,
  operations,
  harvests,
  photos,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'public' | 'audit'>('public');
  const [copiedLink, setCopiedLink] = useState(false);

  const lotOps = operations.filter(o => o.lotId === lot.id || o.lotCode === lot.lotCode);
  const lotPhotos = photos.filter(p => p.lotId === lot.id || p.lotCode === lot.lotCode);
  const lotHarvs = harvests.filter(h => h.lotId === lot.id || h.lotCode === lot.lotCode);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Passaporte Digital do Alimento • GeaAgro
            </span>
            <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
              {lot.lotCode}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {lot.cropName} <span className="font-light text-emerald-200">({lot.cultivarName})</span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            Produzido em {property.farmName} • {property.city} - {property.state}
          </p>

          {/* Mode Switcher */}
          <div className="mt-4 flex items-center gap-2 bg-black/40 p-1 rounded-xl w-fit backdrop-blur-md">
            <button
              onClick={() => setViewMode('public')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'public'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Visão Consumidor
            </button>
            <button
              onClick={() => setViewMode('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'audit'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Visão Técnica & Auditoria
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-zinc-300 text-xs sm:text-sm">
          {viewMode === 'public' ? (
            /* Public View for Final Consumer */
            <div className="space-y-6">
              {/* Trust Badge */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                    Alimento Seguro & Rastreabilidade Verificada
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed mt-0.5">
                    Este lote foi produzido respeitando as Boas Práticas Agrícolas, livre de resíduos em período de carência e em estrita conformidade com a INC 02/2018 MAPA/ANVISA.
                  </p>
                </div>
              </div>

              {/* Story of the Farm */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Origem do Produto
                </h4>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 space-y-2">
                  <p className="font-bold text-slate-800 dark:text-zinc-200">
                    {property.farmName} — Produtor {property.producerName}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Localizada em {property.city}/{property.state}, a propriedade adota manejo integrado de pragas, irrigação eficiente por gotejamento e rastreabilidade individualizada de cada talhão e estufa.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      CAR: {property.carRegister || 'Cadastrado'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      RT: {property.technicalResponsible} ({property.creaNumber})
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                      Talhão de Origem: {lot.plotCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lifecycle & Harvest Journey */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Jornada do Alimento
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Semeadura</span>
                    <strong className="text-xs font-bold text-slate-800 dark:text-zinc-200 block mt-1">
                      {new Date(lot.sowingDate).toLocaleDateString('pt-BR')}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Transplante</span>
                    <strong className="text-xs font-bold text-slate-800 dark:text-zinc-200 block mt-1">
                      {lot.nurseryTransplantDate ? new Date(lot.nurseryTransplantDate).toLocaleDateString('pt-BR') : 'Semeadura Direta'}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Colheita</span>
                    <strong className="text-xs font-bold text-emerald-600 block mt-1">
                      {lotHarvs[0] ? new Date(lotHarvs[0].date).toLocaleDateString('pt-BR') : 'Em andamento'}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sustentabilidade</span>
                    <strong className="text-xs font-bold text-teal-600 block mt-1">
                      IGR {lot.igrScorePercentage}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Photos Gallery */}
              {lotPhotos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    Fotos Reais do Cultivo
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {lotPhotos.map(photo => (
                      <div key={photo.id} className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800">
                        <img src={photo.photoUrl} alt={photo.caption} className="w-full h-28 object-cover" />
                        <p className="p-2 text-[10px] font-medium text-slate-600 dark:text-zinc-400 line-clamp-1">{photo.caption}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Audit / Technical View */
            <div className="space-y-6">
              {/* Technical Data Overview */}
              <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-4 border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Ficha Técnica do Lote (Auditoria Fiscal MAPA/ANVISA)
                  </h4>
                  <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {lot.lotCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Cultura / Cultivar:</span>
                    <strong>{lot.cropName} ({lot.cultivarName})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Área & População:</span>
                    <strong>{lot.plantedAreaHa} ha ({lot.plantsCount.toLocaleString('pt-BR')} pl)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Fornecedor Semente (RNS):</span>
                    <strong>{lot.seedSupplier} (Lote {lot.seedLotNumber})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Produtor:</span>
                    <strong>{property.producerName} ({property.documentNumber})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Responsável Técnico:</span>
                    <strong>{property.technicalResponsible} ({property.councilType} {property.creaNumber})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Índice IGR:</span>
                    <strong className="text-emerald-600">{lot.igrScorePercentage}% ({lot.igrStatus})</strong>
                  </div>
                </div>
              </div>

              {/* Complete Chemical / Operations History */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
                  <span>Caderno de Aplicações e Carências Fitossanitárias</span>
                  <span className="text-xs text-slate-400 font-normal">{lotOps.length} registros</span>
                </h4>

                <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                    <thead className="bg-slate-100 dark:bg-zinc-800 text-[10px] uppercase font-bold text-slate-500">
                      <tr>
                        <th className="py-2 px-3">Data</th>
                        <th className="py-2 px-3">Tipo</th>
                        <th className="py-2 px-3">Insumo / I.A.</th>
                        <th className="py-2 px-3">Dose / Alvo</th>
                        <th className="py-2 px-3">Carência</th>
                        <th className="py-2 px-3">ART / Receituário</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {lotOps.map(op => (
                        <tr key={op.id}>
                          <td className="py-2 px-3">{new Date(op.date).toLocaleDateString('pt-BR')}</td>
                          <td className="py-2 px-3 capitalize font-semibold">{op.type.replace('_', ' ')}</td>
                          <td className="py-2 px-3">
                            <span className="font-bold">{op.commercialProduct || '--'}</span>
                            <span className="block text-[10px] text-slate-400">{op.activeIngredient}</span>
                          </td>
                          <td className="py-2 px-3">
                            {op.dosagePerHa}
                            <span className="block text-[10px] text-slate-400">{op.targetPestDisease}</span>
                          </td>
                          <td className="py-2 px-3">
                            {op.withholdingPeriodDays ? `${op.withholdingPeriodDays} dias` : 'Isento'}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-blue-600">
                            {op.agronomistPrescriptionArt || '--'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-zinc-800/80 p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-500 text-[11px]">
            Passaporte Verificado • GeaAgro Suite v2.0
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copiedLink ? 'Link Copiado!' : 'Compartilhar Passaporte'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
