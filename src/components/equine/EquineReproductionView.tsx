import React, { useState, useMemo } from 'react';
import { Heart, Plus, X, CheckCircle2 } from 'lucide-react';
import {
  EquineAnimal,
  EquineReproductionRecord,
  EquineReproductionType,
} from '../../types/equine';

interface Props {
  animals: EquineAnimal[];
  reproductionRecords: EquineReproductionRecord[];
  onAddReproduction: (record: EquineReproductionRecord) => void;
  onUpdateReproduction: (record: EquineReproductionRecord) => void;
  onNavigateTab: (tabId: string, animalId?: string) => void;
}

const inputCls =
  'w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const EquineReproductionView: React.FC<Props> = ({
  animals,
  reproductionRecords,
  onAddReproduction,
  onUpdateReproduction,
  onNavigateTab,
}) => {
  const safeAnimals = useMemo(() => (animals || []).filter(a => a && a.id), [animals]);
  const safeRecords = useMemo(() => (reproductionRecords || []).filter(r => r && r.id), [reproductionRecords]);

  const mares = useMemo(() => safeAnimals.filter(a => a.sex === 'Égua'), [safeAnimals]);
  const stallions = useMemo(() => safeAnimals.filter(a => a.sex === 'Garanhão'), [safeAnimals]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'gestantes' | 'ia_te' | 'semen'>('all');

  const [formData, setFormData] = useState<Partial<EquineReproductionRecord>>({
    femaleId: mares[0]?.id || '',
    maleId: stallions[0]?.id || '',
    type: 'Inseminação Artificial (IA) Sêmen Fresco',
    date: new Date().toISOString().split('T')[0],
    outcome: 'Aguardando DG',
    veterinarian: '',
    costBrl: 1200,
    semenMotilityPct: 80,
    semenConcentrationMillionMl: 150,
    notes: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const femaleId = formData.femaleId || mares[0]?.id;
    const maleId = formData.maleId || stallions[0]?.id;
    if (!femaleId || !maleId) return;

    const breedDate = new Date(formData.date || new Date());
    const foalingDate = new Date(breedDate);
    foalingDate.setDate(foalingDate.getDate() + 340);

    const newRecord: EquineReproductionRecord = {
      id: `rep-${Date.now()}`,
      femaleId,
      maleId,
      type: (formData.type as EquineReproductionType) || 'Inseminação Artificial (IA) Sêmen Fresco',
      date: formData.date || new Date().toISOString().split('T')[0],
      outcome: formData.outcome || 'Aguardando DG',
      veterinarian: formData.veterinarian?.trim() || 'Médico Veterinário Reprodução',
      costBrl: Number(formData.costBrl) || 0,
      semenMotilityPct: formData.semenMotilityPct ? Number(formData.semenMotilityPct) : undefined,
      semenConcentrationMillionMl: formData.semenConcentrationMillionMl
        ? Number(formData.semenConcentrationMillionMl)
        : undefined,
      expectedFoalingDate: foalingDate.toISOString().split('T')[0],
      notes: formData.notes || '',
    };

    onAddReproduction(newRecord);
    setIsModalOpen(false);
  };

  const filteredRecords = safeRecords.filter(r => {
    if (selectedTab === 'gestantes') return r.outcome === 'Gestante Confirmada';
    if (selectedTab === 'ia_te') return r.type.includes('Inseminação') || r.type.includes('Transferência');
    if (selectedTab === 'semen') return r.type.includes('Sêmen');
    return true;
  });

  const confirmedCount = safeRecords.filter(r => r.outcome === 'Gestante Confirmada').length;
  const evaluatedCount = safeRecords.filter(r => r.outcome !== 'Aguardando DG').length;
  const pregnancyRate =
    evaluatedCount > 0 ? `${Math.round((confirmedCount / evaluatedCount) * 100)}%` : '—';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Reprodução, Biotecnologias & Maternidade</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Coberturas, IA, transferência de embriões, diagnósticos de gestação (DG) e previsão de partos
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Cobertura / IA</span>
        </button>
      </div>

      {/* Hairline KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Matrizes & Doadoras</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              {mares.length}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Gestantes Confirmadas</span>
            <span className="mt-1 text-lg font-semibold text-rose-600 dark:text-rose-400 tabular-nums block">
              {confirmedCount}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Garanhões Ativos</span>
            <span className="mt-1 text-lg font-semibold text-slate-900 dark:text-zinc-100 tabular-nums block">
              {stallions.length}
            </span>
          </div>
          <div className="p-3.5">
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Taxa de Prenhez</span>
            <span className="mt-1 text-lg font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums block">
              {pregnancyRate}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `Todos (${safeRecords.length})` },
          { id: 'gestantes', label: `Gestantes (${confirmedCount})` },
          { id: 'ia_te', label: 'IA & TE' },
          { id: 'semen', label: 'Sêmen & Coletas' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
            className={`h-8 px-3 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              selectedTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Records List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhum evento reprodutivo encontrado para o filtro selecionado.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-zinc-800">
            {filteredRecords.map(record => {
              const female = safeAnimals.find(a => a.id === record.femaleId);
              const male = safeAnimals.find(a => a.id === record.maleId);

              return (
                <div key={record.id} className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Heart className="w-4 h-4 mt-0.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                          {record.type}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                          {new Date(record.date).toLocaleDateString('pt-BR')} · Vet: {record.veterinarian}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {record.outcome === 'Aguardando DG' && (
                        <>
                          <button
                            type="button"
                            onClick={() => onUpdateReproduction({ ...record, outcome: 'Gestante Confirmada' })}
                            className="h-7 px-2.5 rounded-md border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Confirmar DG</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateReproduction({ ...record, outcome: 'Vazia' })}
                            className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 text-[11px] text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            Vazia
                          </button>
                        </>
                      )}
                      <span
                        className={`text-xs font-medium ${
                          record.outcome === 'Gestante Confirmada'
                            ? 'text-rose-600 dark:text-rose-400'
                            : record.outcome === 'Parto Concluído'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {record.outcome}
                      </span>
                    </div>
                  </div>

                  <div className="pl-6.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Fêmea / Matriz</span>
                      {female ? (
                        <button
                          type="button"
                          onClick={() => onNavigateTab('digital_twin', female.id)}
                          className="font-medium text-slate-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-left truncate block"
                        >
                          {female.name}
                        </button>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Macho / Garanhão</span>
                      {male ? (
                        <button
                          type="button"
                          onClick={() => onNavigateTab('digital_twin', male.id)}
                          className="font-medium text-slate-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer text-left truncate block"
                        >
                          {male.name}
                        </button>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </div>

                    <div className="tabular-nums">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Previsão Parto (340d)</span>
                      <span className="font-medium text-slate-900 dark:text-zinc-100">
                        {record.expectedFoalingDate
                          ? new Date(record.expectedFoalingDate).toLocaleDateString('pt-BR')
                          : '—'}
                      </span>
                    </div>

                    <div className="tabular-nums">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Qualidade Sêmen</span>
                      <span className="font-medium text-slate-900 dark:text-zinc-100">
                        {record.semenMotilityPct ? `${record.semenMotilityPct}% mot.` : '—'}
                        {record.semenConcentrationMillionMl ? ` · ${record.semenConcentrationMillionMl} mi/mL` : ''}
                      </span>
                    </div>
                  </div>

                  {record.pregnancyDiagnoses && record.pregnancyDiagnoses.length > 0 && (
                    <div className="pl-6.5 pt-1 flex flex-wrap gap-3 text-[11px] text-slate-600 dark:text-zinc-400">
                      {record.pregnancyDiagnoses.map(dg => (
                        <span key={dg.id}>
                          DG {dg.daysPostBreeding}d: <strong className="text-emerald-700 dark:text-emerald-400">{dg.result}</strong>
                        </span>
                      ))}
                    </div>
                  )}

                  {record.notes && (
                    <div className="pl-6.5 text-xs text-slate-600 dark:text-zinc-400">
                      {record.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: New Reproduction Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-xl w-full">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Registrar Cobertura / IA / TE
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {mares.length === 0 || stallions.length === 0 ? (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                  Cadastre pelo menos uma Égua e um Garanhão no Plantel para registrar coberturas.
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Égua / Matriz *</label>
                  <select
                    value={formData.femaleId || mares[0]?.id || ''}
                    onChange={e => setFormData({ ...formData, femaleId: e.target.value })}
                    className={inputCls}
                  >
                    {mares.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.registrationNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Garanhão Reprodutor *</label>
                  <select
                    value={formData.maleId || stallions[0]?.id || ''}
                    onChange={e => setFormData({ ...formData, maleId: e.target.value })}
                    className={inputCls}
                  >
                    {stallions.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.registrationNumber})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Tipo de Procedimento</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as EquineReproductionType })}
                    className={inputCls}
                  >
                    <option value="Monta Natural">Monta Natural</option>
                    <option value="Inseminação Artificial (IA) Sêmen Fresco">IA - Sêmen Fresco</option>
                    <option value="Inseminação Artificial (IA) Sêmen Refrigerado">IA - Sêmen Refrigerado</option>
                    <option value="Inseminação Artificial (IA) Sêmen Congelado">IA - Sêmen Congelado</option>
                    <option value="Transferência de Embrião (TE)">Transferência de Embrião (TE)</option>
                    <option value="Coleta de Sêmen">Coleta de Sêmen</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Data do Procedimento</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Diagnóstico (DG)</label>
                  <select
                    value={formData.outcome}
                    onChange={e => setFormData({ ...formData, outcome: e.target.value as EquineReproductionRecord['outcome'] })}
                    className={inputCls}
                  >
                    <option value="Aguardando DG">Aguardando DG (14 dias)</option>
                    <option value="Gestante Confirmada">Gestante Confirmada</option>
                    <option value="Vazia">Vazia</option>
                    <option value="Parto Concluído">Parto Concluído</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Médico Veterinário</label>
                  <input
                    type="text"
                    value={formData.veterinarian || ''}
                    onChange={e => setFormData({ ...formData, veterinarian: e.target.value })}
                    placeholder="Nome / CRMV"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Observações Reprodutivas</label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ovulação, protocolo de sincronização, lavagem embrionária..."
                  className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={mares.length === 0 || stallions.length === 0}
                  className="h-8 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
