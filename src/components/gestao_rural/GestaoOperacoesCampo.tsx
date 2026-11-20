import React, { useEffect, useMemo, useState } from 'react';
import { Tractor, Plus, Search, X } from 'lucide-react';
import { OperacaoCampoRecord, TalhaoRural, SafraAgragricola } from '../../types/gestaoRural';

interface GestaoOperacoesCampoProps {
  operacoes: OperacaoCampoRecord[];
  talhoes: TalhaoRural[];
  safras: SafraAgragricola[];
  onAddOperacao: (op: OperacaoCampoRecord) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';
const LABEL_CLASS = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

const OPERATION_TYPES: OperacaoCampoRecord['tipoOperacao'][] = [
  'Preparo do solo',
  'Subsolagem',
  'Escarificação',
  'Plantio',
  'Adubação',
  'Fertirrigação',
  'Pulverização',
  'Capina',
  'Poda',
  'Tutoramento',
  'Irrigação',
  'Colheita',
  'Transporte',
];

export const GestaoOperacoesCampo: React.FC<GestaoOperacoesCampoProps> = ({
  operacoes,
  talhoes,
  safras,
  onAddOperacao,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('Todas');
  const [showModal, setShowModal] = useState(false);

  const [newOp, setNewOp] = useState<Partial<OperacaoCampoRecord>>({
    tipoOperacao: 'Pulverização',
    talhaoId: talhoes[0]?.id || '',
    safraId: safras[0]?.id || '',
    areaAplicadaHa: talhoes[0]?.areaHa || 50,
    produtoUtilizado: '',
    dosePorHa: 0,
    unidadeDose: 'L/ha',
    maquinaNome: '',
    operadorNome: '',
    custoTotalOperacaoR$: 0,
    observacoes: '',
  });

  useEffect(() => {
    if (!showModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showModal]);

  const filteredOperacoes = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return operacoes.filter(op => {
      const matchTipo = filterTipo === 'Todas' || op.tipoOperacao === filterTipo;
      const matchSearch =
        !q ||
        op.tipoOperacao.toLowerCase().includes(q) ||
        op.talhaoNome.toLowerCase().includes(q) ||
        (op.produtoUtilizado || '').toLowerCase().includes(q) ||
        (op.operadorNome || '').toLowerCase().includes(q);
      return matchTipo && matchSearch;
    });
  }, [operacoes, searchTerm, filterTipo]);

  const totalCustoFiltrado = useMemo(
    () => filteredOperacoes.reduce((acc, op) => acc + op.custoTotalOperacaoR$, 0),
    [filteredOperacoes]
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const talhao = talhoes.find(t => t.id === newOp.talhaoId);
    const now = new Date().toISOString();
    const created: OperacaoCampoRecord = {
      id: `op-${Date.now()}`,
      safraId: newOp.safraId || safras[0]?.id || '',
      talhaoId: talhao?.id || 'geral',
      talhaoNome: talhao?.nome || 'Área Geral',
      tipoOperacao: newOp.tipoOperacao || 'Pulverização',
      dataHoraInicio: now,
      dataHoraFim: now,
      maquinaNome: newOp.maquinaNome?.trim() || undefined,
      operadorNome: newOp.operadorNome?.trim() || undefined,
      produtoUtilizado: newOp.produtoUtilizado?.trim() || undefined,
      dosePorHa: Number(newOp.dosePorHa) || undefined,
      unidadeDose: newOp.unidadeDose || 'L/ha',
      areaAplicadaHa: Number(newOp.areaAplicadaHa) || 0,
      custoTotalOperacaoR$: Number(newOp.custoTotalOperacaoR$) || 0,
      observacoes: newOp.observacoes?.trim() || '',
    };
    onAddOperacao(created);
    setShowModal(false);
    setNewOp(prev => ({ ...prev, produtoUtilizado: '', custoTotalOperacaoR$: 0, observacoes: '' }));
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* HEADER + FILTERS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Tractor className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Operações de Campo &amp; Caderno Agrícola</span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 tabular-nums">
              {filteredOperacoes.length} apontamento(s) · Custo acumulado R${' '}
              {totalCustoFiltrado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lançar Operação</span>
          </button>
        </div>

        <div className="px-5 py-3 border-t border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 bg-slate-50/50 dark:bg-zinc-950/30">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por operação, talhão, produto ou operador..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <select
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value)}
            className="h-8 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 focus:outline-none"
          >
            <option value="Todas">Todas as operações</option>
            {OPERATION_TYPES.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* OPERATIONS TABLE */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        {filteredOperacoes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                  <th className="py-2.5 px-4">Data</th>
                  <th className="py-2.5 px-4">Operação &amp; Talhão</th>
                  <th className="py-2.5 px-4">Insumo / Dose</th>
                  <th className="py-2.5 px-4">Máquina / Operador</th>
                  <th className="py-2.5 px-4 text-right">Área</th>
                  <th className="py-2.5 px-4 text-right">Custo Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {filteredOperacoes.map(op => (
                  <tr key={op.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-500 dark:text-zinc-400 tabular-nums whitespace-nowrap">
                      {new Date(op.dataHoraInicio).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-zinc-100">{op.tipoOperacao}</div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400">{op.talhaoNome}</div>
                      {op.observacoes && (
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 line-clamp-1">
                          {op.observacoes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-zinc-300 tabular-nums">
                      {op.produtoUtilizado ? (
                        <>
                          <div>{op.produtoUtilizado}</div>
                          {op.dosePorHa ? (
                            <div className="text-[11px] text-slate-400 dark:text-zinc-500">
                              {op.dosePorHa} {op.unidadeDose || 'L/ha'}
                            </div>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-slate-400 dark:text-zinc-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                      <div>{op.maquinaNome || '—'}</div>
                      {op.operadorNome && (
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500">{op.operadorNome}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                      {op.areaAplicadaHa} ha
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums whitespace-nowrap">
                      R$ {op.custoTotalOperacaoR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
            Nenhuma operação encontrada. Clique em <strong className="font-medium text-slate-700 dark:text-zinc-200">Lançar Operação</strong> para registrar o apontamento de campo.
          </div>
        )}
      </div>

      {/* ADD OPERAÇÃO MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Novo Apontamento de Campo</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={LABEL_CLASS}>Tipo de Operação</label>
                <select
                  value={newOp.tipoOperacao}
                  onChange={e => setNewOp({ ...newOp, tipoOperacao: e.target.value as OperacaoCampoRecord['tipoOperacao'] })}
                  className={INPUT_CLASS}
                >
                  {OPERATION_TYPES.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Talhão</label>
                <select
                  value={newOp.talhaoId}
                  onChange={e => {
                    const t = talhoes.find(item => item.id === e.target.value);
                    setNewOp({ ...newOp, talhaoId: e.target.value, areaAplicadaHa: t?.areaHa ?? newOp.areaAplicadaHa });
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
                <label className={LABEL_CLASS}>Área Aplicada (ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newOp.areaAplicadaHa}
                  onChange={e => setNewOp({ ...newOp, areaAplicadaHa: Number(e.target.value) })}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Custo Total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newOp.custoTotalOperacaoR$}
                  onChange={e => setNewOp({ ...newOp, custoTotalOperacaoR$: Number(e.target.value) })}
                  className={`${INPUT_CLASS} tabular-nums`}
                  required
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Produto / Insumo (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: NPK 08-28-16 ou Glifosato"
                  value={newOp.produtoUtilizado}
                  onChange={e => setNewOp({ ...newOp, produtoUtilizado: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={LABEL_CLASS}>Dose/ha</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newOp.dosePorHa}
                    onChange={e => setNewOp({ ...newOp, dosePorHa: Number(e.target.value) })}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Unidade</label>
                  <input
                    type="text"
                    value={newOp.unidadeDose}
                    onChange={e => setNewOp({ ...newOp, unidadeDose: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label className={LABEL_CLASS}>Máquina / Equipamento</label>
                <input
                  type="text"
                  placeholder="Ex: Pulverizador Jacto"
                  value={newOp.maquinaNome}
                  onChange={e => setNewOp({ ...newOp, maquinaNome: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Operador</label>
                <input
                  type="text"
                  placeholder="Nome do operador"
                  value={newOp.operadorNome}
                  onChange={e => setNewOp({ ...newOp, operadorNome: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS}>Observações de Campo</label>
                <input
                  type="text"
                  placeholder="Condições climáticas, regulagem ou anotações técnicas"
                  value={newOp.observacoes}
                  onChange={e => setNewOp({ ...newOp, observacoes: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Apontamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
