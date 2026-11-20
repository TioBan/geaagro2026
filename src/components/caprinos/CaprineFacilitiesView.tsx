import React, { useState } from 'react';
import { CaprineFacility, CaprineFacilityType } from '../../types/caprine';
import { Home, Plus, X } from 'lucide-react';

interface Props {
  facilities: CaprineFacility[];
  onSaveFacility: (facility: CaprineFacility) => void;
}

const FACILITY_TYPES: CaprineFacilityType[] = [
  'Aprisco Suspenso Ripado',
  'Maternidade',
  'Bezerreiro / Creche',
  'Sala de Ordenha',
  'Pedilúvio',
  'Esterqueira / Compostagem'
];

function getCapacity(fac: CaprineFacility): number {
  return Math.max(1, fac.capacityHead ?? fac.totalCapacity ?? 1);
}

function getSanitationDate(fac: CaprineFacility): string {
  return fac.lastSanitationDate || fac.lastCleaningDate || '--';
}

function getNotes(fac: CaprineFacility): string {
  return fac.notes || fac.maintenanceNotes || '';
}

export const CaprineFacilitiesView: React.FC<Props> = ({ facilities, onSaveFacility }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [newFacility, setNewFacility] = useState<Partial<CaprineFacility>>({});

  const totalCapacity = facilities.reduce((acc, f) => acc + getCapacity(f), 0);
  const totalOccupancy = facilities.reduce((acc, f) => acc + (f.currentOccupancy || 0), 0);
  const overallOccupancyPct =
    totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  const handleOpenModal = () => {
    setFormError('');
    setNewFacility({
      id: `fac-${Date.now()}`,
      name: '',
      type: 'Aprisco Suspenso Ripado',
      capacityHead: 100,
      currentOccupancy: 0,
      areaSqMeters: 150,
      sanitationStatus: 'Limpo & Desinfetado',
      lastSanitationDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacility.name?.trim()) {
      setFormError('Informe o nome da instalação.');
      return;
    }
    const cap = Math.max(1, newFacility.capacityHead ?? 100);
    const sanDate = newFacility.lastSanitationDate || new Date().toISOString().split('T')[0];

    onSaveFacility({
      id: newFacility.id || `fac-${Date.now()}`,
      name: newFacility.name.trim(),
      type: (newFacility.type as CaprineFacilityType) || 'Aprisco Suspenso Ripado',
      capacityHead: cap,
      totalCapacity: cap,
      currentOccupancy: newFacility.currentOccupancy ?? 0,
      areaSqMeters: newFacility.areaSqMeters ?? 0,
      sanitationStatus: newFacility.sanitationStatus || 'Limpo & Desinfetado',
      lastSanitationDate: sanDate,
      lastCleaningDate: sanDate,
      notes: newFacility.notes,
      maintenanceNotes: newFacility.notes
    });
    setIsModalOpen(false);
    setFormError('');
  };

  const inputCls =
    'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Apriscos, Instalações &amp; Biosseguridade
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Apriscos suspensos ripados, maternidades, sala de ordenha, pedilúvios e esterqueiras.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Instalação
        </button>
      </div>

      {/* Unified Hairline KPI Strip */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-zinc-800 overflow-hidden">
        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Estruturas Cadastradas
          </span>
          <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
            {facilities.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">Unidades operacionais</p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Lotação Consolidada
          </span>
          <div className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
            {totalOccupancy} / {totalCapacity}{' '}
            <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-400">cab.</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            Ocupação média: {overallOccupancyPct}%
          </p>
        </div>

        <div className="p-3.5">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">
            Higienização Pendente
          </span>
          <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-0.5">
            {facilities.filter(f => f.sanitationStatus !== 'Limpo & Desinfetado').length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Requerem limpeza ou manutenção
          </p>
        </div>
      </div>

      {/* Facilities Grid */}
      {facilities.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center text-xs text-slate-500 dark:text-zinc-400">
          Nenhuma instalação ou aprisco cadastrado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map(fac => {
            const cap = getCapacity(fac);
            const occupancyPct = Math.round(((fac.currentOccupancy || 0) / cap) * 100);
            const notes = getNotes(fac);
            const isClean = fac.sanitationStatus === 'Limpo & Desinfetado';
            return (
              <div
                key={fac.id}
                className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block truncate">
                      {fac.type}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate mt-0.5">
                      {fac.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[11px] font-medium shrink-0 ${
                      isClean
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {fac.sanitationStatus}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-zinc-400 tabular-nums">
                    <span>Lotação</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {fac.currentOccupancy || 0} / {cap} ({occupancyPct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        occupancyPct > 90 ? 'bg-amber-500' : 'bg-emerald-600 dark:bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, occupancyPct)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-xs tabular-nums">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      Área Total
                    </span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {fac.areaSqMeters || 0} m²
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      Higienização
                    </span>
                    <span className="font-medium font-mono text-slate-900 dark:text-zinc-100">
                      {getSanitationDate(fac)}
                    </span>
                  </div>
                </div>

                {notes && (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    {notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Facility Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Cadastrar Instalação Caprina
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3 text-xs">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Nome da Instalação *
                </label>
                <input
                  type="text"
                  required
                  value={newFacility.name || ''}
                  onChange={e => setNewFacility({ ...newFacility, name: e.target.value })}
                  className={inputCls}
                  placeholder="Ex: Aprisco Suspenso Matrizes 01"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Tipo de Estrutura *
                </label>
                <select
                  value={newFacility.type || 'Aprisco Suspenso Ripado'}
                  onChange={e =>
                    setNewFacility({ ...newFacility, type: e.target.value as CaprineFacilityType })
                  }
                  className={inputCls}
                >
                  {FACILITY_TYPES.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Capacidade
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newFacility.capacityHead ?? 100}
                    onChange={e =>
                      setNewFacility({
                        ...newFacility,
                        capacityHead: parseInt(e.target.value, 10) || 1
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Ocupação
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newFacility.currentOccupancy ?? 0}
                    onChange={e =>
                      setNewFacility({
                        ...newFacility,
                        currentOccupancy: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Área (m²)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newFacility.areaSqMeters ?? 150}
                    onChange={e =>
                      setNewFacility({
                        ...newFacility,
                        areaSqMeters: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Status Higienização
                  </label>
                  <select
                    value={newFacility.sanitationStatus || 'Limpo & Desinfetado'}
                    onChange={e =>
                      setNewFacility({ ...newFacility, sanitationStatus: e.target.value })
                    }
                    className={inputCls}
                  >
                    <option value="Limpo & Desinfetado">Limpo &amp; Desinfetado</option>
                    <option value="Necessita Higienização">Necessita Higienização</option>
                    <option value="Em Manutenção">Em Manutenção</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                    Última Limpeza
                  </label>
                  <input
                    type="date"
                    value={newFacility.lastSanitationDate || ''}
                    onChange={e =>
                      setNewFacility({ ...newFacility, lastSanitationDate: e.target.value })
                    }
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Observações de Manutenção
                </label>
                <input
                  type="text"
                  value={newFacility.notes || ''}
                  onChange={e => setNewFacility({ ...newFacility, notes: e.target.value })}
                  className={inputCls}
                  placeholder="Ex: Ripa revisada, pedilúvio recarregado"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Salvar Instalação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
