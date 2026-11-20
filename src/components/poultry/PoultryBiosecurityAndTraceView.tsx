import React, { useState } from 'react';
import { Bird, Check, Download, Plus, Printer, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { IEA_Result, PoultryBatch, PoultryBiosecurityCheck, PoultryShed } from '../../types/poultry';
import {
  POULTRY_CARD_CLASS,
  POULTRY_INPUT_CLASS,
  POULTRY_LABEL_CLASS,
  POULTRY_PRIMARY_BTN_CLASS,
  POULTRY_SECONDARY_BTN_CLASS,
  POULTRY_SUBCARD_CLASS,
  POULTRY_TEXTAREA_CLASS,
  formatBrDate,
  getBatchAgeDays,
  getBiosecurityBadgeClass,
  getTodayIsoDate,
} from './poultryUi';

const BIOSECURITY_STORAGE_KEY = 'geaagro_poultry_biosecurity_v1';

function loadBiosecurityChecks(): PoultryBiosecurityCheck[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BIOSECURITY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PoultryBiosecurityCheck[]) : [];
  } catch {
    return [];
  }
}

function saveBiosecurityChecks(items: PoultryBiosecurityCheck[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BIOSECURITY_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving poultry biosecurity checks:', err);
  }
}

interface PoultryBiosecurityAndTraceViewProps {
  mode: 'biosseguridade' | 'rastreabilidade';
  currentBatch: PoultryBatch | null;
  sheds: PoultryShed[];
  ieaResult: IEA_Result;
  onOpenAddBatch: () => void;
}

