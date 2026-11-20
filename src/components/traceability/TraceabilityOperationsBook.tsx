import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Tractor,
  Trash2,
  X,
} from 'lucide-react';
import {
  TraceabilityOperation,
  TraceabilityLot,
  TraceabilityProperty,
  OperationType,
} from '../../types/traceability';

interface OperationsBookProps {
  property: TraceabilityProperty;
  lots: TraceabilityLot[];
  operations: TraceabilityOperation[];
  onSaveOperation: (op: TraceabilityOperation) => void;
  onDeleteOperation: (opId: string) => void;
}

export const TraceabilityOperationsBook: React.FC<OperationsBookProps> = ({
  property,
  lots,
  operations,
  onSaveOperation,
  onDeleteOperation,
}) => {
  const [selectedLotFilter, setSelectedLotFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    lotId: string;
    type: OperationType;
    date: string;
    description: string;
    operatorName: string;
    commercialProduct: string;
    activeIngredient: string;
    dosagePerHa: string;
    totalQuantityUsed: string;
    waterVolumeLitersPerHa: number;
    withholdingPeriodDays: number;
    targetPestDisease: string;
    agronomistPrescriptionArt: string;
    totalOperationCostBrl: number;
  }>({
    lotId: lots[0]?.id || '',
    type: 'pulverizacao',
    date: new Date().toISOString().split('T')[0],
    description: '',
    operatorName: property?.technicalResponsible || '',
    commercialProduct: '',
    activeIngredient: '',
    dosagePerHa: '',
    totalQuantityUsed: '',
    waterVolumeLitersPerHa: 0,
    withholdingPeriodDays: 0,
    targetPestDisease: '',
    agronomistPrescriptionArt: '',
    totalOperationCostBrl: 0,
  });

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const filteredOperations = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return (operations || []).filter(op => {
      if (!op) return false;
      const matchLot = selectedLotFilter === 'all' || op.lotId === selectedLotFilter;
      const matchType = selectedTypeFilter === 'all' || op.type === selectedTypeFilter;
      const matchSearch =
        !search ||
        (op.description || '').toLowerCase().includes(search) ||
        (op.lotCode || '').toLowerCase().includes(search) ||
        (op.commercialProduct || '').toLowerCase().includes(search) ||
        (op.operatorName || '').toLowerCase().includes(search) ||
        (op.activeIngredient || '').toLowerCase().includes(search) ||
        (op.targetPestDisease || '').toLowerCase().includes(search);
      return matchLot && matchType && matchSearch;
    });
  }, [operations, selectedLotFilter, selectedTypeFilter, searchTerm]);

  const totalCost = useMemo(() => {
    return filteredOperations.reduce((acc, op) => acc + (op.totalOperationCostBrl || 0), 0);
  }, [filteredOperations]);

  const handleOpenCreateModal = () => {
    setFormData({
      lotId: lots[0]?.id || '',
      type: 'pulverizacao',
      date: new Date().toISOString().split('T')[0],
      description: '',
      operatorName: property?.technicalResponsible || '',
      commercialProduct: '',
      activeIngredient: '',
      dosagePerHa: '',
      totalQuantityUsed: '',
      waterVolumeLitersPerHa: 0,
      withholdingPeriodDays: 0,
      targetPestDisease: '',
      agronomistPrescriptionArt: '',
      totalOperationCostBrl: 0,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lotObj = lots.find(l => l.id === formData.lotId) || lots[0];

    let safeHarvestDate: string | undefined;
    if (formData.withholdingPeriodDays > 0 && formData.type === 'pulverizacao') {
      const opDate = new Date(formData.date);
      opDate.setDate(opDate.getDate() + Number(formData.withholdingPeriodDays));
      safeHarvestDate = opDate.toISOString().split('T')[0];
    }

    const op: TraceabilityOperation = {
      id: `op-${Date.now()}`,
      lotId: lotObj?.id || 'geral',
      lotCode: lotObj?.lotCode || 'GERAL',
      plotId: lotObj?.plotId || 'geral',
      date: formData.date,
      type: formData.type,
      description: formData.description,
      operatorName: formData.operatorName,
      commercialProduct: formData.commercialProduct,
      activeIngredient: formData.activeIngredient,
      dosagePerHa: formData.dosagePerHa,
      totalQuantityUsed: formData.totalQuantityUsed,
      waterVolumeLitersPerHa: formData.waterVolumeLitersPerHa ? Number(formData.waterVolumeLitersPerHa) : undefined,
      withholdingPeriodDays: Number(formData.withholdingPeriodDays),
      safeHarvestDate,
      targetPestDisease: formData.targetPestDisease,
      agronomistPrescriptionArt: formData.agronomistPrescriptionArt,
      totalOperationCostBrl: Number(formData.totalOperationCostBrl),
      createdAt: new Date().toISOString(),
    };

    onSaveOperation(op);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Filter Controls */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Caderno de Campo Digital & Histórico de Operações
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Registro auditável de pulverizações, fertirrigações, adubações e tratos culturais com cálculo automático de carência
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="h-8 px-2.5 inline-flex items-center text-xs font-semibold text-slate-700 dark:text-zinc-200 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/80 dark:border-zinc-800 tabular-nums whitespace-nowrap">
              Custo Total: R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Registrar Operação
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por produto, praga, operador..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedLotFilter}
            onChange={e => setSelectedLotFilter(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          >
            <option value="all">Todos os Lotes ({lots.length})</option>
            {lots.map(l => (
              <option key={l.id} value={l.id}>
                {l.lotCode} - {l.cropName} ({l.cultivarName})
              </option>
            ))}
          </select>

          <select
            value={selectedTypeFilter}
            onChange={e => setSelectedTypeFilter(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          >
            <option value="all">Todos os Tipos de Manejo</option>
            <option value="pulverizacao">Pulverização / Defensivos</option>
            <option value="adubacao_cobertura">Adubação de Cobertura / Solo</option>
            <option value="irrigacao">Irrigação / Fertirrigação</option>
            <option value="trato_cultural">Tratos Culturais / Desbrota / Poda</option>
            <option value="plantio">Semeadura / Transplante</option>
          </select>
        </div>
      </div>

      {/* Operations Timeline */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider tabular-nums">
            {filteredOperations.length} lançamentos encontrados
          </span>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
            Conforme MAPA / GlobalG.A.P.
          </span>
        </div>

        <div className="divide-y divide-slate-200/60 dark:divide-zinc-800">
          {filteredOperations.length === 0 && (
            <div className="p-10 text-center space-y-3">
              <FileText className="w-8 h-8 text-slate-300 dark:text-zinc-600 mx-auto" />
              <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                Nenhum registro de operação encontrado no Caderno de Campo.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar Primeira Operação
              </button>
            </div>
          )}

          {filteredOperations.map(op => {
            const isSpraying = op.type === 'pulverizacao';
            const hasQuarantine = Boolean(op.withholdingPeriodDays && op.withholdingPeriodDays > 0);
            const todayStr = new Date().toISOString().split('T')[0];
            const isSafe = op.safeHarvestDate ? op.safeHarvestDate <= todayStr : true;
            const isConfirming = confirmingDeleteId === op.id;

            return (
              <div
                key={op.id}
                className="p-4 hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono font-semibold text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
                      {op.lotCode}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold border bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-700 capitalize">
                      {(op.type || 'operacao').replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 inline-flex items-center gap-1 tabular-nums">
                      <Calendar className="w-3 h-3" />
                      {new Date(op.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {op.description}
                  </h4>

                  {op.commercialProduct && (
                    <div className="text-xs text-slate-600 dark:text-zinc-300 flex items-center gap-3 flex-wrap">
                      <span>
                        Insumo: <strong className="text-slate-900 dark:text-zinc-100">{op.commercialProduct}</strong>
                        {op.activeIngredient ? ` (${op.activeIngredient})` : ''}
                      </span>
                      {op.dosagePerHa && (
                        <span>
                          Dose: <strong>{op.dosagePerHa}</strong>
                        </span>
                      )}
                      {op.targetPestDisease && (
                        <span className="text-slate-500 dark:text-zinc-400">Alvo: {op.targetPestDisease}</span>
                      )}
                      {op.agronomistPrescriptionArt && (
                        <span className="text-[11px] font-mono text-sky-700 dark:text-sky-400">
                          ART: {op.agronomistPrescriptionArt}
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                    Operador: {op.operatorName} • Custo: R$ {(op.totalOperationCostBrl || 0).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {isSpraying && hasQuarantine && (
                    <div
                      className={`px-2.5 py-1.5 rounded-lg border text-xs text-right tabular-nums ${
                        isSafe
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-end gap-1">
                        {isSafe ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        )}
                        {isSafe ? 'Carência Cumprida' : 'Em Carência'}
                      </div>
                      <span className="text-[10px] block">
                        {op.withholdingPeriodDays}d • Liberação:{' '}
                        {op.safeHarvestDate ? new Date(op.safeHarvestDate).toLocaleDateString('pt-BR') : '--'}
                      </span>
                    </div>
                  )}

                  {isConfirming ? (
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteOperation(op.id);
                          setConfirmingDeleteId(null);
                        }}
                        className="h-7 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-[11px] font-medium cursor-pointer"
                      >
                        Excluir
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
                      onClick={() => setConfirmingDeleteId(op.id)}
                      className="h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Excluir Lançamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Registro de Operação */}
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
                <Tractor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Registrar Operação Agrícola no Caderno de Campo
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Lote de Produção</label>
                  <select
                    value={formData.lotId}
                    onChange={e => setFormData(prev => ({ ...prev, lotId: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    {lots.length === 0 ? (
                      <option value="">Operação Geral da Propriedade</option>
                    ) : (
                      lots.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.lotCode} - {l.cropName} ({l.cultivarName})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Tipo de Manejo *</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as OperationType }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    <option value="pulverizacao">Pulverização / Tratamento Fitossanitário</option>
                    <option value="adubacao_cobertura">Adubação de Cobertura / Fertirrigação</option>
                    <option value="irrigacao">Lâmina de Irrigação</option>
                    <option value="trato_cultural">Tratos Culturais (Poda, Desbrota, Tutoramento)</option>
                    <option value="plantio">Semeadura / Transplante</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Data da Aplicação/Manejo *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Operador Responsável *</label>
                  <input
                    type="text"
                    value={formData.operatorName}
                    onChange={e => setFormData(prev => ({ ...prev, operatorName: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Descrição / Objetivo do Manejo *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Aplicação preventiva de fungicida foliar"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 space-y-3">
                <span className="font-semibold text-slate-800 dark:text-zinc-200 block text-xs">
                  Detalhes do Insumo / Defensivo / Fertilizante
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Nome Comercial</label>
                    <input
                      type="text"
                      value={formData.commercialProduct}
                      onChange={e => setFormData(prev => ({ ...prev, commercialProduct: e.target.value }))}
                      placeholder="Ex: Score, Amistar"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Ingrediente Ativo</label>
                    <input
                      type="text"
                      value={formData.activeIngredient}
                      onChange={e => setFormData(prev => ({ ...prev, activeIngredient: e.target.value }))}
                      placeholder="Ex: Difenoconazol"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Dose por Hectare</label>
                    <input
                      type="text"
                      value={formData.dosagePerHa}
                      onChange={e => setFormData(prev => ({ ...prev, dosagePerHa: e.target.value }))}
                      placeholder="Ex: 0.5 L/ha"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Carência (Dias)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.withholdingPeriodDays}
                      onChange={e => setFormData(prev => ({ ...prev, withholdingPeriodDays: Number(e.target.value) }))}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-amber-700 dark:text-amber-400 tabular-nums"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Alvo Biológico / Praga</label>
                    <input
                      type="text"
                      value={formData.targetPestDisease}
                      onChange={e => setFormData(prev => ({ ...prev, targetPestDisease: e.target.value }))}
                      placeholder="Ex: Mosca branca"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400">Custo Total (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={formData.totalOperationCostBrl}
                      onChange={e => setFormData(prev => ({ ...prev, totalOperationCostBrl: Number(e.target.value) }))}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 tabular-nums"
                    />
                  </div>
                </div>
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
                  Salvar no Caderno de Campo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
