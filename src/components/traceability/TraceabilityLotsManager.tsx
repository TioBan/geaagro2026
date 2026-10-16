import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  QrCode,
  Sparkles,
  Calendar,
  MapPin,
  Leaf,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Activity,
  Layers,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  Clock,
  Printer,
  X,
  FileText,
  Thermometer,
  Droplets,
  Tractor,
} from 'lucide-react';
import QRCodeSVG from 'qrcode';
import {
  TraceabilityLot,
  TraceabilityPlot,
  TraceabilityCrop,
  TraceabilityOperation,
  TraceabilityHarvestItem,
  TraceabilityPestMonitoring,
  LotStatus,
} from '../../types/traceability';
import { generateGeaAgroLotCode } from '../../data/traceabilityData';

interface LotsManagerProps {
  lots: TraceabilityLot[];
  plots: TraceabilityPlot[];
  crops: TraceabilityCrop[];
  operations: TraceabilityOperation[];
  harvests: TraceabilityHarvestItem[];
  monitoring: TraceabilityPestMonitoring[];
  selectedLot: TraceabilityLot | null;
  onSelectLot: (lot: TraceabilityLot | null) => void;
  onSaveLot: (lot: TraceabilityLot) => void;
  onDeleteLot: (lotId: string) => void;
  onOpenPassport: (lot: TraceabilityLot) => void;
  onOpenLabels: (lot: TraceabilityLot) => void;
}