export const PoultryBiosecurityAndTraceView: React.FC<PoultryBiosecurityAndTraceViewProps> = ({
  mode,
  currentBatch,
  sheds,
  ieaResult,
  onOpenAddBatch,
}) => {
  const [checks, setChecks] = useState<PoultryBiosecurityCheck[]>(loadBiosecurityChecks);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Biosecurity form state
  const [date, setDate] = useState<string>(getTodayIsoDate);
  const [area, setArea] = useState<string>('Portaria / Arco de Desinfecção');
  const [inspector, setInspector] = useState<string>('');
  const [sanitaryVoidDays, setSanitaryVoidDays] = useState<string>('14');
  const [footbathChecked, setFootbathChecked] = useState<boolean>(true);
  const [meshIntegrityChecked, setMeshIntegrityChecked] = useState<boolean>(true);
  const [vehicleDisinfected, setVehicleDisinfected] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');

  const handleAddCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!area.trim()) return;
    const voidDays = Math.max(0, Math.floor(Number(sanitaryVoidDays) || 0));
    const allOk = footbathChecked && meshIntegrityChecked && vehicleDisinfected && voidDays >= 14;
    const status: PoultryBiosecurityCheck['status'] = allOk
      ? 'Conforme'
      : footbathChecked && meshIntegrityChecked
        ? 'Pendente'
        : 'Não Conforme';

    const newCheck: PoultryBiosecurityCheck = {
      id: `pbio-${Date.now()}`,
      date: date || getTodayIsoDate(),
      area: area.trim(),
      inspector: inspector.trim() || 'Responsável de Campo',
      status,
      sanitaryVoidDays: voidDays,
      footbathChecked,
      meshIntegrityChecked,
      vehicleDisinfected,
      notes: notes.trim() || undefined,
    };
    const updated = [newCheck, ...checks];
    setChecks(updated);
    saveBiosecurityChecks(updated);
    setNotes('');
  };

  const handleDeleteCheck = (id: string) => {
    const updated = checks.filter(c => c.id !== id);
    setChecks(updated);
    saveBiosecurityChecks(updated);
    setConfirmDeleteId(null);
  };

  const handleExportTraceCsv = () => {
    if (!currentBatch) return;
    const shedName = sheds.find(s => s.id === currentBatch.shedId)?.identification || 'Não vinculado';
    const totalFeed = currentBatch.consumptions.reduce((s, c) => s + c.feedConsumed, 0);
    const totalWater = currentBatch.consumptions.reduce((s, c) => s + c.waterConsumed, 0);
    const latestW =
      currentBatch.weighings.length > 0
        ? currentBatch.weighings[currentBatch.weighings.length - 1]
        : null;

    const rows = [
      ['Campo', 'Valor'],
      ['Codigo do Lote', currentBatch.code],
      ['Linhagem', currentBatch.lineage],
      ['Finalidade', currentBatch.purpose],
      ['Data Alojamento', formatBrDate(currentBatch.housingDate)],
      ['Idade (dias)', String(getBatchAgeDays(currentBatch.housingDate))],
      ['Quantidade Inicial', String(currentBatch.initialQuantity)],
      ['Quantidade Atual', String(currentBatch.currentQuantity)],
      ['Mortalidade (%)', `${ieaResult.mortalityRate.toFixed(2)}%`],
      ['Fornecedor', currentBatch.supplier],
      ['Incubatorio', currentBatch.hatchery],
      ['Galpao', shedName],
      ['Responsavel Tecnico', currentBatch.technicalResponsible],
      ['Ultimo Peso Medio (g)', latestW ? String(latestW.averageWeight) : '—'],
      ['Uniformidade (%)', latestW ? String(latestW.uniformity) : '—'],
      ['Racao Acumulada (kg)', String(totalFeed)],
      ['Agua Acumulada (L)', String(totalWater)],
      ['Eventos Sanitarios', String(currentBatch.healthEvents.length)],
      ['IEA Projetado', `${ieaResult.score} (${ieaResult.status})`],
    ];

    const csv = rows
      .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rastreabilidade-${currentBatch.code.toLowerCase().replace(/[^a-z0-9-_]/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // =========================================================
  // BIOSSEGURIDADE
  // =========================================================
  if (mode === 'biosseguridade') {
    const conformeCount = checks.filter(c => c.status === 'Conforme').length;
    const compliancePct =
      checks.length > 0 ? Math.round((conformeCount / checks.length) * 100) : 0;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Conformidade Geral
            </p>
            <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              {checks.length > 0 ? `${compliancePct}%` : '—'}
            </p>
          </div>
          <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Inspeções Conformes
            </p>
            <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
              {conformeCount} / {checks.length}
            </p>
          </div>
          <div className={`${POULTRY_CARD_CLASS} p-3.5`}>
            <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Vazio Sanitário Mínimo
            </p>
            <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
              14 dias
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <form onSubmit={handleAddCheck} className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-4 space-y-3`}>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Registrar Auditoria Sanitária
            </h2>
            <div>
              <label className={POULTRY_LABEL_CLASS}>Data da Inspeção</label>
              <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={POULTRY_INPUT_CLASS} />
            </div>
            <div>
              <label className={POULTRY_LABEL_CLASS}>Ponto de Barreira / Área</label>
              <input
                type="text"
                required
                value={area}
                onChange={e => setArea(e.target.value)}
                className={POULTRY_INPUT_CLASS}
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={POULTRY_LABEL_CLASS}>Inspetor</label>
                <input
                  type="text"
                  placeholder="Nome"
                  value={inspector}
                  onChange={e => setInspector(e.target.value)}
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
              <div>
                <label className={POULTRY_LABEL_CLASS}>Vazio Sanitário (dias)</label>
                <input
                  type="number"
                  min={0}
                  value={sanitaryVoidDays}
                  onChange={e => setSanitaryVoidDays(e.target.value)}
                  className={POULTRY_INPUT_CLASS}
                />
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs text-slate-700 dark:text-zinc-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={footbathChecked}
                  onChange={e => setFootbathChecked(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-700 accent-amber-600"
                />
                <span>Pedilúvio e troca de calçados ativos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={meshIntegrityChecked}
                  onChange={e => setMeshIntegrityChecked(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-700 accent-amber-600"
                />
                <span>Telas anti-pássaros (&le; 2,54 cm) íntegras</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vehicleDisinfected}
                  onChange={e => setVehicleDisinfected(e.target.checked)}
                  className="rounded border-slate-300 dark:border-zinc-700 accent-amber-600"
                />
                <span>Arco de desinfecção veicular operante</span>
              </label>
            </div>

            <div>
              <label className={POULTRY_LABEL_CLASS}>Observações</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Desvios encontrados ou ações corretivas..."
                className={POULTRY_TEXTAREA_CLASS}
              />
            </div>

            <button type="submit" className={`${POULTRY_PRIMARY_BTN_CLASS} w-full`}>
              <Plus className="w-3.5 h-3.5" />
              Salvar Inspeção
            </button>
          </form>

          <section className={`${POULTRY_CARD_CLASS} p-4 lg:col-span-8 space-y-3`}>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 pb-2.5 border-b border-slate-200 dark:border-zinc-800">
              Registros de Biosseguridade ({checks.length})
            </h3>
            {checks.length === 0 ? (
              <div className={`${POULTRY_SUBCARD_CLASS} p-6 text-center`}>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Nenhuma auditoria de biosseguridade registrada ainda.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                {checks.map(check => (
                  <div key={check.id} className="p-3 bg-white dark:bg-zinc-900 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                            {check.area}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getBiosecurityBadgeClass(check.status)}`}>
                            {check.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums mt-0.5">
                          {formatBrDate(check.date)} · {check.inspector} · Vazio sanitário: {check.sanitaryVoidDays} d
                        </p>
                      </div>

                      {confirmDeleteId === check.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteCheck(check.id)}
                            className="h-7 px-2 rounded bg-rose-600 text-white text-[11px] font-medium cursor-pointer"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="h-7 px-2 rounded border border-slate-200 dark:border-zinc-700 text-[11px] text-slate-600 dark:text-zinc-300 cursor-pointer"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(check.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer"
                          title="Remover inspeção"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <Check className={`w-3 h-3 ${check.footbathChecked ? 'text-emerald-600' : 'text-slate-300 dark:text-zinc-700'}`} />
                        Pedilúvio
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Check className={`w-3 h-3 ${check.meshIntegrityChecked ? 'text-emerald-600' : 'text-slate-300 dark:text-zinc-700'}`} />
                        Telas anti-pássaros
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Check className={`w-3 h-3 ${check.vehicleDisinfected ? 'text-emerald-600' : 'text-slate-300 dark:text-zinc-700'}`} />
                        Desinfecção veicular
                      </span>
                    </div>

                    {check.notes && (
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
                        {check.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // =========================================================
  // RASTREABILIDADE DE LOTES
  // =========================================================
  if (!currentBatch) {
    return (
      <div className={`${POULTRY_CARD_CLASS} p-8 text-center space-y-3`}>
        <Bird className="w-7 h-7 text-slate-400 dark:text-zinc-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
          Nenhum lote disponível para passaporte de rastreabilidade
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          Cadastre um lote para emitir a ficha de rastreabilidade e exportar os dados zootécnicos em CSV.
        </p>
        <button type="button" onClick={onOpenAddBatch} className={POULTRY_PRIMARY_BTN_CLASS}>
          <Plus className="w-3.5 h-3.5" />
          Alojar Novo Lote
        </button>
      </div>
    );
  }

  const linkedShed = sheds.find(s => s.id === currentBatch.shedId);
  const totalFeed = currentBatch.consumptions.reduce((s, c) => s + c.feedConsumed, 0);
  const totalWater = currentBatch.consumptions.reduce((s, c) => s + c.waterConsumed, 0);
  const latestW =
    currentBatch.weighings.length > 0
      ? currentBatch.weighings[currentBatch.weighings.length - 1]
      : null;

  return (
    <div className={`${POULTRY_CARD_CLASS} p-4 sm:p-5 space-y-4`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Passaporte de Rastreabilidade — {currentBatch.code}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Origem genética, incubatório, manejo nutricional, histórico sanitário e projeção de fechamento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={handleExportTraceCsv} className={POULTRY_PRIMARY_BTN_CLASS}>
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button type="button" onClick={() => window.print()} className={POULTRY_SECONDARY_BTN_CLASS}>
            <Printer className="w-3.5 h-3.5" />
            Imprimir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${POULTRY_SUBCARD_CLASS} p-4 space-y-2 text-xs`}>
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100 pb-2 border-b border-slate-200 dark:border-zinc-800">
            1. Origem & Identificação
          </h3>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Código do Lote</span>
            <span className="font-semibold text-slate-900 dark:text-zinc-100">{currentBatch.code}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Linhagem / Finalidade</span>
            <span className="font-medium text-slate-900 dark:text-zinc-100">
              {currentBatch.lineage} ({currentBatch.purpose})
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Incubatório</span>
            <span className="font-medium text-slate-900 dark:text-zinc-100">{currentBatch.hatchery || '—'}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Fornecedor</span>
            <span className="font-medium text-slate-900 dark:text-zinc-100">{currentBatch.supplier || '—'}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Data de Alojamento</span>
            <span className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
              {formatBrDate(currentBatch.housingDate)} ({getBatchAgeDays(currentBatch.housingDate)} dias)
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Aviário / Galpão</span>
            <span className="font-medium text-slate-900 dark:text-zinc-100">
              {linkedShed ? linkedShed.identification : 'Não vinculado'}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Responsável Técnico</span>
            <span className="font-medium text-slate-900 dark:text-zinc-100">
              {currentBatch.technicalResponsible || '—'}
            </span>
          </div>
        </div>

        <div className={`${POULTRY_SUBCARD_CLASS} p-4 space-y-2 text-xs`}>
          <h3 className="font-semibold text-slate-900 dark:text-zinc-100 pb-2 border-b border-slate-200 dark:border-zinc-800">
            2. Indicadores Consolidados & Auditoria
          </h3>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Aves Alojadas / Ativas</span>
            <span className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
              {currentBatch.initialQuantity.toLocaleString('pt-BR')} / {currentBatch.currentQuantity.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Mortalidade Acumulada</span>
            <span className="font-medium tabular-nums text-rose-600 dark:text-rose-400">
              {ieaResult.mortalityRate.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Último Peso / Uniformidade</span>
            <span className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
              {latestW ? `${latestW.averageWeight} g (${latestW.uniformity}%)` : '—'}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Ração / Água Registrados</span>
            <span className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
              {totalFeed.toLocaleString('pt-BR')} kg · {totalWater.toLocaleString('pt-BR')} L
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Protocolos Sanitários</span>
            <span className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
              {currentBatch.healthEvents.length} registro(s)
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 dark:text-zinc-400">Auditorias de Biosseguridade</span>
            <span className="font-medium tabular-nums text-slate-900 dark:text-zinc-100">
              {checks.length} inspeção(ões)
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-slate-500 dark:text-zinc-400">IEA Projetado</span>
            <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
              {ieaResult.score} pts ({ieaResult.status})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
