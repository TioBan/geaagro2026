import React, { useEffect, useState } from 'react';
import {
  CalendarRange,
  Plus,
  CheckSquare,
  Square,
  X,
} from 'lucide-react';
import {
  SafraAgragricola,
  TarefaCronograma,
  TalhaoRural,
  ConfigCulturaIntegrada,
} from '../../types/gestaoRural';

interface GestaoPlanejamentoAgricolaProps {
  safras: SafraAgragricola[];
  cronograma: TarefaCronograma[];
  talhoes: TalhaoRural[];
  configCultura?: ConfigCulturaIntegrada;
  onAddSafra: (safra: SafraAgragricola) => void;
  onAddTarefa: (tarefa: TarefaCronograma) => void;
  onToggleChecklistItem: (tarefaId: string, checklistId: string) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';
const LABEL_CLASS = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CALENDAR_STAGES = [
  { etapa: 'Preparo do solo & calagem', months: [7, 8] },
  { etapa: 'Plantio / Semeadura', months: [8, 9, 10] },
  { etapa: 'Adubação de cobertura', months: [9, 10, 11] },
  { etapa: 'Controle fitossanitário', months: [10, 11, 0, 1] },
  { etapa: 'Colheita principal', months: [1, 2, 3] },
  { etapa: 'Safrinha / Cultivo secundário', months: [2, 3, 4, 5, 6] },
];

const STATUS_SAFRA_MAP: Record<SafraAgragricola['status'], { label: string; cls: string }> = {
  planejada: { label: 'Planejada', cls: 'text-sky-700 dark:text-sky-400' },
  em_andamento: { label: 'Em andamento', cls: 'text-emerald-700 dark:text-emerald-400' },
  colhida: { label: 'Colhida', cls: 'text-slate-600 dark:text-zinc-400' },
  cancelada: { label: 'Cancelada', cls: 'text-rose-600 dark:text-rose-400' },
};

const PRIORIDADE_MAP: Record<TarefaCronograma['prioridade'], { label: string; cls: string }> = {
  urgente: { label: 'Urgente', cls: 'text-rose-600 dark:text-rose-400' },
  alta: { label: 'Alta', cls: 'text-amber-700 dark:text-amber-400' },
  media: { label: 'Média', cls: 'text-sky-700 dark:text-sky-400' },
  baixa: { label: 'Baixa', cls: 'text-slate-500 dark:text-zinc-400' },
};

export const GestaoPlanejamentoAgricola: React.FC<GestaoPlanejamentoAgricolaProps> = ({
  safras,
  cronograma,
  talhoes,
  configCultura,
  onAddSafra,
  onAddTarefa,
  onToggleChecklistItem,
}) => {
  const [activeView, setActiveView] = useState<'safras' | 'cronograma' | 'calendario'>('safras');
  const [showSafraModal, setShowSafraModal] = useState(false);
  const [showTarefaModal, setShowTarefaModal] = useState(false);

  const defaultCultura = configCultura?.cultura || 'Soja';
  const defaultMeta = configCultura?.metaProdutividadePadraoHa || 68;
  const unidade = configCultura?.unidadeComercializacaoPrincipal || 'sc';

  const [newSafra, setNewSafra] = useState<Partial<SafraAgragricola>>({
    nomeSafra: 'Safra 2025/2026',
    anoAgricola: '2025/2026',
    cultura: defaultCultura,
    cultivar: configCultura?.variedade || '',
    talhaoId: talhoes[0]?.id || '',
    areaHa: talhoes[0]?.areaHa || 50,
    sistemaCultivo: 'Plantio Direto',
    cicloDias: 120,
    dataPrevistaPlantio: new Date().toISOString().split('T')[0],
    dataPrevistaColheita: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0],
    metaProdutividadeSacasHa: defaultMeta,
    status: 'planejada',
  });

  const [newTarefa, setNewTarefa] = useState<Partial<TarefaCronograma>>({
    titulo: '',
    tipoOperacao: 'Pulverização',
    talhaoId: talhoes[0]?.id || '',
    dataPrevista: new Date().toISOString().split('T')[0],
    responsavel: '',
    prioridade: 'media',
    status: 'pendente',
    observacoes: '',
  });