export const TraceabilityLotsManager: React.FC<LotsManagerProps> = ({
  lots,
  plots,
  crops,
  operations,
  harvests,
  monitoring,
  selectedLot,
  onSelectLot,
  onSaveLot,
  onDeleteLot,
  onOpenPassport,
  onOpenLabels,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<TraceabilityLot | null>(null);

  // Form State for new/editing lot
  const [formData, setFormData] = useState<{
    cropName: string;
    cultivarName: string;
    plotId: string;
    seasonYear: number;
    sowingDate: string;
    nurseryTransplantDate: string;
    estimatedHarvestStartDate: string;
    estimatedHarvestEndDate: string;
    seedSupplier: string;
    seedLotNumber: string;
    nurserySupplier: string;
    plantedAreaHa: number;
    plantsCount: number;
    spacingBetweenRowsMeters: number;
    spacingBetweenPlantsMeters: number;
    estimatedYieldKg: number;
    status: LotStatus;
    notes: string;
  }>({
    cropName: 'Tomate',
    cultivarName: 'Sweet Grape F1',
    plotId: plots[0]?.id || '',
    seasonYear: new Date().getFullYear(),
    sowingDate: new Date().toISOString().split('T')[0],
    nurseryTransplantDate: '',
    estimatedHarvestStartDate: '',
    estimatedHarvestEndDate: '',
    seedSupplier: 'Sakata Seed Sudamerica',
    seedLotNumber: 'LOTE-2027-01',
    nurserySupplier: '',
    plantedAreaHa: 1.0,
    plantsCount: 20000,
    spacingBetweenRowsMeters: 1.2,
    spacingBetweenPlantsMeters: 0.4,
    estimatedYieldKg: 60000,
    status: 'desenvolvimento',
    notes: '',
  });

  // Filtered Lots
  const filteredLots = useMemo(() => {
    return (lots || []).filter(lot => {
      if (!lot) return false;
      const query = (searchTerm || '').toLowerCase();
      const matchSearch =
        !query ||
        (lot.lotCode || '').toLowerCase().includes(query) ||
        (lot.cropName || '').toLowerCase().includes(query) ||
        (lot.cultivarName || '').toLowerCase().includes(query) ||
        (lot.plotCode || '').toLowerCase().includes(query);
      
      const matchStatus = statusFilter === 'all' || lot.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [lots, searchTerm, statusFilter]);

  const handleOpenCreateModal = () => {
    const selectedPlot = plots[0];
    setFormData({
      cropName: selectedPlot?.currentCrop || 'Tomate',
      cultivarName: selectedPlot?.currentCultivar || 'Sweet Grape F1',
      plotId: selectedPlot?.id || '',
      seasonYear: new Date().getFullYear(),
      sowingDate: new Date().toISOString().split('T')[0],
      nurseryTransplantDate: '',
      estimatedHarvestStartDate: '',
      estimatedHarvestEndDate: '',
      seedSupplier: 'Sakata Seed Sudamerica',
      seedLotNumber: `SKT-${new Date().getFullYear()}-001`,
      nurserySupplier: 'Viveiro Mudas Premium',
      plantedAreaHa: selectedPlot?.areaHa || 1.0,
      plantsCount: 20000,
      spacingBetweenRowsMeters: 1.2,
      spacingBetweenPlantsMeters: 0.4,
      estimatedYieldKg: 60000,
      status: 'semeadura',
      notes: '',
    });
    setEditingLot(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lot: TraceabilityLot) => {
    setFormData({
      cropName: lot.cropName,
      cultivarName: lot.cultivarName,
      plotId: lot.plotId,
      seasonYear: lot.seasonYear,
      sowingDate: lot.sowingDate,
      nurseryTransplantDate: lot.nurseryTransplantDate || '',
      estimatedHarvestStartDate: lot.estimatedHarvestStartDate || '',
      estimatedHarvestEndDate: lot.estimatedHarvestEndDate || '',
      seedSupplier: lot.seedSupplier,
      seedLotNumber: lot.seedLotNumber,
      nurserySupplier: lot.nurserySupplier || '',
      plantedAreaHa: lot.plantedAreaHa,
      plantsCount: lot.plantsCount,
      spacingBetweenRowsMeters: lot.spacingBetweenRowsMeters,
      spacingBetweenPlantsMeters: lot.spacingBetweenPlantsMeters,
      estimatedYieldKg: lot.estimatedYieldKg,
      status: lot.status,
      notes: lot.notes || '',
    });
    setEditingLot(lot);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPlot = plots.find(p => p.id === formData.plotId) || plots[0];
    const cropObj = crops.find(c => c.name.toLowerCase() === formData.cropName.toLowerCase());
    
    const seq = editingLot ? editingLot.sequentialNumber : lots.length + 1;
    const generatedCode = editingLot
      ? editingLot.lotCode
      : generateGeaAgroLotCode(formData.cropName, formData.seasonYear, selectedPlot?.code || 'T01', seq);

    const boxWeight = cropObj?.boxWeightKg || 20;
    const estBoxes = Math.round(formData.estimatedYieldKg / boxWeight);

    const newLot: TraceabilityLot = {
      id: editingLot ? editingLot.id : `lot-${Date.now()}`,
      lotCode: generatedCode,
      farmId: selectedPlot?.farmId || 'prop-01',
      farmName: 'Fazenda Santa Helena HF',
      plotId: selectedPlot?.id || 'plot-01',
      plotCode: selectedPlot?.code || 'EST-01',
      plotName: selectedPlot?.name || 'Estufa Principal',
      cropId: cropObj?.id || 'cultura-custom',
      cropName: formData.cropName,
      cultivarName: formData.cultivarName,
      seasonYear: formData.seasonYear,
      sequentialNumber: seq,
      status: formData.status,
      sowingDate: formData.sowingDate,
      nurseryTransplantDate: formData.nurseryTransplantDate,
      estimatedHarvestStartDate: formData.estimatedHarvestStartDate,
      estimatedHarvestEndDate: formData.estimatedHarvestEndDate,
      seedSupplier: formData.seedSupplier,
      seedLotNumber: formData.seedLotNumber,
      nurserySupplier: formData.nurserySupplier,
      plantedAreaHa: Number(formData.plantedAreaHa),
      plantsCount: Number(formData.plantsCount),
      spacingBetweenRowsMeters: Number(formData.spacingBetweenRowsMeters),
      spacingBetweenPlantsMeters: Number(formData.spacingBetweenPlantsMeters),
      estimatedYieldKg: Number(formData.estimatedYieldKg),
      estimatedBoxesCount: estBoxes,
      totalHarvestedKg: editingLot ? editingLot.totalHarvestedKg : 0,
      totalHarvestedBoxes: editingLot ? editingLot.totalHarvestedBoxes : 0,
      totalExpeditedBoxes: editingLot ? editingLot.totalExpeditedBoxes : 0,
      isUnderActiveQuarantine: editingLot ? editingLot.isUnderActiveQuarantine : false,
      igrScorePercentage: editingLot ? editingLot.igrScorePercentage : 95,
      igrStatus: editingLot ? editingLot.igrStatus : 'excelente',
      notes: formData.notes,
      createdAt: editingLot ? editingLot.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveLot(newLot);
    setIsModalOpen(false);
  };

  // Digital Twin specific calculations for selected lot
  const digitalTwinData = useMemo(() => {
    if (!selectedLot) return null;
    const lotOps = operations.filter(o => o.lotId === selectedLot.id || o.lotCode === selectedLot.lotCode);
    const lotHarvs = harvests.filter(h => h.lotId === selectedLot.id || h.lotCode === selectedLot.lotCode);
    const lotMoni = monitoring.filter(m => m.lotId === selectedLot.id || m.lotCode === selectedLot.lotCode);

    // Days after sowing (DAP)
    const sowing = new Date(selectedLot.sowingDate).getTime();
    const now = new Date().getTime();
    const dap = Math.max(0, Math.floor((now - sowing) / (1000 * 60 * 60 * 24)));

    // Total cost
    const totalCost = lotOps.reduce((acc, o) => acc + (o.totalOperationCostBrl || 0), 0);
    const costPerHa = selectedLot.plantedAreaHa > 0 ? totalCost / selectedLot.plantedAreaHa : 0;
    const costPerKg = selectedLot.totalHarvestedKg > 0 ? totalCost / selectedLot.totalHarvestedKg : 0;

    return {
      dap,
      operationsCount: lotOps.length,
      harvestsCount: lotHarvs.length,
      monitoringCount: lotMoni.length,
      totalCost,
      costPerHa,
      costPerKg,
      recentOperations: lotOps.slice(-4).reverse(),
      recentMonitoring: lotMoni.slice(-3).reverse(),
    };
  }, [selectedLot, operations, harvests, monitoring]);

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por lote, cultura, talhão..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-800 dark:text-zinc-200 focus:outline-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs text-slate-700 dark:text-zinc-300 cursor-pointer"
          >
            <option value="all">Todos os Status</option>
            <option value="semeadura">Semeadura</option>
            <option value="desenvolvimento">Desenvolvimento</option>
            <option value="florescimento">Florescimento</option>
            <option value="frutificacao">Frutificação</option>
            <option value="colheita">Em Colheita</option>
            <option value="finalizado">Finalizados</option>
          </select>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Lote de Produção
        </button>
      </div>

      {/* Main Grid: Lots Cards & Digital Twin Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lots List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 px-1">
            <span>{filteredLots.length} lotes encontrados</span>
            <span className="text-[11px] text-emerald-600 font-semibold">Padrão GeaAgro INC 02/2018</span>
          </div>

          <div className="space-y-3">
            {filteredLots.map(lot => {
              const isSelected = selectedLot?.id === lot.id;

              return (
                <div
                  key={lot.id}
                  onClick={() => onSelectLot(lot)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          {lot.lotCode}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                          {lot.plotCode} • {lot.plantedAreaHa} ha
                        </span>
                        {lot.isUnderActiveQuarantine && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                            <AlertTriangle className="w-3 h-3" /> Carência Ativa
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {lot.cropName} <span className="font-medium text-slate-500 text-sm">({lot.cultivarName})</span>
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Semente: <strong className="text-slate-700 dark:text-zinc-300">{lot.seedSupplier}</strong> (Lote {lot.seedLotNumber}) • {lot.plantsCount.toLocaleString('pt-BR')} plantas
                      </p>
                    </div>

                    {/* Progress / Yield Stats */}
                    <div className="text-right sm:text-right w-full sm:w-auto flex sm:flex-col justify-between items-end gap-1">
                      <div>
                        <span className="text-xs text-slate-400">Colhido</span>
                        <p className="text-base font-bold text-slate-800 dark:text-zinc-100">
                          {(lot.totalHarvestedKg / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400">/ {(lot.estimatedYieldKg / 1000).toFixed(1)} t</span>
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-100/60 dark:bg-emerald-950 px-2 py-0.5 rounded">
                        IGR: {lot.igrScorePercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Semeadura: {new Date(lot.sowingDate).toLocaleDateString('pt-BR')}
                      </span>
                      {lot.nurseryTransplantDate && (
                        <span>Transplante: {new Date(lot.nurseryTransplantDate).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onOpenPassport(lot)}
                        className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Abrir Passaporte Digital do Alimento"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Passaporte
                      </button>

                      <button
                        onClick={() => onOpenLabels(lot)}
                        className="p-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Gerar Etiquetas e QR Code para Caixas"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Etiquetas
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(lot)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 rounded-lg cursor-pointer"
                        title="Editar Lote"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Deseja remover o lote ${lot.lotCode}?`)) {
                            onDeleteLot(lot.id);
                          }
                        }}
                        className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-500 rounded-lg cursor-pointer"
                        title="Excluir Lote"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Gêmeo Digital do Lote (360° Inspector) */}
        <div className="lg:col-span-1">
          {selectedLot && digitalTwinData ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-5 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      Gêmeo Digital 360°
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Painel holístico de inteligência
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {selectedLot.lotCode}
                </span>
              </div>

              {/* 360 Top Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Idade</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{digitalTwinData.dap} DAP</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Operações</span>
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-100">{digitalTwinData.operationsCount}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Colheitas</span>
                  <p className="text-sm font-bold text-emerald-600">{digitalTwinData.harvestsCount}</p>
                </div>
              </div>

              {/* Sanidade e Carência */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Status de Segurança Sanitária
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    IGR {selectedLot.igrScorePercentage}%
                  </span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-200">
                  {selectedLot.isUnderActiveQuarantine
                    ? `⚠️ Lote em carência fitossanitária até ${selectedLot.activeQuarantineUntilDate}.`
                    : '✅ Livre de carência ativa. Apto para colheita e consumo seguro.'}
                </p>
              </div>

              {/* Custos do Lote */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-zinc-200">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-amber-500" />
                    Custo Acumulado do Lote
                  </span>
                  <span>R$ {digitalTwinData.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                  <span>Por Hectare: R$ {digitalTwinData.costPerHa.toFixed(2)}/ha</span>
                  <span>Por kg colhido: R$ {digitalTwinData.costPerKg > 0 ? digitalTwinData.costPerKg.toFixed(2) : '--'}/kg</span>
                </div>
              </div>

              {/* Últimas Operações Registradas */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  Histórico Recente de Manejo
                </h5>
                {digitalTwinData.recentOperations.length > 0 ? (
                  <div className="space-y-1.5">
                    {digitalTwinData.recentOperations.map(op => (
                      <div key={op.id} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/40 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 capitalize">
                            {op.type.replace('_', ' ')}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {new Date(op.date).toLocaleDateString('pt-BR')} • {op.operatorName}
                          </span>
                        </div>
                        {op.commercialProduct && (
                          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 max-w-[100px] truncate">
                            {op.commercialProduct}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Nenhuma operação lançada para este lote.</p>
                )}
              </div>

              {/* Passaporte & Etiquetas Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => onOpenPassport(selectedLot)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Abrir Passaporte Digital do Alimento
                </button>
                <button
                  onClick={() => onOpenLabels(selectedLot)}
                  className="w-full py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Etiquetas Térmicas (Caixas & Pallets)
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <Boxes className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">Selecione um lote à esquerda para carregar o <strong>Gêmeo Digital 360°</strong> com indicadores em tempo real.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-zinc-800 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-600" />
                {editingLot ? `Editar Lote ${editingLot.lotCode}` : 'Cadastrar Novo Lote de Produção'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cultura */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Cultura Agrícola *</label>
                  <select
                    value={formData.cropName}
                    onChange={e => {
                      const cName = e.target.value;
                      const cropFound = crops.find(c => c.name.toLowerCase() === cName.toLowerCase());
                      setFormData(prev => ({
                        ...prev,
                        cropName: cName,
                        cultivarName: cropFound?.cultivarsRecommended[0] || 'Padrão',
                      }));
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                    required
                  >
                    {crops.map(c => (
                      <option key={c.id} value={c.name}>{c.name} ({c.scientificName})</option>
                    ))}
                  </select>
                </div>

                {/* Cultivar */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Cultivar / Híbrido *</label>
                  <input
                    type="text"
                    value={formData.cultivarName}
                    onChange={e => setFormData(prev => ({ ...prev, cultivarName: e.target.value }))}
                    placeholder="Ex: Sweet Grape, Magali R"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                    required
                  />
                </div>

                {/* Talhão / Estufa */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Talhão ou Estufa *</label>
                  <select
                    value={formData.plotId}
                    onChange={e => {
                      const p = plots.find(pl => pl.id === e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        plotId: e.target.value,
                        plantedAreaHa: p?.areaHa || prev.plantedAreaHa,
                      }));
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                    required
                  >
                    {plots.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name} ({p.areaHa} ha)</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Estádio / Status *</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as LotStatus }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  >
                    <option value="semeadura">Semeadura / Mudas</option>
                    <option value="desenvolvimento">Desenvolvimento Vegetativo</option>
                    <option value="florescimento">Florescimento</option>
                    <option value="frutificacao">Frutificação / Enchimento</option>
                    <option value="colheita">Em Colheita</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>

                {/* Data Semeadura */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Data de Semeadura *</label>
                  <input
                    type="date"
                    value={formData.sowingDate}
                    onChange={e => setFormData(prev => ({ ...prev, sowingDate: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                    required
                  />
                </div>

                {/* Data Transplante */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Data do Transplante (Opcional)</label>
                  <input
                    type="date"
                    value={formData.nurseryTransplantDate}
                    onChange={e => setFormData(prev => ({ ...prev, nurseryTransplantDate: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>

                {/* Fornecedor Semente */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Fornecedor da Semente / Viveiro</label>
                  <input
                    type="text"
                    value={formData.seedSupplier}
                    onChange={e => setFormData(prev => ({ ...prev, seedSupplier: e.target.value }))}
                    placeholder="Ex: Sakata, Syngenta, Rijk Zwaan"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>

                {/* Lote da Semente */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Nº do Lote de Semente (RNS)</label>
                  <input
                    type="text"
                    value={formData.seedLotNumber}
                    onChange={e => setFormData(prev => ({ ...prev, seedLotNumber: e.target.value }))}
                    placeholder="Ex: SKT-2027-0912"
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>

                {/* Área Plantada (ha) */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Área Plantada (ha)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.plantedAreaHa}
                    onChange={e => setFormData(prev => ({ ...prev, plantedAreaHa: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>

                {/* Quantidade de Plantas */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">População de Plantas</label>
                  <input
                    type="number"
                    value={formData.plantsCount}
                    onChange={e => setFormData(prev => ({ ...prev, plantsCount: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>

                {/* Produção Estimada (kg) */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">Estimativa de Colheita Total (kg)</label>
                  <input
                    type="number"
                    value={formData.estimatedYieldKg}
                    onChange={e => setFormData(prev => ({ ...prev, estimatedYieldKg: Number(e.target.value) }))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">Observações Técnicas</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informações sobre adubação de base, preparo de estufa, substrato..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  {editingLot ? 'Salvar Alterações' : 'Criar Lote GeaAgro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
