import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Camera,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import {
  TraceabilityPestMonitoring,
  TraceabilityPhotoDiaryItem,
  TraceabilityLot,
  SeverityLevel,
  PhotoCategory,
} from '../../types/traceability';

interface MonitoringDiaryProps {
  lots: TraceabilityLot[];
  monitoring: TraceabilityPestMonitoring[];
  photoDiary: TraceabilityPhotoDiaryItem[];
  onSaveMonitoring: (item: TraceabilityPestMonitoring) => void;
  onSavePhoto: (photo: TraceabilityPhotoDiaryItem) => void;
  onDeleteMonitoring: (id: string) => void;
  onDeletePhoto: (id: string) => void;
}

export const TraceabilityMonitoringDiary: React.FC<MonitoringDiaryProps> = ({
  lots,
  monitoring,
  photoDiary,
  onSaveMonitoring,
  onSavePhoto,
  onDeleteMonitoring,
  onDeletePhoto,
}) => {
  const [activeTab, setActiveTab] = useState<'mip' | 'fotos'>('mip');
  const [selectedLotFilter, setSelectedLotFilter] = useState<string>('all');
  const [isMIPModalOpen, setIsMIPModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [confirmDeleteMipId, setConfirmDeleteMipId] = useState<string | null>(null);
  const [confirmDeletePhotoId, setConfirmDeletePhotoId] = useState<string | null>(null);

  const [mipForm, setMipForm] = useState<{
    lotId: string;
    date: string;
    pestOrDisease: string;
    scientificName: string;
    infestationPercentage: number;
    severity: SeverityLevel;
    affectedOrgan: string;
    economicThresholdExceeded: boolean;
    recommendedAction: string;
    inspectorName: string;
  }>({
    lotId: lots[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    pestOrDisease: '',
    scientificName: '',
    infestationPercentage: 4.5,
    severity: 'baixa',
    affectedOrgan: 'Folhas novas e brotações',
    economicThresholdExceeded: false,
    recommendedAction: '',
    inspectorName: '',
  });

  const [photoForm, setPhotoForm] = useState<{
    lotId: string;
    date: string;
    stage: string;
    caption: string;
    photoUrl: string;
    category: PhotoCategory;
  }>({
    lotId: lots[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    stage: 'Frutificação Plena',
    caption: '',
    photoUrl: '',
    category: 'qualidade',
  });

  useEffect(() => {
    if (!isMIPModalOpen && !isPhotoModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMIPModalOpen(false);
        setIsPhotoModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMIPModalOpen, isPhotoModalOpen]);

  const filteredMonitoring = monitoring.filter(m => selectedLotFilter === 'all' || m.lotId === selectedLotFilter);
  const filteredPhotos = photoDiary.filter(p => selectedLotFilter === 'all' || p.lotId === selectedLotFilter);

  const handleOpenMIPModal = () => {
    setMipForm(prev => ({ ...prev, lotId: prev.lotId || lots[0]?.id || '' }));
    setIsMIPModalOpen(true);
  };

  const handleOpenPhotoModal = () => {
    setPhotoForm(prev => ({ ...prev, lotId: prev.lotId || lots[0]?.id || '' }));
    setIsPhotoModalOpen(true);
  };

  const handleMIPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lotObj = lots.find(l => l.id === mipForm.lotId) || lots[0];

    const newItem: TraceabilityPestMonitoring = {
      id: `mip-${Date.now()}`,
      lotId: lotObj?.id || 'geral',
      lotCode: lotObj?.lotCode || 'GERAL',
      date: mipForm.date,
      pestOrDisease: mipForm.pestOrDisease,
      scientificName: mipForm.scientificName,
      infestationPercentage: Number(mipForm.infestationPercentage),
      severity: mipForm.severity,
      affectedOrgan: mipForm.affectedOrgan,
      economicThresholdExceeded: mipForm.severity === 'alta' || mipForm.severity === 'critica' || mipForm.economicThresholdExceeded,
      recommendedAction: mipForm.recommendedAction,
      inspectorName: mipForm.inspectorName || 'Técnico de Campo',
    };

    onSaveMonitoring(newItem);
    setIsMIPModalOpen(false);
  };

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lotObj = lots.find(l => l.id === photoForm.lotId) || lots[0];

    const newPhoto: TraceabilityPhotoDiaryItem = {
      id: `foto-${Date.now()}`,
      lotId: lotObj?.id || 'geral',
      lotCode: lotObj?.lotCode || 'GERAL',
      date: photoForm.date,
      stage: photoForm.stage,
      caption: photoForm.caption,
      photoUrl: photoForm.photoUrl,
      category: photoForm.category,
      createdAt: new Date().toISOString(),
    };

    onSavePhoto(newPhoto);
    setIsPhotoModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header & Sub-tab Switcher */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Monitoramento Fitossanitário (MIP) & Diário Fotográfico
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Acompanhamento de pragas, doenças, nível de dano econômico (NDE) e registro visual cronológico
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedLotFilter}
              onChange={e => setSelectedLotFilter(e.target.value)}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            >
              <option value="all">Todos os Lotes</option>
              {lots.map(l => (
                <option key={l.id} value={l.id}>
                  {l.lotCode} - {l.cropName}
                </option>
              ))}
            </select>

            {activeTab === 'mip' ? (
              <button
                type="button"
                onClick={handleOpenMIPModal}
                className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Novo Laudo MIP
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenPhotoModal}
                className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" /> Adicionar Foto
              </button>
            )}
          </div>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('mip')}
            className={`h-8 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap tabular-nums cursor-pointer ${
              activeTab === 'mip'
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-slate-200/80 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            Pragas e Doenças ({filteredMonitoring.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fotos')}
            className={`h-8 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap tabular-nums cursor-pointer ${
              activeTab === 'fotos'
                ? 'bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-400 border border-slate-200/80 dark:border-zinc-700'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            Diário Fotográfico ({filteredPhotos.length})
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'mip' ? (
        filteredMonitoring.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-10 text-center space-y-3">
            <ShieldAlert className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              Nenhum laudo de monitoramento MIP registrado.
            </p>
            <button
              type="button"
              onClick={handleOpenMIPModal}
              className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Registrar Primeiro Laudo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredMonitoring.map(item => {
              const isHigh = item.severity === 'alta' || item.severity === 'critica' || item.economicThresholdExceeded;
              const isConfirming = confirmDeleteMipId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-semibold text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
                        {item.lotCode}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] uppercase font-semibold border ${
                          item.severity === 'baixa'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
                            : item.severity === 'media' || item.severity === 'moderada'
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60'
                        }`}
                      >
                        Severidade {item.severity}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        {item.pestOrDisease || item.pestOrDiseaseName}
                      </h4>
                      {item.scientificName && (
                        <p className="text-[11px] italic text-slate-400 dark:text-zinc-500">{item.scientificName}</p>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-300 tabular-nums">
                      {item.affectedOrgan && (
                        <p>
                          Órgão afetado: <strong className="text-slate-800 dark:text-zinc-200">{item.affectedOrgan}</strong>
                        </p>
                      )}
                      <p>
                        Infestação:{' '}
                        <strong className={isHigh ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}>
                          {item.infestationPercentage ?? item.percentageAttackedPlants ?? 0}%
                        </strong>
                      </p>
                      {item.recommendedAction && (
                        <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                          Conduta: {item.recommendedAction}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                    <span className="truncate">
                      {new Date(item.date).toLocaleDateString('pt-BR')} • {item.inspectorName || item.scoutName || 'Campo'}
                    </span>
                    {isConfirming ? (
                      <div className="inline-flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteMonitoring(item.id);
                            setConfirmDeleteMipId(null);
                          }}
                          className="h-6 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[10px] font-medium cursor-pointer"
                        >
                          Excluir
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteMipId(null)}
                          className="h-6 px-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-md text-[10px] font-medium cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteMipId(item.id)}
                        className="h-7 w-7 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md shrink-0 cursor-pointer"
                        title="Excluir Laudo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : filteredPhotos.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-10 text-center space-y-3">
          <Camera className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
            Nenhuma foto registrada no diário cronológico.
          </p>
          <button
            type="button"
            onClick={handleOpenPhotoModal}
            className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" /> Adicionar Primeira Foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredPhotos.map(photo => {
            const isConfirming = confirmDeletePhotoId === photo.id;
            return (
              <div
                key={photo.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden group flex flex-col justify-between"
              >
                <div className="relative h-40 bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                  <img
                    src={photo.photoUrl}
                    alt={photo.caption || 'Foto do cultivo'}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-md">
                    {photo.lotCode}
                  </span>
                  <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md capitalize">
                    {photo.category}
                  </span>
                </div>

                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase">
                      {photo.stage || 'Campo'}
                    </span>
                    <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 line-clamp-2 mt-0.5">
                      {photo.caption}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 tabular-nums">
                    <span>{new Date(photo.date).toLocaleDateString('pt-BR')}</span>
                    {isConfirming ? (
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDeletePhoto(photo.id);
                            setConfirmDeletePhotoId(null);
                          }}
                          className="h-6 px-2 bg-rose-600 text-white rounded-md text-[10px] font-medium cursor-pointer"
                        >
                          Excluir
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeletePhotoId(null)}
                          className="h-6 px-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-md text-[10px] font-medium cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeletePhotoId(photo.id)}
                        className="h-6 w-6 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md cursor-pointer"
                        title="Excluir Foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal MIP */}
      {isMIPModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsMIPModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-xl w-full p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 my-6 text-xs"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Novo Monitoramento Fitossanitário MIP
              </h3>
              <button
                type="button"
                onClick={() => setIsMIPModalOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMIPSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Lote</label>
                  <select
                    value={mipForm.lotId}
                    onChange={e => setMipForm(prev => ({ ...prev, lotId: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  >
                    {lots.length === 0 ? (
                      <option value="">Vistoria Geral</option>
                    ) : (
                      lots.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.lotCode} - {l.cropName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Data da Vistoria *</label>
                  <input
                    type="date"
                    value={mipForm.date}
                    onChange={e => setMipForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Praga / Doença *</label>
                  <input
                    type="text"
                    value={mipForm.pestOrDisease}
                    onChange={e => setMipForm(prev => ({ ...prev, pestOrDisease: e.target.value }))}
                    placeholder="Ex: Mosca-branca, Requeima"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Nome Científico</label>
                  <input
                    type="text"
                    value={mipForm.scientificName}
                    onChange={e => setMipForm(prev => ({ ...prev, scientificName: e.target.value }))}
                    placeholder="Ex: Bemisia tabaci"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Severidade *</label>
                  <select
                    value={mipForm.severity}
                    onChange={e => setMipForm(prev => ({ ...prev, severity: e.target.value as SeverityLevel }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  >
                    <option value="baixa">Baixa (&lt; 5%)</option>
                    <option value="media">Média (5% - 15%)</option>
                    <option value="alta">Alta (15% - 30%)</option>
                    <option value="critica">Crítica (&gt; 30%)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Infestação Estimada (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    max={100}
                    value={mipForm.infestationPercentage}
                    onChange={e => setMipForm(prev => ({ ...prev, infestationPercentage: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Conduta / Ação Recomendada</label>
                <input
                  type="text"
                  value={mipForm.recommendedAction}
                  onChange={e => setMipForm(prev => ({ ...prev, recommendedAction: e.target.value }))}
                  placeholder="Ex: Monitoramento com armadilhas amarelas"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsMIPModalOpen(false)}
                  className="h-9 px-3.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Salvar Laudo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Foto */}
      {isPhotoModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsPhotoModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-xl w-full p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 my-6 text-xs"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Registrar Foto no Diário Cronológico
              </h3>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePhotoSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Lote</label>
                  <select
                    value={photoForm.lotId}
                    onChange={e => setPhotoForm(prev => ({ ...prev, lotId: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  >
                    {lots.length === 0 ? (
                      <option value="">Registro Geral</option>
                    ) : (
                      lots.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.lotCode} - {l.cropName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Categoria</label>
                  <select
                    value={photoForm.category}
                    onChange={e => setPhotoForm(prev => ({ ...prev, category: e.target.value as PhotoCategory }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  >
                    <option value="qualidade">Qualidade dos Frutos / Padrão</option>
                    <option value="desenvolvimento">Desenvolvimento da Lavoura</option>
                    <option value="fitossanidade">Fitossanidade / Sintomas</option>
                    <option value="colheita">Colheita e Embalagem</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Legenda da Foto *</label>
                <input
                  type="text"
                  value={photoForm.caption}
                  onChange={e => setPhotoForm(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder="Descreva o registro visual da lavoura"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">URL da Foto *</label>
                <input
                  type="url"
                  value={photoForm.photoUrl}
                  onChange={e => setPhotoForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="h-9 px-3.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Salvar Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
