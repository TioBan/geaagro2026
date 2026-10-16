import React, { useState } from 'react';
import { FinancialDiaryEntry, PropertyCropSeason } from '../../types/costs';
import { Plus, Calendar, Camera, CloudSun, AlertTriangle, DollarSign, Trash2, Check, X, ShieldAlert } from 'lucide-react';

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

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [weatherEvent, setWeatherEvent] = useState<any>('Sem Eventos');
  const [phytosanitaryEvent, setPhytosanitaryEvent] = useState('');
  const [costImpact, setCostImpact] = useState<number>(0);
  const [photoUrl, setPhotoUrl] = useState('');

  const seasonEntries = (diary || []).filter(d => d.seasonId === season.id);

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: FinancialDiaryEntry = {
      id: `diary-${Date.now()}`,
      seasonId: season.id,
      date: new Date().toISOString().split('T')[0],
      title,
      notes,
      weatherEvent,
      phytosanitaryEvent: phytosanitaryEvent || undefined,
      costImpact: Number(costImpact) > 0 ? Number(costImpact) : undefined,
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Linha do Tempo & Diário Financeiro da Safra
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Histórico cronológico de decisões de manejo, fotos de campo, ocorrências climáticas e custos extraordinários
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Registro no Diário
        </button>
      </div>

      {/* Linha do Tempo Vertical */}
      <div className="relative border-l-2 border-emerald-500/30 ml-4 pl-6 space-y-6">
        {seasonEntries.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400 italic">
            Nenhuma ocorrência registrada no diário para esta safra.
          </div>
        ) : (
          seasonEntries.map((entry) => (
            <div key={entry.id} className="relative bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-3">
              {/* Dot da timeline */}
              <div className="absolute -left-[31px] top-5 w-4 h-4 rounded-full bg-emerald-600 border-4 border-slate-100 dark:border-zinc-950" />

              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span>{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                    {entry.weatherEvent && entry.weatherEvent !== 'Sem Eventos' && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded text-[10px]">
                        🌧️ {entry.weatherEvent}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100 mt-1">{entry.title}</h4>
                </div>

                <button onClick={() => onDeleteDiaryEntry(entry.id)} className="text-slate-400 hover:text-rose-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">{entry.notes}</p>

              {entry.phytosanitaryEvent && (
                <div className="text-xs text-amber-800 dark:text-amber-300 font-medium bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900">
                  🐛 Ocorrência Fitossanitária: <strong>{entry.phytosanitaryEvent}</strong>
                </div>
              )}

              {entry.costImpact ? (
                <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Impacto Financeiro Adicional: R$ {entry.costImpact.toLocaleString('pt-BR')}
                </div>
              ) : null}

              {entry.photoUrl && (
                <img
                  src={entry.photoUrl}
                  alt={entry.title}
                  className="w-full max-h-48 object-cover rounded-xl border border-slate-200 dark:border-zinc-800"
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Novo Diário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 dark:border-zinc-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 mb-4">Adicionar Ocorrência no Diário</h3>
            <form onSubmit={handleCreateEntry} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Título do Evento</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Ex: Chuva intensa de 65mm / Início do florescimento"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Observações Agronômicas & Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Evento Climático</label>
                  <select
                    value={weatherEvent}
                    onChange={(e) => setWeatherEvent(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  >
                    <option value="Sem Eventos">Sem Eventos Extremor</option>
                    <option value="Chuva Forte">Chuva Forte / Volume Elevado</option>
                    <option value="Estiagem">Estiagem / Seca</option>
                    <option value="Geada">Geada</option>
                    <option value="Granizo">Granizo</option>
                    <option value="Vento Forte">Vento Forte</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">Impacto Financeiro (R$)</label>
                  <input
                    type="number"
                    value={costImpact}
                    onChange={(e) => setCostImpact(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold">Salvar no Diário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
