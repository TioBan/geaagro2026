// @ts-nocheck
import React, { useState } from 'react';
import { CaprineFacility } from '../../types/caprine';
import { Home, Plus, ShieldCheck, CheckCircle2, Clock, Wrench, X } from 'lucide-react';

interface Props {
  facilities: CaprineFacility[];
  onSaveFacility: (facility: CaprineFacility) => void;
}

export const CaprineFacilitiesView: React.FC<Props> = ({ facilities, onSaveFacility }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFacility, setNewFacility] = useState<Partial<CaprineFacility>>({
    id: `fac-${Date.now()}`,
    name: 'Novo Aprisco Ripado',
    type: 'Aprisco Suspenso Ripado',
    capacityHead: 100,
    currentOccupancy: 60,
    areaSqMeters: 150,
    sanitationStatus: 'Limpo & Desinfetado',
    lastSanitationDate: new Date().toISOString().split('T')[0]
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacility.name) {
      alert('Informe o nome da instalação.');
      return;
    }
    onSaveFacility(newFacility as CaprineFacility);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white flex items-center gap-2">
            <Home className="w-6 h-6 text-stone-700 dark:text-stone-300" />
            Apriscos, Instalações & Biosseguridade Caprina
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Gestão de apriscos suspensos ripados, maternidades, pedilúvios de desinfecção, cochos e esterqueiras.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-stone-900 dark:bg-emerald-600 hover:bg-stone-800 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Instalação
        </button>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facilities.map(fac => {
          const occupancyPct = Math.round((fac.currentOccupancy / fac.capacityHead) * 100);
          return (
            <div
              key={fac.id}
              className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-stone-200 dark:border-zinc-800 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase text-stone-500 bg-stone-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {fac.type}
                  </span>
                  <h3 className="font-extrabold text-base text-stone-900 dark:text-white mt-1">{fac.name}</h3>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
                  {fac.sanitationStatus}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-600 dark:text-stone-400 font-bold">
                  <span>Lotação:</span>
                  <span>{fac.currentOccupancy} / {fac.capacityHead} cabras ({occupancyPct}%)</span>
                </div>
                <div className="w-full h-2 bg-stone-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${occupancyPct > 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, occupancyPct)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-stone-200/60 dark:border-zinc-700/60">
                <div>
                  <span className="text-stone-400 block text-[10px]">Área Total:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{fac.areaSqMeters} m²</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px]">Última Higienização:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{fac.lastSanitationDate}</span>
                </div>
              </div>

              {fac.notes && (
                <p className="text-xs text-stone-500 italic pt-1 border-t border-stone-100 dark:border-zinc-800">
                  {fac.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Add Facility */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 dark:border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-stone-700 dark:text-stone-300" />
                Cadastrar Instalação Caprina
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Nome da Instalação *</label>
                <input
                  type="text"
                  required
                  value={newFacility.name || ''}
                  onChange={e => setNewFacility({ ...newFacility, name: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  placeholder="Ex: Aprisco Suspenso Matrizes 01"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Tipo de Estrutura *</label>
                <select
                  value={newFacility.type || 'Aprisco Suspenso Ripado'}
                  onChange={e => setNewFacility({ ...newFacility, type: e.target.value as any })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                >
                  <option value="Aprisco Suspenso Ripado">Aprisco Suspenso Ripado</option>
                  <option value="Maternidade">Maternidade / Baias Indiv.</option>
                  <option value="Bezerreiro / Creche">Bezerreiro / Creche Caprina</option>
                  <option value="Sala de Ordenha">Sala de Ordenha</option>
                  <option value="Pedilúvio">Pedilúvio Desinfetante</option>
                  <option value="Esterqueira / Compostagem">Esterqueira / Compostagem</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Capacidade (Cabras)</label>
                  <input
                    type="number"
                    value={newFacility.capacityHead || 100}
                    onChange={e => setNewFacility({ ...newFacility, capacityHead: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Área (m²)</label>
                  <input
                    type="number"
                    value={newFacility.areaSqMeters || 150}
                    onChange={e => setNewFacility({ ...newFacility, areaSqMeters: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Status de Higienização</label>
                <select
                  value={newFacility.sanitationStatus || 'Limpo & Desinfetado'}
                  onChange={e => setNewFacility({ ...newFacility, sanitationStatus: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                >
                  <option value="Limpo & Desinfetado">Limpo & Desinfetado</option>
                  <option value="Necessita Higienização">Necessita Higienização</option>
                  <option value="Em Manutenção">Em Manutenção</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 text-white dark:bg-emerald-600 rounded-xl font-bold"
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
