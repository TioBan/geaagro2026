import React, { useState, useEffect } from 'react';
import { FinancialDiaryEntry, PropertyCropSeason } from '../../types/costs';
import { formatCostDate } from '../../utils/costStorage';
import { AlertTriangle, Calendar, Camera, CloudSun, Plus, Trash2, X } from 'lucide-react';

interface TimelineAndDiaryViewProps {
  diary: FinancialDiaryEntry[];
  season: PropertyCropSeason;
  onAddDiaryEntry: (entry: FinancialDiaryEntry) => void;
  onDeleteDiaryEntry: (id: string) => void;
}

export const TimelineAndDiaryView: React.FC<TimelineAndDiaryViewProps> = ({
  diary,
  season,
  onAddDiaryEntry,
  onDeleteDiaryEntry,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [weatherEvent, setWeatherEvent] = useState<NonNullable<FinancialDiaryEntry['weatherEvent']>>('Sem Eventos');
  const [phytosanitaryEvent, setPhytosanitaryEvent] = useState('');
  const [costImpact, setCostImpact] = useState<number | ''>(0);
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  const seasonEntries = (diary || []).filter((d) => d.seasonId === season.id);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = Number(costImpact) || 0;
    const newEntry: FinancialDiaryEntry = {
      id: `diary-${Date.now()}`,
      seasonId: season.id,
      date: new Date().toISOString().split('T')[0],
      title,
      notes,
      weatherEvent,
      phytosanitaryEvent: phytosanitaryEvent.trim() || undefined,
      costImpact: costNum > 0 ? costNum : undefined,
      photoUrl: photoUrl || undefined,
    };

    onAddDiaryEntry(newEntry);
    setIsModalOpen(false);
    setTitle('');
    setNotes('');
    setWeatherEvent('Sem Eventos');
    setPhytosanitaryEvent('');
    setCostImpact(0);
    setPhotoUrl('');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Linha do Tempo &amp; Diário Financeiro
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Registro cronológico de decisões de manejo, ocorrências climáticas, fotos e custos extraordinários.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Registro
        </button>
      </div>

      {/* Vertical Timeline */}
      <div className="relative border-l border-slate-200 dark:border-zinc-800 ml-3 pl-5 space-y-4">
        {seasonEntries.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-center text-xs text-slate-400 dark:text-zinc-500">
            Nenhuma ocorrência registrada no diário para esta safra.
          </div>
        ) : (
          seasonEntries.map((entry) => (
            <div
              key={entry.id}
              className="relative bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-2.5"
            >
              <div className="absolute -left-[25px] top-5 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white dark:ring-zinc-950" />

              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                    <span>{formatCostDate(entry.date)}</span>
                    {entry.weatherEvent && entry.weatherEvent !== 'Sem Eventos' && (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                        <CloudSun className="w-3.5 h-3.5" />
                        {entry.weatherEvent}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5">{entry.title}</h4>
                </div>

                {confirmDeleteId === entry.id ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteDiaryEntry(entry.id);
                        setConfirmDeleteId(null);
                      }}
                      className="h-7 px-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium"
                    >
                      Excluir
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="h-7 px-2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[11px]"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(entry.id)}
                    aria-label="Excluir registro"
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{entry.notes}</p>

              {entry.phytosanitaryEvent && (
                <div className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/20 px-3 py-2 rounded-lg border border-amber-200/70 dark:border-amber-900/50 inline-flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    Ocorrência fitossanitária: <strong>{entry.phytosanitaryEvent}</strong>
                  </span>
                </div>
              )}

              {entry.costImpact ? (
                <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                  Impacto Financeiro Adicional: R$ {entry.costImpact.toLocaleString('pt-BR')}
                </div>
              ) : null}

              {entry.photoUrl && (
                <img
                  src={entry.photoUrl}
                  alt={entry.title}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-48 object-cover rounded-lg border border-slate-200 dark:border-zinc-800"
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Novo Diário */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-lg w-full p-5 border border-slate-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100">
                Adicionar Ocorrência no Diário
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar modal"
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Título do Evento</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Ex: Chuva intensa de 65mm / Início do florescimento"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Observações Agronômicas &amp; Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">Evento Climático</label>
                  <select
                    value={weatherEvent}
                    onChange={(e) =>
                      setWeatherEvent(e.target.value as NonNullable<FinancialDiaryEntry['weatherEvent']>)
                    }
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                  >
                    <option value="Sem Eventos">Sem Eventos Extremos</option>
                    <option value="Chuva Forte">Chuva Forte / Volume Elevado</option>
                    <option value="Estiagem">Estiagem / Seca</option>
                    <option value="Geada">Geada</option>
                    <option value="Granizo">Granizo</option>
                    <option value="Onda de Calor">Onda de Calor</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                    Impacto Financeiro (R$)
                  </label>
                  <input
                    type="number"
                    value={costImpact}
                    onChange={(e) => setCostImpact(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 tabular-nums outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Ocorrência Fitossanitária (Opcional)
                </label>
                <input
                  type="text"
                  value={phytosanitaryEvent}
                  onChange={(e) => setPhytosanitaryEvent(e.target.value)}
                  placeholder="Ex: Percevejo-marrom ou Ferrugem asiática"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-medium text-slate-700 dark:text-zinc-300 block mb-1">
                  Foto de Campo (Opcional)
                </label>
                <label className="h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-slate-700 dark:text-zinc-300 inline-flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                  <Camera className="w-3.5 h-3.5 text-slate-400" />
                  <span>{photoUrl ? 'Alterar Foto Selecionada' : 'Anexar Imagem'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                {photoUrl && (
                  <img
                    src={photoUrl}
                    alt="Prévia do registro"
                    referrerPolicy="no-referrer"
                    className="mt-2 w-full max-h-32 object-cover rounded-lg border border-slate-200 dark:border-zinc-800"
                  />
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Salvar no Diário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
