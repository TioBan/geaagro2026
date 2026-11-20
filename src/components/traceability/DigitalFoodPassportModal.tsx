import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Calendar,
  Building2,
  Lock,
  Eye,
  Share2,
  X,
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
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, [onClose]);

  const lotOps = operations.filter(o => o.lotId === lot.id || o.lotCode === lot.lotCode);
  const lotPhotos = photos.filter(p => p.lotId === lot.id || p.lotCode === lot.lotCode);
  const lotHarvs = harvests.filter(h => h.lotId === lot.id || h.lotCode === lot.lotCode);

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('lote', lot.lotCode);
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = window.setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="passport-modal-title"
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl max-w-3xl w-full border border-slate-200/80 dark:border-zinc-800 overflow-hidden my-4 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60">
                  <Sparkles className="w-3 h-3" />
                  Passaporte Digital do Alimento
                </span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold border bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 border-slate-200/80 dark:border-zinc-700">
                  {lot.lotCode}
                </span>
              </div>

              <h2 id="passport-modal-title" className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                {lot.cropName} <span className="font-normal text-slate-500 dark:text-zinc-400">({lot.cultivarName})</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  Produzido em {property.farmName || lot.farmName || 'Propriedade Rural'}
                  {(property.city || property.state) && ` • ${[property.city, property.state].filter(Boolean).join(' - ')}`}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar passaporte"
              className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-200/60 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode('public')}
              className={`h-7 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'public'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Visão Consumidor
            </button>
            <button
              type="button"
              onClick={() => setViewMode('audit')}
              className={`h-7 px-3 rounded-md text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === 'audit'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Visão Técnica & Auditoria
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 text-slate-700 dark:text-zinc-300 text-xs">
          {viewMode === 'public' ? (
            <div className="space-y-5">
              {/* Trust Notice */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-lg p-3.5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 text-xs">
                    Alimento Seguro & Rastreabilidade Verificada
                  </h4>
                  <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed mt-0.5">
                    Este lote foi produzido respeitando as Boas Práticas Agrícolas, livre de resíduos em período de carência e em estrita conformidade com a INC 02/2018 MAPA/ANVISA.
                  </p>
                </div>
              </div>

              {/* Farm Origin */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Origem do Produto
                </h4>
                <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 space-y-2">
                  <p className="font-semibold text-slate-900 dark:text-zinc-100">
                    {property.farmName || lot.farmName || 'Propriedade Rural'}
                    {property.producerName && ` — Produtor ${property.producerName}`}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    Localizada em {property.city || 'Município não informado'}/{property.state || 'UF'}, a propriedade adota manejo integrado de pragas, irrigação eficiente e rastreabilidade individualizada por talhão.
                  </p>
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60">
                      CAR: {property.carRegister || 'Cadastrado'}
                    </span>
                    {property.technicalResponsible && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60">
                        RT: {property.technicalResponsible} ({property.creaNumber})
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700">
                      Talhão de Origem: {lot.plotCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lifecycle Journey */}
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Jornada do Alimento
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500 block">Semeadura</span>
                    <strong className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block mt-1 tabular-nums">
                      {new Date(lot.sowingDate).toLocaleDateString('pt-BR')}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500 block">Transplante</span>
                    <strong className="text-xs font-semibold text-slate-900 dark:text-zinc-100 block mt-1 tabular-nums">
                      {lot.nurseryTransplantDate ? new Date(lot.nurseryTransplantDate).toLocaleDateString('pt-BR') : 'Semeadura Direta'}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500 block">Colheita</span>
                    <strong className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mt-1 tabular-nums">
                      {lotHarvs[0] ? new Date(lotHarvs[0].date).toLocaleDateString('pt-BR') : 'Em andamento'}
                    </strong>
                  </div>
                  <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-zinc-500 block">Sustentabilidade</span>
                    <strong className="text-xs font-semibold text-teal-700 dark:text-teal-400 block mt-1 tabular-nums">
                      IGR {lot.igrScorePercentage}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Photos Gallery */}
              {lotPhotos.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs uppercase tracking-wider">
                    Fotos Reais do Cultivo
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {lotPhotos.map(photo => (
                      <div key={photo.id} className="rounded-lg overflow-hidden border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/60">
                        <img src={photo.photoUrl} alt={photo.caption || photo.title || 'Cultivo'} className="w-full h-28 object-cover" />
                        <p className="p-2 text-[11px] font-medium text-slate-600 dark:text-zinc-400 line-clamp-1">
                          {photo.caption || photo.title || 'Registro de campo'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Technical Overview */}
              <div className="bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg p-3.5 border border-slate-200/70 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">
                    Ficha Técnica do Lote (Auditoria Fiscal MAPA/ANVISA)
                  </h4>
                  <span className="font-mono font-semibold text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 px-1.5 py-0.5 rounded-md">
                    {lot.lotCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">Cultura / Cultivar</span>
                    <strong className="text-slate-900 dark:text-zinc-100">{lot.cropName} ({lot.cultivarName})</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">Área & População</span>
                    <strong className="text-slate-900 dark:text-zinc-100 tabular-nums">
                      {lot.plantedAreaHa} ha ({lot.plantsCount.toLocaleString('pt-BR')} pl)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">Fornecedor Semente (RNS)</span>
                    <strong className="text-slate-900 dark:text-zinc-100">
                      {lot.seedSupplier || '--'} {lot.seedLotNumber ? `(Lote ${lot.seedLotNumber})` : ''}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">Produtor</span>
                    <strong className="text-slate-900 dark:text-zinc-100">
                      {property.producerName || '--'} {property.documentNumber ? `(${property.documentNumber})` : ''}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">Responsável Técnico</span>
                    <strong className="text-slate-900 dark:text-zinc-100">
                      {property.technicalResponsible || '--'} {property.creaNumber ? `(${property.councilType} ${property.creaNumber})` : ''}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 block">Índice IGR</span>
                    <strong className="text-emerald-700 dark:text-emerald-400 tabular-nums capitalize">
                      {lot.igrScorePercentage}% ({lot.igrStatus})
                    </strong>
                  </div>
                </div>
              </div>

              {/* Operations History */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">
                    Caderno de Aplicações e Carências Fitossanitárias
                  </h4>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">{lotOps.length} registros</span>
                </div>

                {lotOps.length === 0 ? (
                  <div className="p-4 text-center rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400">
                    Nenhuma operação agrícola registrada para este lote.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200/80 dark:border-zinc-800 rounded-lg">
                    <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                      <thead className="bg-slate-50/80 dark:bg-zinc-950/60 text-[10px] uppercase font-semibold text-slate-500 dark:text-zinc-400 border-b border-slate-200/80 dark:border-zinc-800">
                        <tr>
                          <th className="py-2 px-3">Data</th>
                          <th className="py-2 px-3">Tipo</th>
                          <th className="py-2 px-3">Insumo / I.A.</th>
                          <th className="py-2 px-3">Dose / Alvo</th>
                          <th className="py-2 px-3">Carência</th>
                          <th className="py-2 px-3">ART / Receituário</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800">
                        {lotOps.map(op => (
                          <tr key={op.id}>
                            <td className="py-2 px-3 whitespace-nowrap tabular-nums">
                              {new Date(op.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-2 px-3 capitalize font-medium">{op.type.replace(/_/g, ' ')}</td>
                            <td className="py-2 px-3">
                              <span className="font-semibold text-slate-900 dark:text-zinc-100">{op.commercialProduct || '--'}</span>
                              {op.activeIngredient && (
                                <span className="block text-[10px] text-slate-400 dark:text-zinc-500">{op.activeIngredient}</span>
                              )}
                            </td>
                            <td className="py-2 px-3">
                              {op.dosagePerHa || (op.dosageValue ? `${op.dosageValue} ${op.dosageUnit || ''}` : '--')}
                              {(op.targetPestDisease || op.targetPestOrDisease) && (
                                <span className="block text-[10px] text-slate-400 dark:text-zinc-500">
                                  {op.targetPestDisease || op.targetPestOrDisease}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap tabular-nums">
                              {op.withholdingPeriodDays || op.safetyIntervalDays
                                ? `${op.withholdingPeriodDays || op.safetyIntervalDays} dias`
                                : 'Isento'}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-sky-700 dark:text-sky-400">
                              {op.agronomistPrescriptionArt || '--'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50/70 dark:bg-zinc-950/60 px-4 py-3 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
            Passaporte Verificado • GeaAgro Rastreabilidade
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="h-8 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copiedLink ? 'Link Copiado' : 'Compartilhar Passaporte'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
