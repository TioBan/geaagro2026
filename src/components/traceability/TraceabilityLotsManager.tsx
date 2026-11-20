import React, { useState, useMemo, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  QrCode,
  Sparkles,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Activity,
  Edit2,
  Trash2,
  Printer,
  X,
} from 'lucide-react';
import {
  TraceabilityLot,
  TraceabilityPlot,
  TraceabilityCrop,
  TraceabilityOperation,
  TraceabilityHarvestItem,
  TraceabilityPestMonitoring,
  TraceabilityProperty,
  LotStatus,
} from '../../types/traceability';
import { generateGeaAgroLotCode } from '../../data/traceabilityData';

interface LotsManagerProps {
  property?: TraceabilityProperty;
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
  property,
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
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

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
    cropName: crops[0]?.name || 'Tomate',
    cultivarName: crops[0]?.cultivarsRecommended?.[0] || 'Sweet Grape',
    plotId: plots[0]?.id || '',
    seasonYear: new Date().getFullYear(),
    sowingDate: new Date().toISOString().split('T')[0],
    nurseryTransplantDate: '',
    estimatedHarvestStartDate: '',
    estimatedHarvestEndDate: '',
    seedSupplier: '',
    seedLotNumber: '',
    nurserySupplier: '',
    plantedAreaHa: plots[0]?.areaHa || 1.0,
    plantsCount: 20000,
    spacingBetweenRowsMeters: 1.2,
    spacingBetweenPlantsMeters: 0.4,
    estimatedYieldKg: 60000,
    status: 'desenvolvimento',
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

