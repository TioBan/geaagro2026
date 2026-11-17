import React, { useState } from 'react';
import {
  Activity,
  Boxes,
  Bug,
  CheckCircle2,
  FlaskConical,
  Flower2,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Sprout,
  ThermometerSun,
} from 'lucide-react';
import { FieldOperation } from '../../types/fieldbook';
import { GreenhouseEnvironment, ProductionBatch } from '../../types/nursery';
import { lazyWithRetry } from '../../utils/lazyWithRetry';

const NurseryModule = lazyWithRetry(() =>
  import('../NurseryModule').then((m: any) => ({ default: m.NurseryModule || m.default }))
);

interface FieldBookNurseryViewProps {
  batches: ProductionBatch[];
  operations: FieldOperation[];
  onOpenTransplantModal: (batch: ProductionBatch) => void;
  onOpenNewSowingOperation: () => void;
}

export const FieldBookNurseryView: React.FC<FieldBookNurseryViewProps> = ({
  batches,
  operations,
  onOpenTransplantModal,
  onOpenNewSowingOperation,
}) => {
  const [nurserySubTab, setNurserySubTab] = useState<'lotes' | 'estufas' | 'fitossanitario' | 'modulo_completo'>('lotes');
  const [batchSearchTerm, setBatchSearchTerm] = useState<string>('');
  const [batchStatusFilter, setBatchStatusFilter] = useState<string>('todos');

  const greenhouses: GreenhouseEnvironment[] = [];

  const activeBatches = (batches || []).filter(b => b?.status !== 'entregue');
  const totalSeedsInNursery = activeBatches.reduce((sum, b) => sum + (b?.totalSeedsSown || 0), 0);
  const readyBatches = (batches || []).filter(b => b?.status === 'pronto_expedicao' || b?.status === 'aclimatacao');
  const totalReadySeedlings = readyBatches.reduce((sum, b) => sum + (b?.estimatedReadyPlants || 0), 0);
  const finalizedBatches = (batches || []).filter(b => b?.status === 'entregue');
  const transplantedCount = (operations || [])
    .filter(o => o.type === 'nursery_transplant')
    .reduce((sum, o) => sum + (o.details?.seedlingCount || 0), 0);
  const avgGerminationPct =
    (batches || []).length > 0
      ? Math.round(((batches || []).reduce((s, b) => s + (b?.germinationRatePercent || 0), 0) / batches.length) * 10) / 10
      : 0;

  const filteredBatches = (batches || []).filter(b => {
    if (!b) return false;
    if (batchStatusFilter === 'pronto' && b.status !== 'pronto_expedicao' && b.status !== 'aclimatacao') return false;
    if (batchStatusFilter === 'desenvolvimento' && b.status !== 'desenvolvimento') return false;
    if (batchStatusFilter === 'semeadura' && b.status !== 'semeadura' && b.status !== 'germinacao') return false;
    if (batchStatusFilter === 'entregue' && b.status !== 'entregue') return false;
    if (!batchSearchTerm.trim()) return true;
    const term = batchSearchTerm.toLowerCase();
    return (
      (b.batchCode || '').toLowerCase().includes(term) ||
      (b.cropName || '').toLowerCase().includes(term) ||
      (b.cultivar || '').toLowerCase().includes(term) ||
      (b.greenhouse || '').toLowerCase().includes(term) ||
      (b.trayType || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 text-white p-6 rounded-2xl border border-teal-700/50 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-400/30 flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide">
                <Flower2 className="w-4 h-4 text-teal-400" />
                Viveiro de Produção &amp; Propagação
              </span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Rastreabilidade RENASEM
              </span>
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              Produção de Mudas &amp; Rastreabilidade de Transplante
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Acompanhamento ciclo a ciclo desde a semeadura em bandejas termoformadas, microclima das estufas, rustificação e liberação com laudo fitossanitário para o Caderno de Campo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const readyBatch = batches.find(b => b.status === 'pronto_expedicao' || b.status === 'aclimatacao') || batches[0];
                if (readyBatch) onOpenTransplantModal(readyBatch);
              }}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Transplantar Lote p/ Campo</span>
            </button>

            <button
              onClick={onOpenNewSowingOperation}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 border border-white/20 cursor-pointer"
            >
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span>Nova Semeadura</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Mudas no Viveiro</span>
            <Boxes className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {totalSeedsInNursery.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
            {activeBatches.length} lotes em fases ativas
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Prontas p/ Transplante</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {totalReadySeedlings.toLocaleString()}
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            {readyBatches.length} lotes em aclimatação/expedição
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Transplantadas no Campo</span>
            <Sprout className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-teal-600 dark:text-teal-400 mt-2">
            {transplantedCount.toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
            {finalizedBatches.length > 0 ? `${finalizedBatches.length} lote(s) transplantado(s)` : 'Nenhum transplante registrado'}
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <span>Taxa Média Germinação</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {avgGerminationPct}
            <span className="text-lg text-emerald-600">%</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1 block">
            {(batches || []).length > 0 ? `Média de ${batches.length} lote(s)` : 'Sem lotes cadastrados'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setNurserySubTab('lotes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            nurserySubTab === 'lotes'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          Lotes &amp; Transplante ({batches.length})
        </button>
        <button
          onClick={() => setNurserySubTab('estufas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            nurserySubTab === 'estufas'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          Estufas &amp; Microclima
        </button>
        <button
          onClick={() => setNurserySubTab('fitossanitario')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            nurserySubTab === 'fitossanitario'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          MIP Viveiro &amp; Sanidade
        </button>
        <button
          onClick={() => setNurserySubTab('modulo_completo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            nurserySubTab === 'modulo_completo'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          Módulo Completo (Visão Avançada)
        </button>
      </div>

      {nurserySubTab === 'lotes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'todos', label: 'Todos os Lotes' },
                { key: 'pronto', label: 'Prontas p/ Transplante' },
                { key: 'desenvolvimento', label: 'Em Desenvolvimento' },
                { key: 'semeadura', label: 'Semeadura / Germinação' },
                { key: 'entregue', label: 'Transplantados no Campo' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setBatchStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    batchStatusFilter === tab.key
                      ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={batchSearchTerm}
                onChange={e => setBatchSearchTerm(e.target.value)}
                placeholder="Buscar lote, cultivar..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBatches.length === 0 ? (
              <div className="col-span-full py-10 px-6 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-2">
                <Flower2 className="w-8 h-8 text-teal-600 mx-auto" />
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Nenhum lote de mudas cadastrado</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Registre uma nova semeadura ou lote no módulo completo do viveiro.
                </p>
              </div>
            ) : (
              filteredBatches.map(batch => {
                const isReady = batch.status === 'pronto_expedicao' || batch.status === 'aclimatacao';
                const isFinished = batch.status === 'entregue';

                return (
                  <div
                    key={batch.id}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                              {batch.batchCode}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                isFinished
                                  ? 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400'
                                  : isReady
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {batch.status === 'pronto_expedicao'
                                ? 'Pronto p/ Expedição'
                                : batch.status === 'aclimatacao'
                                ? 'Em Aclimatação'
                                : batch.status === 'desenvolvimento'
                                ? 'Desenvolvimento'
                                : batch.status === 'semeadura'
                                ? 'Semeadura Recente'
                                : batch.status === 'entregue'
                                ? 'Transplantado no Campo'
                                : batch.status}
                            </span>
                          </div>
                          <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
                            {batch.cropName} • <span className="font-semibold text-slate-600 dark:text-zinc-400">{batch.cultivar}</span>
                          </h4>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl space-y-2 text-xs border border-slate-100 dark:border-zinc-800">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Localização:</span>
                          <strong className="text-slate-800 dark:text-white">
                            {batch.greenhouse} ({batch.benchLocation})
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Bandeja &amp; Células:</span>
                          <span className="text-slate-700 dark:text-zinc-300 font-medium">
                            {batch.trayType} células ({batch.trayCount} bandejas)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Substrato:</span>
                          <span className="text-slate-700 dark:text-zinc-300">{batch.substrateType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Data Semeadura:</span>
                          <span className="font-mono text-slate-700 dark:text-zinc-300">
                            {new Date(batch.sowingDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Germinação:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{batch.germinationRatePercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(batch.germinationRatePercent, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-zinc-700">
                          <span className="font-bold text-slate-700 dark:text-zinc-300">Mudas Estimadas Prontas:</span>
                          <strong className="text-sm font-black text-teal-600 dark:text-teal-400">
                            {(batch.estimatedReadyPlants ?? 0).toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      {batch.notes && <p className="text-[11px] text-slate-500 dark:text-zinc-400 italic">{batch.notes}</p>}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      {isReady ? (
                        <button
                          onClick={() => onOpenTransplantModal(batch)}
                          className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Flower2 className="w-4 h-4" />
                          <span>Transplantar para Talhão</span>
                        </button>
                      ) : isFinished ? (
                        <div className="w-full py-2 px-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Transplantado com Sucesso</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onOpenTransplantModal(batch)}
                          className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-teal-600" />
                          <span>Agendar Transplante</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {nurserySubTab === 'estufas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {greenhouses.length === 0 ? (
              <div className="col-span-full py-10 px-6 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 space-y-2">
                <ThermometerSun className="w-8 h-8 text-teal-600 mx-auto" />
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Nenhuma estufa cadastrada</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Cadastre suas estufas na aba "Módulo Completo (Visão Avançada)".
                </p>
              </div>
            ) : (
              greenhouses.map(g => (
                <div
                  key={g.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{g.name}</h4>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 capitalize">
                        {g.type.replace('_', ' ')} • {g.activeBatchesCount} Lotes Ativos
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-black rounded-md ${
                        g.alerts && g.alerts.length > 0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {g.alerts && g.alerts.length > 0 ? `${g.alerts.length} Alerta(s)` : 'Operacional'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-slate-500 block">Temperatura</span>
                      <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">{g.currentTemp}°C</span>
                      <span className="text-[10px] text-emerald-600">VPD: {g.currentVpdKpa} kPa</span>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
                      <span className="text-slate-500 block">Umidade Relativa</span>
                      <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">{g.currentHumidity}%</span>
                      <span className="text-[10px] text-emerald-600">Nebulização: {g.foggingStatus}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800/60 text-xs space-y-1">
                    <span className="font-bold text-teal-900 dark:text-teal-200 block">Capacidade &amp; Ocupação</span>
                    <p className="text-slate-600 dark:text-zinc-400 text-[11px]">
                      Ocupação: <strong>{(g.currentOccupiedTrays ?? 0).toLocaleString()}</strong> de{' '}
                      <strong>{(g.totalCapacityTrays ?? 0).toLocaleString()} bandejas</strong> (
                      {Math.round(((g.currentOccupiedTrays || 0) / (g.totalCapacityTrays || 1)) * 100)}%).
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {nurserySubTab === 'fitossanitario' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b pb-4 border-slate-200 dark:border-zinc-800">
            <div className="p-2.5 bg-teal-500/20 text-teal-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Guia Fitossanitário do Viveirista &amp; MIP em Ambiente Protegido
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Protocolos rigorosos para garantia de sanidade vegetal de mudas antes do transplante a campo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-2">
              <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                <ShieldAlert className="w-4 h-4 text-blue-600" />
                1. Controle Físico &amp; Higienização
              </span>
              <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                • <strong>Telas Antiafídeos (50 mesh):</strong> Blindagem mecânica das estufas contra vetores de viroses (tripes, mosca-branca e pulgões).
                <br />• <strong>Desinfecção de Bandejas:</strong> Imersão prévia em solução de amônia quaternária a 2% ou hipoclorito de sódio.
                <br />• <strong>Pedilúvio na Entrada:</strong> Caixa desinfetante com cal virgem e sanitizante obrigatório para operadores.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-2">
              <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                <Sprout className="w-4 h-4 text-emerald-600" />
                2. Controle Cultural &amp; Rustificação
              </span>
              <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                • <strong>Manejo da Irrigação:</strong> Molhamento matinal para que as folhas sequem até a tarde, mitigando tombamento (damping-off por <em>Pythium</em> e <em>Rhizoctonia</em>).
                <br />• <strong>Aclimatação pré-transplante:</strong> Redução gradativa de rega e exposição solar de 3 a 5 dias para espessamento da cutícula foliar.
                <br />• <strong>Bancadas Suspensas:</strong> Altura mínima de 80 cm do solo para auto-poda radicular aérea e drenagem total.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-2">
              <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                <Bug className="w-4 h-4 text-teal-600" />
                3. Controle Biológico Aplicado
              </span>
              <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                • <strong>Trichoderma harzianum:</strong> Inoculação direta no substrato garantindo colonização radicular e proteção contra patógenos de solo.
                <br />• <strong>Bacillus subtilis:</strong> Pulverização foliar preventiva competindo por espaço e inibindo esporulação de oídios e míldios.
                <br />• <strong>Beauveria bassiana:</strong> Bioinseticida para supressão biológica de mosca-branca nas bancadas de solanáceas.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700/80 space-y-2">
              <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                <FlaskConical className="w-4 h-4 text-purple-600" />
                4. Controle Químico Racional &amp; LMR
              </span>
              <p className="text-slate-600 dark:text-zinc-300 leading-relaxed">
                • <strong>Defensivos Registrados:</strong> Uso estrito de produtos com registro no MAPA para viveiros/mudas.
                <br />• <strong>Apontamento Rastreável:</strong> Toda e qualquer aplicação é vinculada diretamente ao lote no Caderno de Campo com carência (PHI) zero residual no transplante.
                <br />• <strong>Certificado Fitossanitário de Origem (CFO):</strong> Emissão do laudo com RT agronômica para atendimento ao GlobalG.A.P.
              </p>
            </div>
          </div>
        </div>
      )}

      {nurserySubTab === 'modulo_completo' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
          <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-bold">Carregando Viveiro Inteligente...</div>}>
            <NurseryModule />
          </React.Suspense>
        </div>
      )}
    </div>
  );
};

export default FieldBookNurseryView;
