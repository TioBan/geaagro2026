import React, { useState } from 'react';
import { BuffaloPaddock } from '../../types/buffalo';
import { Sprout, Plus, Trash2, Edit2, X } from 'lucide-react';

interface BuffaloPasturesViewProps {
  paddocks: BuffaloPaddock[];
  onSavePaddock: (paddock: BuffaloPaddock) => void;
  onDeletePaddock: (paddockId: string) => void;
}

const inputCls =
  'w-full h-8 px-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-teal-500';
const labelCls = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const BuffaloPasturesView: React.FC<BuffaloPasturesViewProps> = ({
  paddocks,
  onSavePaddock,
  onDeletePaddock
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [areaHa, setAreaHa] = useState(12);
  const [forageSpecies, setForageSpecies] = useState('Brachiaria humidicola');
  const [currentHeight, setCurrentHeight] = useState(30);
  const [entryHeight, setEntryHeight] = useState(35);
  const [exitHeight, setExitHeight] = useState(15);
  const [stockingRate, setStockingRate] = useState(2.4);
  const [animalCount, setAnimalCount] = useState(25);
  const [status, setStatus] = useState<BuffaloPaddock['status']>('Ocupado');
  const [waterPointType, setWaterPointType] = useState<BuffaloPaddock['waterPointType']>('Açude Natural');
  const [shadeAreaPct, setShadeAreaPct] = useState(25);
  const [notes, setNotes] = useState('');

  const totalAreaHa = paddocks.reduce((acc, p) => acc + (p.areaHa || 0), 0);
  const totalAnimalsGrazing = paddocks.reduce((acc, p) => acc + (p.currentAnimalCount || 0), 0);
  const avgStockingRate =
    paddocks.length > 0
      ? paddocks.reduce((acc, p) => acc + (p.currentStockingRateUaHa || 0), 0) / paddocks.length
      : 0;
  const avgShade =
    paddocks.length > 0
      ? Math.round(paddocks.reduce((acc, p) => acc + (p.shadeAreaPct || 0), 0) / paddocks.length)
      : 0;

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setAreaHa(12);
    setForageSpecies('Brachiaria humidicola');
    setCurrentHeight(30);
    setEntryHeight(35);
    setExitHeight(15);
    setStockingRate(2.4);
    setAnimalCount(0);
    setStatus('Ocupado');
    setWaterPointType('Açude Natural');
    setShadeAreaPct(25);
    setNotes('');
    setShowModal(true);
  };

  const openEdit = (p: BuffaloPaddock) => {
    setEditingId(p.id);
    setName(p.name);
    setAreaHa(p.areaHa);
    setForageSpecies(p.forageSpecies);
    setCurrentHeight(p.currentCanopyHeightCm);
    setEntryHeight(p.entryCanopyHeightCm);
    setExitHeight(p.exitCanopyHeightCm);
    setStockingRate(p.currentStockingRateUaHa);
    setAnimalCount(p.currentAnimalCount);
    setStatus(p.status);
    setWaterPointType(p.waterPointType);
    setShadeAreaPct(p.shadeAreaPct);
    setNotes(p.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload: BuffaloPaddock = {
      id: editingId || `pad-${Date.now()}`,
      name: name.trim(),
      areaHa: Number(areaHa) || 1,
      forageSpecies: forageSpecies.trim() || 'Brachiaria humidicola',
      currentCanopyHeightCm: Number(currentHeight) || 0,
      entryCanopyHeightCm: Number(entryHeight) || 35,
      exitCanopyHeightCm: Number(exitHeight) || 15,
      forageMassKgMsPerHa: 4200,
      carryingCapacityAnimalUnits: Number(stockingRate) || 2,
      currentStockingRateUaHa: Number(stockingRate) || 0,
      currentAnimalCount: Number(animalCount) || 0,
      restDaysTarget: 28,
      currentRestDays: 0,
      occupationDaysTarget: 5,
      currentOccupationDays: 1,
      status,
      waterPointType,
      shadeAreaPct: Number(shadeAreaPct) || 0,
      soilFertilityScore: 'Boa',
      irrigation: false,
      notes: notes.trim() || undefined
    };
    onSavePaddock(payload);
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Faixa unificada de KPIs */}
      <section className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Área Total</span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {totalAreaHa.toFixed(1)} <span className="text-xs font-normal text-slate-500">ha</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
              {paddocks.length} piquetes
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Lotação Média</span>
            <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
              {avgStockingRate.toFixed(1)} <span className="text-xs font-normal text-slate-500">UA/ha</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Capacidade de suporte</span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Em Pastejo</span>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {totalAnimalsGrazing}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Cabeças alocadas</span>
          </div>

          <div className="p-3.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 block">Sombreamento Médio</span>
            <div className="text-xl font-semibold text-teal-600 dark:text-teal-400 tabular-nums mt-0.5">
              {avgShade}%
            </div>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">Árvores e sombrites</span>
          </div>
        </div>
      </section>

      {/* Cabeçalho + Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3.5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sprout className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Módulos de Pastejo Rotacionado</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Controle de altura de entrada/saída, lotação e acesso hídrico por piquete
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="h-8 px-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Piquete</span>
        </button>
      </div>

      {/* Grade de Piquetes */}
      {paddocks.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-10 text-center space-y-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-zinc-200">Nenhum piquete cadastrado</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            Cadastre os piquetes da fazenda para acompanhar altura de manejo, lotação e visualizar no Mapa Zootécnico.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {paddocks.map(paddock => (
            <article
              key={paddock.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-medium text-teal-600 dark:text-teal-400">{paddock.status}</span>
                    <span className="text-slate-300 dark:text-zinc-700">·</span>
                    <span className="text-slate-500 dark:text-zinc-400 tabular-nums">{paddock.areaHa} ha</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5">
                    {paddock.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{paddock.forageSpecies}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(paddock)}
                    title="Editar piquete"
                    className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 inline-flex items-center justify-center cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePaddock(paddock.id)}
                    title="Excluir piquete"
                    className="h-7 w-7 rounded-md border border-slate-200 dark:border-zinc-700 hover:border-rose-300 hover:text-rose-600 text-slate-500 dark:text-zinc-400 inline-flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <dl className="grid grid-cols-3 gap-2.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-xs tabular-nums">
                <div>
                  <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Altura atual</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">{paddock.currentCanopyHeightCm} cm</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Entrada / Saída</dt>
                  <dd className="font-medium text-slate-700 dark:text-zinc-300">
                    {paddock.entryCanopyHeightCm}/{paddock.exitCanopyHeightCm} cm
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Lotação</dt>
                  <dd className="font-semibold text-teal-600 dark:text-teal-400">
                    {paddock.currentStockingRateUaHa} UA/ha
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Animais</dt>
                  <dd className="font-medium text-slate-800 dark:text-zinc-200">{paddock.currentAnimalCount} cab.</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Água</dt>
                  <dd className="font-medium text-slate-800 dark:text-zinc-200 truncate">{paddock.waterPointType}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-500 dark:text-zinc-400">Sombra</dt>
                  <dd className="font-medium text-slate-800 dark:text-zinc-200">{paddock.shadeAreaPct}%</dd>
                </div>
              </dl>

              {paddock.notes && (
                <p className="text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  {paddock.notes}
                </p>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Modal Cadastro / Edição de Piquete */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 max-w-lg w-full my-8 space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {editingId ? 'Editar Piquete' : 'Novo Piquete'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Nome do Piquete *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Piquete 01 - Várzea Norte"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Área (ha)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={areaHa}
                    onChange={(e) => setAreaHa(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className={labelCls}>Forrageira</label>
                  <input
                    type="text"
                    value={forageSpecies}
                    onChange={(e) => setForageSpecies(e.target.value)}
                    placeholder="Ex: Brachiaria humidicola / Mombaça"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BuffaloPaddock['status'])}
                    className={inputCls}
                  >
                    <option value="Ocupado">Ocupado</option>
                    <option value="Em Descanso">Em Descanso</option>
                    <option value="Diferido">Diferido</option>
                    <option value="Adubado">Adubado</option>
                    <option value="Em Reforma">Em Reforma</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className={labelCls}>Altura Atual (cm)</label>
                  <input
                    type="number"
                    min="0"
                    value={currentHeight}
                    onChange={(e) => setCurrentHeight(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Entrada (cm)</label>
                  <input
                    type="number"
                    min="0"
                    value={entryHeight}
                    onChange={(e) => setEntryHeight(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Saída (cm)</label>
                  <input
                    type="number"
                    min="0"
                    value={exitHeight}
                    onChange={(e) => setExitHeight(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className={labelCls}>Lotação (UA/ha)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={stockingRate}
                    onChange={(e) => setStockingRate(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Nº Animais</label>
                  <input
                    type="number"
                    min="0"
                    value={animalCount}
                    onChange={(e) => setAnimalCount(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Sombra (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={shadeAreaPct}
                    onChange={(e) => setShadeAreaPct(Number(e.target.value))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Fonte Hídrica</label>
                <select
                  value={waterPointType}
                  onChange={(e) => setWaterPointType(e.target.value as BuffaloPaddock['waterPointType'])}
                  className={inputCls}
                >
                  <option value="Açude Natural">Açude Natural</option>
                  <option value="Lagoa de Banho">Lagoa de Banho</option>
                  <option value="Bebedouro Artificial">Bebedouro Artificial</option>
                  <option value="Brejo Controlado">Brejo Controlado</option>
                </select>
              </div>

              <div>
                <label className={labelCls}>Observações</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adubação, drenagem ou manejo do lote"
                  className={inputCls}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Piquete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