  const filteredLots = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return (lots || []).filter(lot => {
      if (!lot) return false;
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
    const firstPlot = plots[0];
    const defaultCrop = firstPlot?.currentCrop || crops[0]?.name || 'Tomate';
    const matchedCrop = crops.find(c => c.name.toLowerCase() === defaultCrop.toLowerCase());
    setFormData({
      cropName: defaultCrop,
      cultivarName: firstPlot?.currentCultivar || matchedCrop?.cultivarsRecommended?.[0] || 'Padrão',
      plotId: firstPlot?.id || '',
      seasonYear: new Date().getFullYear(),
      sowingDate: new Date().toISOString().split('T')[0],
      nurseryTransplantDate: '',
      estimatedHarvestStartDate: '',
      estimatedHarvestEndDate: '',
      seedSupplier: '',
      seedLotNumber: '',
      nurserySupplier: '',
      plantedAreaHa: firstPlot?.areaHa || 1.0,
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
      id: editingLot ? editingLot.id : `lote-${Date.now()}`,
      lotCode: generatedCode,
      farmId: selectedPlot?.farmId || property?.id || 'prop-01',
      farmName: property?.farmName || editingLot?.farmName || 'Propriedade Rural',
      plotId: selectedPlot?.id || 'talhao-01',
      plotCode: selectedPlot?.code || 'T-01',
      plotName: selectedPlot?.name || 'Talhão Principal',
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

  const digitalTwinData = useMemo(() => {
    if (!selectedLot) return null;
    const lotOps = operations.filter(o => o.lotId === selectedLot.id || o.lotCode === selectedLot.lotCode);
    const lotHarvs = harvests.filter(h => h.lotId === selectedLot.id || h.lotCode === selectedLot.lotCode);
    const lotMoni = monitoring.filter(m => m.lotId === selectedLot.id || m.lotCode === selectedLot.lotCode);

    const sowing = new Date(selectedLot.sowingDate).getTime();
    const now = Date.now();
    const dap = Math.max(0, Math.floor((now - sowing) / (1000 * 60 * 60 * 24)));

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
    };
  }, [selectedLot, operations, harvests, monitoring]);

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por lote, cultura, talhão..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer"
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
          type="button"
          onClick={handleOpenCreateModal}
          className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Lote de Produção
        </button>
      </div>

      {/* Main Grid: Lots Cards & Digital Twin Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Lots List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 px-0.5">
            <span className="tabular-nums">{filteredLots.length} lotes encontrados</span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Padrão GeaAgro INC 02/2018</span>
          </div>

          {filteredLots.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-10 text-center space-y-3">
              <Boxes className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                  {lots.length === 0 ? 'Nenhum lote cadastrado' : 'Nenhum lote encontrado para este filtro'}
                </p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {lots.length === 0
                    ? 'Cadastre um lote agrícola para iniciar o rastreamento ponta a ponta.'
                    : 'Limpe os filtros ou ajuste o termo de busca.'}
                </p>
              </div>
              {lots.length === 0 && (
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Criar Primeiro Lote
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLots.map(lot => {
                const isSelected = selectedLot?.id === lot.id;
                const isConfirming = confirmingDeleteId === lot.id;

                return (
                  <div
                    key={lot.id}
                    onClick={() => onSelectLot(lot)}
                    className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/80 dark:border-emerald-600'
                        : 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-semibold text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
                            {lot.lotCode}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700 tabular-nums">
                            {lot.plotCode} • {lot.plantedAreaHa} ha
                          </span>
                          {lot.isUnderActiveQuarantine && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60">
                              <AlertTriangle className="w-3 h-3" /> Carência Ativa
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                          {lot.cropName}{' '}
                          <span className="font-normal text-slate-500 dark:text-zinc-400">({lot.cultivarName})</span>
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                          Semente:{' '}
                          <strong className="font-medium text-slate-700 dark:text-zinc-300">
                            {lot.seedSupplier || 'Não informado'}
                          </strong>
                          {lot.seedLotNumber ? ` (Lote ${lot.seedLotNumber})` : ''} •{' '}
                          {lot.plantsCount.toLocaleString('pt-BR')} plantas
                        </p>
                      </div>

                      <div className="w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end gap-1 shrink-0 tabular-nums">
                        <div className="sm:text-right">
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500">Colhido</span>
                          <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                            {(lot.totalHarvestedKg / 1000).toFixed(1)}{' '}
                            <span className="text-xs font-normal text-slate-400 dark:text-zinc-500">
                              / {(lot.estimatedYieldKg / 1000).toFixed(1)} t
                            </span>
                          </p>
                        </div>
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60">
                          IGR {lot.igrScorePercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400 text-[11px] tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                          Semeadura: {new Date(lot.sowingDate).toLocaleDateString('pt-BR')}
                        </span>
                        {lot.nurseryTransplantDate && (
                          <span>Transplante: {new Date(lot.nurseryTransplantDate).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onOpenPassport(lot)}
                          className="h-7 px-2.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 rounded-md text-[11px] font-medium inline-flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer"
                          title="Abrir Passaporte Digital do Alimento"
                        >
                          <Sparkles className="w-3 h-3" /> Passaporte
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenLabels(lot)}
                          className="h-7 px-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-md text-[11px] font-medium inline-flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer"
                          title="Gerar Etiquetas e QR Code para Caixas"
                        >
                          <QrCode className="w-3 h-3" /> Etiquetas
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(lot)}
                          className="h-7 w-7 inline-flex items-center justify-center hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-md transition-colors cursor-pointer"
                          title="Editar Lote"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {isConfirming ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteLot(lot.id);
                                setConfirmingDeleteId(null);
                              }}
                              className="h-7 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[11px] font-medium whitespace-nowrap cursor-pointer"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmingDeleteId(null)}
                              className="h-7 px-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded-md text-[11px] font-medium cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmingDeleteId(lot.id)}
                            className="h-7 w-7 inline-flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                            title="Excluir Lote"
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
        </div>

        {/* Right Column: Gêmeo Digital 360° */}
        <div className="lg:col-span-1">
          {selectedLot && digitalTwinData ? (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-4 sticky top-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-tight">
                      Gêmeo Digital 360°
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                      Painel consolidado do lote
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-md border bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60 whitespace-nowrap">
                  {selectedLot.lotCode}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center tabular-nums">
                <div className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold block">Idade</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5">{digitalTwinData.dap} DAP</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold block">Operações</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5">{digitalTwinData.operationsCount}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold block">Colheitas</span>
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{digitalTwinData.harvestsCount}</p>
                </div>
              </div>

              {/* Sanidade e Carência */}
              <div
                className={`p-3 rounded-lg border space-y-1.5 ${
                  selectedLot.isUnderActiveQuarantine
                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60'
                    : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Segurança Sanitária
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    IGR {selectedLot.igrScorePercentage}%
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-zinc-300 flex items-start gap-1.5">
                  {selectedLot.isUnderActiveQuarantine ? (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Lote em carência fitossanitária até{' '}
                        <strong className="tabular-nums">{selectedLot.activeQuarantineUntilDate || 'data em aberto'}</strong>.
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>Livre de carência ativa. Apto para colheita e consumo seguro.</span>
                    </>
                  )}
                </p>
              </div>

              {/* Custos do Lote */}
              <div className="p-3 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 space-y-1.5 tabular-nums">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Custo Acumulado
                  </span>
                  <span>R$ {digitalTwinData.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                  <span>Por ha: R$ {digitalTwinData.costPerHa.toFixed(2)}</span>
                  <span>Por kg: R$ {digitalTwinData.costPerKg > 0 ? digitalTwinData.costPerKg.toFixed(2) : '--'}</span>
                </div>
              </div>

              {/* Histórico Recente */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                  Histórico Recente de Manejo
                </h5>
                {digitalTwinData.recentOperations.length > 0 ? (
                  <div className="space-y-1.5">
                    {digitalTwinData.recentOperations.map(op => (
                      <div
                        key={op.id}
                        className="text-xs p-2.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="font-medium text-slate-900 dark:text-zinc-100 capitalize block truncate">
                            {op.type.replace(/_/g, ' ')}
                          </span>
                          <span className="block text-[10px] text-slate-500 dark:text-zinc-400 tabular-nums">
                            {new Date(op.date).toLocaleDateString('pt-BR')} • {op.operatorName}
                          </span>
                        </div>
                        {op.commercialProduct && (
                          <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 max-w-[110px] truncate shrink-0">
                            {op.commercialProduct}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-zinc-500">Nenhuma operação lançada para este lote.</p>
                )}
              </div>

              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  onClick={() => onOpenPassport(selectedLot)}
                  className="w-full h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Abrir Passaporte Digital
                </button>
                <button
                  type="button"
                  onClick={() => onOpenLabels(selectedLot)}
                  className="w-full h-9 px-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Etiquetas Térmicas
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-300 dark:border-zinc-700 rounded-xl p-8 text-center text-slate-500 dark:text-zinc-400 space-y-2">
              <Boxes className="w-7 h-7 mx-auto text-slate-300 dark:text-zinc-600" />
              <p className="text-xs">
                Selecione um lote à esquerda para abrir o <strong className="text-slate-700 dark:text-zinc-200">Gêmeo Digital 360°</strong>.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 my-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {editingLot ? `Editar Lote ${editingLot.lotCode}` : 'Cadastrar Novo Lote de Produção'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Cultura Agrícola *</label>
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
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    required
                  >
                    {crops.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.scientificName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Cultivar / Híbrido *</label>
                  <input
                    type="text"
                    value={formData.cultivarName}
                    onChange={e => setFormData(prev => ({ ...prev, cultivarName: e.target.value }))}
                    placeholder="Ex: Sweet Grape, Magali R"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Talhão ou Estufa</label>
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
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    {plots.length === 0 ? (
                      <option value="">Talhão Principal (T-01)</option>
                    ) : (
                      plots.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.name} ({p.areaHa} ha)
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Estádio / Status *</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as LotStatus }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    <option value="semeadura">Semeadura / Mudas</option>
                    <option value="desenvolvimento">Desenvolvimento Vegetativo</option>
                    <option value="florescimento">Florescimento</option>
                    <option value="frutificacao">Frutificação / Enchimento</option>
                    <option value="colheita">Em Colheita</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Data de Semeadura *</label>
                  <input
                    type="date"
                    value={formData.sowingDate}
                    onChange={e => setFormData(prev => ({ ...prev, sowingDate: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Data do Transplante (Opcional)</label>
                  <input
                    type="date"
                    value={formData.nurseryTransplantDate}
                    onChange={e => setFormData(prev => ({ ...prev, nurseryTransplantDate: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Fornecedor da Semente / Viveiro</label>
                  <input
                    type="text"
                    value={formData.seedSupplier}
                    onChange={e => setFormData(prev => ({ ...prev, seedSupplier: e.target.value }))}
                    placeholder="Ex: Sakata, Syngenta, Rijk Zwaan"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Nº do Lote de Semente (RNS)</label>
                  <input
                    type="text"
                    value={formData.seedLotNumber}
                    onChange={e => setFormData(prev => ({ ...prev, seedLotNumber: e.target.value }))}
                    placeholder="Ex: SKT-2027-0912"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Área Plantada (ha)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.plantedAreaHa}
                    onChange={e => setFormData(prev => ({ ...prev, plantedAreaHa: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">População de Plantas</label>
                  <input
                    type="number"
                    value={formData.plantsCount}
                    onChange={e => setFormData(prev => ({ ...prev, plantsCount: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Estimativa de Colheita Total (kg)</label>
                  <input
                    type="number"
                    value={formData.estimatedYieldKg}
                    onChange={e => setFormData(prev => ({ ...prev, estimatedYieldKg: Number(e.target.value) }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Observações Técnicas</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informações sobre adubação de base, preparo de estufa, substrato..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-zinc-800">
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
