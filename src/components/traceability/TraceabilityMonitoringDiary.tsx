import React, { useState } from 'react';
import {
  Activity,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Camera,
  Image,
  Upload,
  Layers,
  ShieldAlert,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  TraceabilityPestMonitoring,
  TraceabilityPhotoDiaryItem,
  TraceabilityPhotoDiary,
  TraceabilityLot,
  SeverityLevel,
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

  // Form State for MIP
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
    pestOrDisease: 'Mosca-Branca',
    scientificName: 'Bemisia tabaci',
    infestationPercentage: 4.5,
    severity: 'baixa',
    affectedOrgan: 'Folhas novas e brotações',
    economicThresholdExceeded: false,
    recommendedAction: 'Monitoramento contínuo com armadilhas amarelas',
    inspectorName: 'Eng. Agrônomo Técnico',
  });

  // Form State for Photo
  const [photoForm, setPhotoForm] = useState<{
    lotId: string;
    date: string;
    stage: string;
    caption: string;
    photoUrl: string;
    category: 'fitossanidade' | 'desenvolvimento' | 'colheita' | 'qualidade';
  }>({
    lotId: lots[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    stage: 'Frutificação Plena',
    caption: 'Frutos com excelente padronização e calibre uniforme',
    photoUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    category: 'qualidade',
  });

  const filteredMonitoring = monitoring.filter(m => {
    return selectedLotFilter === 'all' || m.lotId === selectedLotFilter;
  });

  const filteredPhotos = photoDiary.filter(p => {
    return selectedLotFilter === 'all' || p.lotId === selectedLotFilter;
  });

  const handleMIPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lotObj = lots.find(l => l.id === mipForm.lotId) || lots[0];

    const newItem: TraceabilityPestMonitoring = {
      id: `mip-${Date.now()}`,
      lotId: lotObj.id,
      lotCode: lotObj.lotCode,
      date: mipForm.date,
      pestOrDisease: mipForm.pestOrDisease,
      scientificName: mipForm.scientificName,
      infestationPercentage: Number(mipForm.infestationPercentage),
      severity: mipForm.severity,
      affectedOrgan: mipForm.affectedOrgan,
      economicThresholdExceeded: mipForm.economicThresholdExceeded,
      recommendedAction: mipForm.recommendedAction,
      inspectorName: mipForm.inspectorName,
    };

    onSaveMonitoring(newItem);
    setIsMIPModalOpen(false);
  };

  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lotObj = lots.find(l => l.id === photoForm.lotId) || lots[0];

    const newPhoto: TraceabilityPhotoDiary = {
      id: `photo-${Date.now()}`,
      lotId: lotObj.id,
      lotCode: lotObj.lotCode,
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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Monitoramento Fitossanitário (MIP) & Diário Fotográfico
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Acompanhamento de pragas, doenças, nível de dano econômico (NDE) e registro visual cronológico
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLotFilter}
              onChange={e => setSelectedLotFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold"
            >
              <option value="all">Todos os Lotes</option>
              {lots.map(l => (
                <option key={l.id} value={l.id}>{l.lotCode} - {l.cropName}</option>
              ))}
            </select>

            {activeTab === 'mip' ? (
              <button
                onClick={() => setIsMIPModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" /> Novo Laudo MIP
              </button>
            ) : (
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Camera className="w-4 h-4" /> Adicionar Foto
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pt-2">
          <button
            onClick={() => setActiveTab('mip')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'mip'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            Monitoramento de Pragas e Doenças ({filteredMonitoring.length})
          </button>
          <button
            onClick={() => setActiveTab('fotos')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'fotos'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            Diário Fotográfico Cronológico ({filteredPhotos.length})
          </button>
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'mip' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMonitoring.map(item => {
            const isHigh = item.severity === 'alta' || item.severity === 'critica' || item.economicThresholdExceeded;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-3 relative flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {item.lotCode}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      item.severity === 'baixa'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.severity === 'media'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      Severidade {item.severity}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.pestOrDisease}
                  </h4>
                  {item.scientificName && (
                    <p className="text-xs italic text-slate-400 -mt-1">{item.scientificName}</p>
                  )}

                  <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-300">
                    <p>Órgão Afetado: <strong>{item.affectedOrgan}</strong></p>
                    <p>Taxa de Infestação: <strong className={isHigh ? 'text-rose-600' : 'text-emerald-600'}>{item.infestationPercentage}%</strong></p>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Conduta: {item.recommendedAction}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(item.date).toLocaleDateString('pt-BR')} • {item.inspectorName}</span>
                  <button
                    onClick={() => onDeleteMonitoring(item.id)}
                    className="p-1 hover:text-rose-600 cursor-pointer"
                    title="Excluir Laudo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPhotos.map(photo => (
            <div
              key={photo.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs group flex flex-col justify-between"
            >
              <div className="relative h-44 bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                <img
                  src={photo.photoUrl}
                  alt={photo.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                  {photo.lotCode}
                </span>
                <span className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded capitalize">
                  {photo.category}
                </span>
              </div>

              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{photo.stage}</span>
                  <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 line-clamp-2">
                    {photo.caption}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{new Date(photo.date).toLocaleDateString('pt-BR')}</span>
                  <button
                    onClick={() => onDeletePhoto(photo.id)}
                    className="p-1 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal MIP */}
      {isMIPModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                Novo Monitoramento Fitossanitário MIP
              </h3>
              <button onClick={() => setIsMIPModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMIPSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Lote *</label>
                  <select
                    value={mipForm.lotId}
                    onChange={e => setMipForm(prev => ({ ...prev, lotId: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  >
                    {lots.map(l => (
                      <option key={l.id} value={l.id}>{l.lotCode} - {l.cropName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Data da Vistoria *</label>
                  <input
                    type="date"
                    value={mipForm.date}
                    onChange={e => setMipForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Praga / Doença *</label>
                  <input
                    type="text"
                    value={mipForm.pestOrDisease}
                    onChange={e => setMipForm(prev => ({ ...prev, pestOrDisease: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Nome Científico</label>
                  <input
                    type="text"
                    value={mipForm.scientificName}
                    onChange={e => setMipForm(prev => ({ ...prev, scientificName: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Severidade *</label>
                  <select
                    value={mipForm.severity}
                    onChange={e => setMipForm(prev => ({ ...prev, severity: e.target.value as SeverityLevel }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  >
                    <option value="baixa">Baixa (&lt; 5%)</option>
                    <option value="media">Média (5% - 15%)</option>
                    <option value="alta">Alta (15% - 30%)</option>
                    <option value="critica">Crítica (&gt; 30%)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Infestação Estimada (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={mipForm.infestationPercentage}
                    onChange={e => setMipForm(prev => ({ ...prev, infestationPercentage: Number(e.target.value) }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Conduta / Ação Recomendada</label>
                <input
                  type="text"
                  value={mipForm.recommendedAction}
                  onChange={e => setMipForm(prev => ({ ...prev, recommendedAction: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsMIPModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                Registrar Foto no Diário Cronológico
              </h3>
              <button onClick={() => setIsPhotoModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePhotoSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Lote *</label>
                  <select
                    value={photoForm.lotId}
                    onChange={e => setPhotoForm(prev => ({ ...prev, lotId: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  >
                    {lots.map(l => (
                      <option key={l.id} value={l.id}>{l.lotCode} - {l.cropName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Categoria</label>
                  <select
                    value={photoForm.category}
                    onChange={e => setPhotoForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  >
                    <option value="qualidade">Qualidade dos Frutos / Padrão</option>
                    <option value="desenvolvimento">Desenvolvimento da Lavoura</option>
                    <option value="fitossanidade">Fitossanidade / Sintomas</option>
                    <option value="colheita">Colheita e Embalagem</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Legenda da Foto *</label>
                <input
                  type="text"
                  value={photoForm.caption}
                  onChange={e => setPhotoForm(prev => ({ ...prev, caption: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">URL da Foto (ou Imagem da Câmera)</label>
                <input
                  type="text"
                  value={photoForm.photoUrl}
                  onChange={e => setPhotoForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                  className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
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