  useEffect(() => {
    if (!showSafraModal && !showTarefaModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSafraModal(false);
        setShowTarefaModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showSafraModal, showTarefaModal]);

  const handleCreateSafra = (e: React.FormEvent) => {
    e.preventDefault();
    const talhao = talhoes.find(t => t.id === newSafra.talhaoId);
    const created: SafraAgragricola = {
      id: `saf-${Date.now()}`,
      propriedadeId: talhao?.propriedadeId || 'prop-principal',
      nomeSafra: newSafra.nomeSafra || 'Safra 2025/2026',
      anoAgricola: newSafra.anoAgricola || '2025/2026',
      cultura: newSafra.cultura || defaultCultura,
      cultivar: newSafra.cultivar || 'Padrão',
      talhaoId: talhao?.id || 'geral',
      talhaoNome: talhao?.nome || 'Área Geral',
      areaHa: Number(newSafra.areaHa) || talhao?.areaHa || 0,
      sistemaCultivo: newSafra.sistemaCultivo || 'Plantio Direto',
      cicloDias: Number(newSafra.cicloDias) || 120,
      dataPrevistaPlantio: newSafra.dataPrevistaPlantio || new Date().toISOString().split('T')[0],
      dataPrevistaColheita: newSafra.dataPrevistaColheita || new Date().toISOString().split('T')[0],
      metaProdutividadeSacasHa: Number(newSafra.metaProdutividadeSacasHa) || defaultMeta,
      status: newSafra.status || 'planejada',
    };
    onAddSafra(created);
    setShowSafraModal(false);
  };

  const handleCreateTarefa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarefa.titulo?.trim()) return;
    const talhao = talhoes.find(t => t.id === newTarefa.talhaoId);
    const created: TarefaCronograma = {
      id: `tar-${Date.now()}`,
      safraId: safras[0]?.id || '',
      talhaoId: talhao?.id || 'geral',
      talhaoNome: talhao?.nome || 'Área Geral',
      titulo: newTarefa.titulo.trim(),
      tipoOperacao: newTarefa.tipoOperacao || 'Manejo',
      dataPrevista: newTarefa.dataPrevista || new Date().toISOString().split('T')[0],
      responsavel: newTarefa.responsavel?.trim() || 'Equipe de Campo',
      prioridade: newTarefa.prioridade || 'media',
      status: 'pendente',
      checklist: [
        { id: `ck-1-${Date.now()}`, item: 'Conferir insumos e regulagem do equipamento', concluido: false },
        { id: `ck-2-${Date.now()}`, item: 'Executar atividade no talhão e registrar apontamento', concluido: false },
      ],
      observacoes: newTarefa.observacoes || '',
    };
    onAddTarefa(created);
    setShowTarefaModal(false);
    setNewTarefa(prev => ({ ...prev, titulo: '', observacoes: '' }));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* HEADER & SUB-TABS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Planejamento Agrícola &amp; Safras</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Metas por talhão, cronograma operacional com checklists e janela fenológica
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTarefaModal(true)}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Tarefa</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSafraModal(true)}
              className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Safra</span>
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200/80 dark:border-zinc-800 px-5 flex items-center gap-4">
          {[
            { id: 'safras' as const, label: `Safras (${safras.length})` },
            { id: 'cronograma' as const, label: `Cronograma (${cronograma.length})` },
            { id: 'calendario' as const, label: 'Calendário Agrícola' },
          ].map(tab => {
            const active = activeView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveView(tab.id)}
                className={`relative h-9 text-xs font-medium cursor-pointer transition-colors ${
                  active
                    ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {tab.label}
                {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* SAFRAS VIEW */}
      {activeView === 'safras' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
          {safras.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                    <th className="py-2.5 px-4">Safra / Cultura</th>
                    <th className="py-2.5 px-4">Talhão</th>
                    <th className="py-2.5 px-4 text-right">Área</th>
                    <th className="py-2.5 px-4">Plantio / Colheita</th>
                    <th className="py-2.5 px-4 text-right">Meta ({unidade}/ha)</th>
                    <th className="py-2.5 px-4 text-right">Realizado</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {safras.map(s => {
                    const st = STATUS_SAFRA_MAP[s.status] || STATUS_SAFRA_MAP.planejada;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-zinc-100">{s.nomeSafra}</div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {s.cultura} · {s.cultivar}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">
                          <div>{s.talhaoNome}</div>
                          <div className="text-[11px] text-slate-400 dark:text-zinc-500">{s.sistemaCultivo}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                          {s.areaHa} ha
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-zinc-300 tabular-nums">
                          <div>{new Date(`${s.dataPrevistaPlantio}T00:00:00`).toLocaleDateString('pt-BR')}</div>
                          <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                            Colheita: {new Date(`${s.dataPrevistaColheita}T00:00:00`).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                          {s.metaProdutividadeSacasHa.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {s.produtividadeRealizadaSacasHa ? `${s.produtividadeRealizadaSacasHa.toLocaleString('pt-BR')} ${unidade}/ha` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium ${st.cls}`}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma safra planejada. Clique em <strong className="font-medium text-slate-700 dark:text-zinc-200">Nova Safra</strong> para iniciar o planejamento.
            </div>
          )}
        </div>
      )}

      {/* CRONOGRAMA VIEW */}
      {activeView === 'cronograma' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl divide-y divide-slate-100 dark:divide-zinc-800/80">
          {cronograma.length > 0 ? (
            cronograma.map(t => {
              const prio = PRIORIDADE_MAP[t.prioridade] || PRIORIDADE_MAP.media;
              const doneCount = t.checklist.filter(c => c.concluido).length;
              return (
                <div key={t.id} className="p-4 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">{t.titulo}</div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex flex-wrap items-center gap-x-2 tabular-nums">
                        <span>{t.tipoOperacao}</span>
                        <span>·</span>
                        <span>{t.talhaoNome}</span>
                        <span>·</span>
                        <span>Previsto: {new Date(`${t.dataPrevista}T00:00:00`).toLocaleDateString('pt-BR')}</span>
                        <span>·</span>
                        <span>Resp.: {t.responsavel}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] tabular-nums shrink-0">
                      <span className="text-slate-500 dark:text-zinc-400">
                        {doneCount}/{t.checklist.length} itens
                      </span>
                      <span className={`font-semibold ${prio.cls}`}>{prio.label}</span>
                    </div>
                  </div>

                  {t.checklist.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {t.checklist.map(ck => (
                        <button
                          key={ck.id}
                          type="button"
                          onClick={() => onToggleChecklistItem(t.id, ck.id)}
                          className="w-full text-left flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                          {ck.concluido ? (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className={ck.concluido ? 'line-through text-slate-400 dark:text-zinc-500' : ''}>
                            {ck.item}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma atividade no cronograma. Clique em <strong className="font-medium text-slate-700 dark:text-zinc-200">Nova Tarefa</strong> para criar ordens operacionais.
            </div>
          )}
        </div>
      )}

      {/* CALENDÁRIO AGRÍCOLA VIEW */}
      {activeView === 'calendario' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
              Janela Referencial de Manejo Anual ({defaultCultura})
            </span>
            <span className="text-[11px] text-slate-500 dark:text-zinc-400">
              Referência sazonal por etapa
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                  <th className="py-2.5 px-4 min-w-[200px]">Etapa Operacional</th>
                  {MONTHS.map(m => (
                    <th key={m} className="py-2.5 px-2 text-center font-medium">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {CALENDAR_STAGES.map(stage => (
                  <tr key={stage.etapa}>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-zinc-200">{stage.etapa}</td>
                    {MONTHS.map((m, idx) => {
                      const active = stage.months.includes(idx);
                      return (
                        <td key={m} className="py-3 px-1.5 text-center">
                          <div
                            className={`h-2.5 rounded-sm mx-auto ${
                              active ? 'bg-emerald-600/80 dark:bg-emerald-500/80' : 'bg-slate-100 dark:bg-zinc-800/70'
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NOVA SAFRA MODAL */}
      {showSafraModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setShowSafraModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Planejar Nova Safra</h3>
              <button
                type="button"
                onClick={() => setShowSafraModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSafra} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={LABEL_CLASS}>Nome da Safra</label>
                <input
                  type="text"
                  value={newSafra.nomeSafra}
                  onChange={e => setNewSafra({ ...newSafra, nomeSafra: e.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Cultura</label>
                <input
                  type="text"
                  value={newSafra.cultura}
                  onChange={e => setNewSafra({ ...newSafra, cultura: e.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Cultivar / Variedade</label>
                <input
                  type="text"
                  value={newSafra.cultivar}
                  onChange={e => setNewSafra({ ...newSafra, cultivar: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Talhão</label>
                <select
                  value={newSafra.talhaoId}
                  onChange={e => {
                    const t = talhoes.find(item => item.id === e.target.value);
                    setNewSafra({ ...newSafra, talhaoId: e.target.value, areaHa: t?.areaHa ?? newSafra.areaHa });
                  }}
                  className={INPUT_CLASS}
                >
                  <option value="">Área Geral</option>
                  {talhoes.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.areaHa} ha)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Área (ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newSafra.areaHa}
                  onChange={e => setNewSafra({ ...newSafra, areaHa: Number(e.target.value) })}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Meta ({unidade}/ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newSafra.metaProdutividadeSacasHa}
                  onChange={e => setNewSafra({ ...newSafra, metaProdutividadeSacasHa: Number(e.target.value) })}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Plantio Previsto</label>
                <input
                  type="date"
                  value={newSafra.dataPrevistaPlantio}
                  onChange={e => setNewSafra({ ...newSafra, dataPrevistaPlantio: e.target.value })}
                  className={`${INPUT_CLASS} tabular-nums`}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Colheita Prevista</label>
                <input
                  type="date"
                  value={newSafra.dataPrevistaColheita}
                  onChange={e => setNewSafra({ ...newSafra, dataPrevistaColheita: e.target.value })}
                  className={`${INPUT_CLASS} tabular-nums`}
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowSafraModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Safra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOVA TAREFA MODAL */}
      {showTarefaModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setShowTarefaModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Nova Tarefa no Cronograma</h3>
              <button
                type="button"
                onClick={() => setShowTarefaModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTarefa} className="p-5 space-y-3.5">
              <div>
                <label className={LABEL_CLASS}>Título da Atividade</label>
                <input
                  type="text"
                  placeholder="Ex: Aplicação de fungicida preventivo"
                  value={newTarefa.titulo}
                  onChange={e => setNewTarefa({ ...newTarefa, titulo: e.target.value })}
                  className={INPUT_CLASS}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Operação</label>
                  <input
                    type="text"
                    value={newTarefa.tipoOperacao}
                    onChange={e => setNewTarefa({ ...newTarefa, tipoOperacao: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Prioridade</label>
                  <select
                    value={newTarefa.prioridade}
                    onChange={e => setNewTarefa({ ...newTarefa, prioridade: e.target.value as TarefaCronograma['prioridade'] })}
                    className={INPUT_CLASS}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Talhão</label>
                  <select
                    value={newTarefa.talhaoId}
                    onChange={e => setNewTarefa({ ...newTarefa, talhaoId: e.target.value })}
                    className={INPUT_CLASS}
                  >
                    <option value="">Área Geral</option>
                    {talhoes.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLASS}>Data Prevista</label>
                  <input
                    type="date"
                    value={newTarefa.dataPrevista}
                    onChange={e => setNewTarefa({ ...newTarefa, dataPrevista: e.target.value })}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
              </div>
              <div>
                <label className={LABEL_CLASS}>Responsável</label>
                <input
                  type="text"
                  placeholder="Nome do operador ou encarregado"
                  value={newTarefa.responsavel}
                  onChange={e => setNewTarefa({ ...newTarefa, responsavel: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowTarefaModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Adicionar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
