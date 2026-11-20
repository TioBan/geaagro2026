import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Thermometer,
  Trash2,
  X,
  Printer,
} from 'lucide-react';
import {
  TraceabilityExpedition,
  TraceabilityLot,
  TraceabilityPallet,
  TraceabilityProperty,
} from '../../types/traceability';

interface ExpeditionManagerProps {
  property: TraceabilityProperty;
  lots: TraceabilityLot[];
  pallets: TraceabilityPallet[];
  expeditions: TraceabilityExpedition[];
  onSaveExpedition: (expedition: TraceabilityExpedition) => void;
  onDeleteExpedition: (id: string) => void;
}

export const TraceabilityExpeditionManager: React.FC<ExpeditionManagerProps> = ({
  lots,
  pallets,
  expeditions,
  onSaveExpedition,
  onDeleteExpedition,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    expeditionCode: string;
    date: string;
    customerName: string;
    customerDocument: string;
    destinationCity: string;
    destinationState: string;
    transportCompanyName: string;
    vehiclePlate: string;
    driverName: string;
    driverDocument: string;
    truckTemperatureCelsius: number;
    nfeNumber: string;
    totalPallets: number;
    totalBoxes: number;
    totalNetWeightKg: number;
    selectedLotCode: string;
    notes: string;
  }>({
    expeditionCode: `ROM-${new Date().getFullYear()}-${String(expeditions.length + 1).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerDocument: '',
    destinationCity: '',
    destinationState: '',
    transportCompanyName: '',
    vehiclePlate: '',
    driverName: '',
    driverDocument: '',
    truckTemperatureCelsius: 11.5,
    nfeNumber: '',
    totalPallets: 1,
    totalBoxes: 100,
    totalNetWeightKg: 2000,
    selectedLotCode: lots[0]?.lotCode || '',
    notes: '',
  });

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const filteredExpeditions = (expeditions || []).filter(exp => {
    if (!exp) return false;
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return (
      (exp.customerName || '').toLowerCase().includes(query) ||
      (exp.expeditionCode || '').toLowerCase().includes(query) ||
      (exp.destinationCity || '').toLowerCase().includes(query) ||
      (exp.nfeNumber || '').toLowerCase().includes(query)
    );
  });

  const handleOpenModal = () => {
    setFormData(prev => ({
      ...prev,
      expeditionCode: `ROM-${new Date().getFullYear()}-${String(expeditions.length + 1).padStart(3, '0')}`,
      selectedLotCode: prev.selectedLotCode || lots[0]?.lotCode || '',
    }));
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedLot = lots.find(l => l.lotCode === formData.selectedLotCode) || lots[0];

    const newExp: TraceabilityExpedition = {
      id: `expedicao-${Date.now()}`,
      expeditionCode: formData.expeditionCode,
      date: formData.date,
      customerName: formData.customerName,
      customerDocument: formData.customerDocument,
      destinationCity: formData.destinationCity,
      destinationState: formData.destinationState,
      transportCompanyName: formData.transportCompanyName,
      vehiclePlate: formData.vehiclePlate,
      driverName: formData.driverName,
      driverDocument: formData.driverDocument,
      truckTemperatureCelsius: Number(formData.truckTemperatureCelsius),
      nfeNumber: formData.nfeNumber,
      totalPallets: Number(formData.totalPallets),
      totalBoxes: Number(formData.totalBoxes),
      totalNetWeightKg: Number(formData.totalNetWeightKg),
      lotsContained: matchedLot
        ? [
            {
              lotId: matchedLot.id,
              lotCode: matchedLot.lotCode,
              cropName: matchedLot.cropName,
              boxesCount: Number(formData.totalBoxes),
              netWeightKg: Number(formData.totalNetWeightKg),
            },
          ]
        : [],
      palletsContained: pallets.slice(0, formData.totalPallets).map(p => p.palletCode),
      status: 'em_transito',
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    onSaveExpedition(newExp);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Expedição, Romaneio de Carga & Rastreabilidade Reversa
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Vínculo direto de notas fiscais (NF-e), pallets, lotes, veículos e clientes conforme a INC 02/2018
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Expedição / Romaneio
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por cliente, romaneio, NF-e ou cidade destino..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Expeditions List */}
      {filteredExpeditions.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-10 text-center space-y-3">
          <Truck className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Nenhuma expedição ou romaneio registrado
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Crie um romaneio de expedição para rastrear cargas, NF-e e temperatura do transporte.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenModal}
            className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Criar Primeiro Romaneio
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpeditions.map(exp => {
            const isConfirming = confirmingDeleteId === exp.id;
            const boxes = exp.totalBoxes || 0;
            const netWeight = exp.totalNetWeightKg || exp.totalWeightKg || 0;
            const palletsCount = exp.totalPallets || 0;
            const contained = exp.lotsContained || [];

            return (
              <div
                key={exp.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-zinc-800">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-semibold text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-200/80 dark:border-indigo-800/60">
                        {exp.expeditionCode}
                      </span>
                      <span className="text-xs font-medium text-slate-600 dark:text-zinc-300 tabular-nums">
                        {new Date(exp.date).toLocaleDateString('pt-BR')}
                      </span>
                      {exp.nfeNumber && (
                        <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 text-slate-700 dark:text-zinc-300">
                          {exp.nfeNumber}
                        </span>
                      )}
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 capitalize">
                        {(exp.status || 'em_transito').replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{exp.customerName}</h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Destino:{' '}
                      <strong className="text-slate-700 dark:text-zinc-200">
                        {exp.destinationCity || '--'}/{exp.destinationState || '--'}
                      </strong>
                      {exp.customerDocument && ` • Doc.: ${exp.customerDocument}`}
                    </p>
                  </div>

                  <div className="w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end gap-0.5 tabular-nums shrink-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      {boxes.toLocaleString('pt-BR')}{' '}
                      <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">caixas</span>
                    </p>
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      {(netWeight / 1000).toFixed(1)} t ({palletsCount} pallets)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg space-y-1 text-slate-600 dark:text-zinc-300">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 block text-[11px] uppercase tracking-wider">
                      Transporte & Cadeia de Frio
                    </span>
                    <p>
                      Transportadora:{' '}
                      <strong className="text-slate-900 dark:text-zinc-100">{exp.transportCompanyName || '--'}</strong>
                      {exp.vehiclePlate ? ` (Placa ${exp.vehiclePlate})` : ''}
                    </p>
                    {exp.driverName && (
                      <p>
                        Motorista: {exp.driverName} {exp.driverDocument ? `(${exp.driverDocument})` : ''}
                      </p>
                    )}
                    <p className="inline-flex items-center gap-1.5 text-sky-700 dark:text-sky-400 font-medium tabular-nums">
                      <Thermometer className="w-3.5 h-3.5" />
                      Temperatura no Embarque: {exp.truckTemperatureCelsius ?? '--'} °C
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg space-y-1.5 text-slate-600 dark:text-zinc-300">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 block text-[11px] uppercase tracking-wider">
                      Lotes e Pallets Vinculados
                    </span>
                    {contained.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {contained.map((lot, idx) => (
                          <span
                            key={idx}
                            className="font-mono text-[11px] font-semibold bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-700 px-2 py-0.5 rounded-md text-emerald-700 dark:text-emerald-400 tabular-nums"
                          >
                            {lot.lotCode} ({lot.boxesCount} cx)
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500">Sem lote específico vinculado</p>
                    )}
                    {exp.notes && <p className="text-[11px] text-slate-500 dark:text-zinc-400 pt-0.5">{exp.notes}</p>}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                    Auditável para recall e rastreabilidade ponta a ponta
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="h-8 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimir Romaneio
                    </button>

                    {isConfirming ? (
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteExpedition(exp.id);
                            setConfirmingDeleteId(null);
                          }}
                          className="h-8 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                        >
                          Excluir
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingDeleteId(null)}
                          className="h-8 px-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-lg text-xs font-medium cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingDeleteId(exp.id)}
                        className="h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Excluir Romaneio"
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

      {/* Modal Nova Expedição */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 my-6 text-xs"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Criar Romaneio de Expedição
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Código do Romaneio *</label>
                  <input
                    type="text"
                    value={formData.expeditionCode}
                    onChange={e => setFormData(prev => ({ ...prev, expeditionCode: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs font-mono font-semibold text-slate-900 dark:text-zinc-100"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Data de Saída *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Lote Vinculado</label>
                  <select
                    value={formData.selectedLotCode}
                    onChange={e => setFormData(prev => ({ ...prev, selectedLotCode: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  >
                    {lots.length === 0 ? (
                      <option value="">Sem lote cadastrado</option>
                    ) : (
                      lots.map(l => (
                        <option key={l.id} value={l.lotCode}>
                          {l.lotCode} - {l.cropName}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Cliente / Destinatário *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Ex: Rede de Supermercados, CEAGESP"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">CNPJ / CPF do Cliente</label>
                  <input
                    type="text"
                    value={formData.customerDocument}
                    onChange={e => setFormData(prev => ({ ...prev, customerDocument: e.target.value }))}
                    placeholder="00.000.000/0001-00"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Cidade Destino</label>
                  <input
                    type="text"
                    value={formData.destinationCity}
                    onChange={e => setFormData(prev => ({ ...prev, destinationCity: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.destinationState}
                    onChange={e => setFormData(prev => ({ ...prev, destinationState: e.target.value.toUpperCase() }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs uppercase text-slate-900 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Número da NF-e</label>
                  <input
                    type="text"
                    value={formData.nfeNumber}
                    onChange={e => setFormData(prev => ({ ...prev, nfeNumber: e.target.value }))}
                    placeholder="NF-e 000001"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs font-mono text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg space-y-2.5">
                <span className="font-semibold text-slate-800 dark:text-zinc-200 block">Transporte & Veículo</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Transportadora</label>
                    <input
                      type="text"
                      value={formData.transportCompanyName}
                      onChange={e => setFormData(prev => ({ ...prev, transportCompanyName: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Placa</label>
                    <input
                      type="text"
                      value={formData.vehiclePlate}
                      onChange={e => setFormData(prev => ({ ...prev, vehiclePlate: e.target.value.toUpperCase() }))}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs uppercase text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Temp. Baú (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.truckTemperatureCelsius}
                      onChange={e => setFormData(prev => ({ ...prev, truckTemperatureCelsius: Number(e.target.value) }))}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Total Pallets</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.totalPallets}
                    onChange={e => setFormData(prev => ({ ...prev, totalPallets: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Total Caixas</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.totalBoxes}
                    onChange={e => setFormData(prev => ({ ...prev, totalBoxes: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Peso Total (kg)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.totalNetWeightKg}
                    onChange={e => setFormData(prev => ({ ...prev, totalNetWeightKg: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs font-semibold text-slate-900 dark:text-zinc-100 tabular-nums"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-3.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Salvar Expedição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
