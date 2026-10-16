import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  Building2,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  Boxes,
  Trash2,
  X,
  Printer,
  ChevronRight,
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
  property,
  lots,
  pallets,
  expeditions,
  onSaveExpedition,
  onDeleteExpedition,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpedition, setSelectedExpedition] = useState<TraceabilityExpedition | null>(null);

  // Form State
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
    selectedLots: string[];
    notes: string;
  }>({
    expeditionCode: `EXP-${new Date().getFullYear()}-00${expeditions.length + 1}`,
    date: new Date().toISOString().split('T')[0],
    customerName: 'Rede de Supermercados Pão de Açúcar SP',
    customerDocument: '47.508.411/0001-56',
    destinationCity: 'São Paulo',
    destinationState: 'SP',
    transportCompanyName: 'LogFrio Transportes Refrigerados Ltda',
    vehiclePlate: 'BRA-2E19',
    driverName: 'Marcos Vinicius Ribeiro',
    driverDocument: '349.882.108-99',
    truckTemperatureCelsius: 11.5,
    nfeNumber: 'NF-e 004829',
    totalPallets: 4,
    totalBoxes: 200,
    totalNetWeightKg: 4000.0,
    selectedLots: [lots[0]?.lotCode || ''],
    notes: 'Carga conferida, pallets lacrados, temperatura de baú conforme POP.',
  });

  const filteredExpeditions = (expeditions || []).filter(exp => {
    if (!exp) return false;
    const query = (searchTerm || '').toLowerCase();
    if (!query) return true;
    return (
      (exp.customerName || '').toLowerCase().includes(query) ||
      (exp.expeditionCode || '').toLowerCase().includes(query) ||
      (exp.destinationCity || '').toLowerCase().includes(query) ||
      (exp.nfeNumber || '').toLowerCase().includes(query)
    );
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newExp: TraceabilityExpedition = {
      id: `exp-${Date.now()}`,
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
      lotsContained: formData.selectedLots.map(code => {
        const found = lots.find(l => l.lotCode === code);
        return {
          lotId: found?.id || 'lot-01',
          lotCode: code,
          cropName: found?.cropName || 'Tomate',
          boxesCount: 100,
          netWeightKg: 2000,
        };
      }),
      palletsContained: pallets.slice(0, formData.totalPallets).map(p => p.palletCode),
      status: 'em_transito',
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    onSaveExpedition(newExp);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              Expedição, Romaneio de Carga & Rastreabilidade Reversa
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Vínculo direto de notas fiscais (NF-e), pallets, lotes, caminhões e clientes conforme a INC 02/2018
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nova Expedição / Romaneio
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, romaneio, NF-e, cidade destino..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Expeditions List */}
      <div className="space-y-4">
        {filteredExpeditions.map(exp => (
          <div
            key={exp.id}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-black text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    {exp.expeditionCode}
                  </span>
                  <span className="text-xs font-bold text-slate-600 dark:text-zinc-300">
                    {new Date(exp.date).toLocaleDateString('pt-BR')}
                  </span>
                  {exp.nfeNumber && (
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      {exp.nfeNumber}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 capitalize">
                    {exp.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {exp.customerName}
                </h4>
                <p className="text-xs text-slate-500">
                  Destino: <strong>{exp.destinationCity}/{exp.destinationState}</strong> • CNPJ/CPF: {exp.customerDocument}
                </p>
              </div>

              {/* Volume & Weight */}
              <div className="text-right flex sm:flex-col justify-between items-end gap-1 w-full sm:w-auto">
                <p className="text-base font-bold text-slate-900 dark:text-white">
                  {exp.totalBoxes.toLocaleString('pt-BR')} <span className="text-xs font-normal text-slate-400">caixas</span>
                </p>
                <span className="text-xs font-semibold text-emerald-600">
                  {(exp.totalNetWeightKg / 1000).toFixed(1)} toneladas ({exp.totalPallets} pallets)
                </span>
              </div>
            </div>

            {/* Transport & Lots Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1.5 text-slate-600 dark:text-zinc-300">
                <span className="font-bold text-slate-800 dark:text-zinc-200 block text-xs uppercase">
                  Transporte & Cadeia de Frio
                </span>
                <p>Transportadora: <strong>{exp.transportCompanyName}</strong> (Placa {exp.vehiclePlate})</p>
                <p>Motorista: {exp.driverName} (Doc: {exp.driverDocument})</p>
                <p className="flex items-center gap-1.5 text-blue-600 font-semibold">
                  <Thermometer className="w-3.5 h-3.5" />
                  Temperatura no Embarque: {exp.truckTemperatureCelsius} °C
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-1.5 text-slate-600 dark:text-zinc-300">
                <span className="font-bold text-slate-800 dark:text-zinc-200 block text-xs uppercase">
                  Lotes e Pallets Vinculados
                </span>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {exp.lotsContained.map((lot, idx) => (
                    <span key={idx} className="font-mono text-[11px] font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-400">
                      {lot.lotCode} ({lot.boxesCount} cx)
                    </span>
                  ))}
                </div>
                {exp.notes && (
                  <p className="text-[11px] text-slate-400 pt-1 italic">{exp.notes}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                Auditável para Recall & Rastreabilidade de Ponta a Ponta
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Romaneio
                </button>
                <button
                  onClick={() => {
                    if (confirm('Deseja excluir este romaneio?')) {
                      onDeleteExpedition(exp.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova Expedição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                Criar Romaneio de Expedição
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Código do Romaneio *</label>
                  <input
                    type="text"
                    value={formData.expeditionCode}
                    onChange={e => setFormData(prev => ({ ...prev, expeditionCode: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Data de Saída *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Cliente / Destinatário *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Ex: Pão de Açúcar, CEAGESP, Hortifruti"
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">CNPJ / CPF do Cliente</label>
                  <input
                    type="text"
                    value={formData.customerDocument}
                    onChange={e => setFormData(prev => ({ ...prev, customerDocument: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Cidade Destino</label>
                  <input
                    type="text"
                    value={formData.destinationCity}
                    onChange={e => setFormData(prev => ({ ...prev, destinationCity: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">UF</label>
                  <input
                    type="text"
                    value={formData.destinationState}
                    onChange={e => setFormData(prev => ({ ...prev, destinationState: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Número da NF-e</label>
                  <input
                    type="text"
                    value={formData.nfeNumber}
                    onChange={e => setFormData(prev => ({ ...prev, nfeNumber: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-800/60 rounded-xl space-y-3">
                <span className="font-bold text-slate-800 dark:text-zinc-200 block">Transporte & Veículo</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600 dark:text-zinc-400">Transportadora</label>
                    <input
                      type="text"
                      value={formData.transportCompanyName}
                      onChange={e => setFormData(prev => ({ ...prev, transportCompanyName: e.target.value }))}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600 dark:text-zinc-400">Placa</label>
                    <input
                      type="text"
                      value={formData.vehiclePlate}
                      onChange={e => setFormData(prev => ({ ...prev, vehiclePlate: e.target.value }))}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-slate-600 dark:text-zinc-400">Temp. Baú (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.truckTemperatureCelsius}
                      onChange={e => setFormData(prev => ({ ...prev, truckTemperatureCelsius: Number(e.target.value) }))}
                      className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Total Pallets</label>
                  <input
                    type="number"
                    value={formData.totalPallets}
                    onChange={e => setFormData(prev => ({ ...prev, totalPallets: Number(e.target.value) }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Total Caixas</label>
                  <input
                    type="number"
                    value={formData.totalBoxes}
                    onChange={e => setFormData(prev => ({ ...prev, totalBoxes: Number(e.target.value) }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Peso Total (kg)</label>
                  <input
                    type="number"
                    value={formData.totalNetWeightKg}
                    onChange={e => setFormData(prev => ({ ...prev, totalNetWeightKg: Number(e.target.value) }))}
                    className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
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
