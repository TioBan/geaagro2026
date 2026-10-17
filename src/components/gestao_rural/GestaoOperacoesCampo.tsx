import React, { useState } from 'react';
import {
  Tractor,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CloudSun,
  Droplets,
  DollarSign,
  Camera,
  CheckCircle2,
  FileText,
  Search,
} from 'lucide-react';
import { OperacaoCampoRecord, TalhaoRural, SafraAgragricola } from '../../types/gestaoRural';

interface GestaoOperacoesCampoProps {
  operacoes: OperacaoCampoRecord[];
  talhoes: TalhaoRural[];
  safras: SafraAgragricola[];
  onAddOperacao: (operacao: OperacaoCampoRecord) => void;
}

export const GestaoOperacoesCampo: React.FC<GestaoOperacoesCampoProps> = ({
  operacoes,
  talhoes,
  safras,
  onAddOperacao,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState<Partial<OperacaoCampoRecord>>({
    tipoOperacao: 'Pulverização',
    talhaoId: talhoes[0]?.id || '',
    safraId: safras[0]?.id || '',
    operadorNome: '',
    maquinaNome: '',
    produtoUtilizado: '',
    dosePorHa: 0,
    unidadeDose: 'L/ha',
    areaAplicadaHa: 0,
    temperaturaC: 25,
    umidadeArPct: 60,
    velocidadeVentoKmH: 5,
    consumoCombustivelLiters: 0,
    custoTotalOperacaoR$: 0,
    observacoes: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const talhao = talhoes.find(t => t.id === form.talhaoId) || talhoes[0];
    const dose = Number(form.dosePorHa) || 0;
    const area = Number(form.areaAplicadaHa) || 1;

    const created: OperacaoCampoRecord = {
      id: `op-${Date.now()}`,
      safraId: form.safraId || safras[0]?.id || 'safra-01',
      talhaoId: talhao?.id || 'tal-01',
      talhaoNome: talhao?.nome || 'Talhão 01',
      tipoOperacao: (form.tipoOperacao as any) || 'Pulverização',
      dataHoraInicio: new Date().toISOString(),
      dataHoraFim: new Date().toISOString(),
      maquinaNome: form.maquinaNome || 'Máquina Agrícola',
      operadorNome: form.operadorNome || 'Operador Responsável',
      produtoUtilizado: form.produtoUtilizado || 'Nenhum',
      dosePorHa: dose,
      unidadeDose: form.unidadeDose || 'kg/ha',
      quantidadeTotalProduto: dose * area,
      areaAplicadaHa: area,
      temperaturaC: Number(form.temperaturaC) || 25,
      umidadeArPct: Number(form.umidadeArPct) || 60,
      velocidadeVentoKmH: Number(form.velocidadeVentoKmH) || 5,
      consumoCombustivelLiters: Number(form.consumoCombustivelLiters) || 0,
      custoTotalOperacaoR$: Number(form.custoTotalOperacaoR$) || 0,
      observacoes: form.observacoes || '',
    };

    onAddOperacao(created);
    setShowAddModal(false);
  };

  const filteredOps = operacoes.filter(
    op =>
      op.tipoOperacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.talhaoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (op.produtoUtilizado && op.produtoUtilizado.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold uppercase text-[10px] tracking-wider">
            <Tractor className="w-4 h-4" />
            Módulo 3 • Registro & Rastreabilidade de Operações de Campo
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Operações Agrícolas & Histórico de Manejo
          </h2>
          <p className="text-slate-500">
            Preparo do solo, plantio, adubação, fertirrigação, pulverizações e colheita com telemetria
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Operação de Campo</span>
        </button>
      </div>

      {/* SEARCH & LIST */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-3">
          <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Diário Eletrônico de Atividades de Campo ({filteredOps.length})
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por talhão, operação ou produto..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border rounded-xl bg-slate-50 dark:bg-zinc-800"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredOps.map(op => (
            <div
              key={op.id}
              className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                    {op.tipoOperacao}
                  </span>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white mt-1">
                    {op.talhaoNome} • {op.areaAplicadaHa} ha Aplicados
                  </h4>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 text-sm block">
                    R$ {op.custoTotalOperacaoR$.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(op.dataHoraInicio).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-700 dark:text-zinc-300">
                <div>
                  <span className="block text-slate-400 font-bold">Máquina / Implemento:</span>
                  <span className="font-bold">{op.maquinaNome || 'N/I'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Operador Responsável:</span>
                  <span className="font-bold">{op.operadorNome || 'N/I'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Produto & Dose:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {op.produtoUtilizado} ({op.dosePorHa} {op.unidadeDose})
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Condição Climática:</span>
                  <span>
                    {op.temperaturaC}°C | UR {op.umidadeArPct}% | Vento {op.velocidadeVentoKmH} km/h
                  </span>
                </div>
              </div>

              {op.observacoes && (
                <p className="text-[10px] text-slate-500 italic bg-white dark:bg-black/30 p-2 rounded-lg">
                  &ldquo;{op.observacoes}&rdquo;
                </p>
              )}
            </div>
          ))}
          {filteredOps.length === 0 && (
            <div className="p-8 text-center bg-slate-50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400">
              Nenhuma operação de campo encontrada. Clique em &ldquo;Nova Operação&rdquo; acima para lançar uma atividade.
            </div>
          )}
        </div>
      </div>

      {/* ADD OPERATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-xl w-full space-y-4">
            <h3 className="font-black text-base border-b pb-2">Lançar Nova Operação de Campo</h3>

            <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Tipo de Operação</label>
                <select
                  value={form.tipoOperacao}
                  onChange={e => setForm({ ...form, tipoOperacao: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                >
                  <option value="Preparo do solo">Preparo do Solo</option>
                  <option value="Plantio">Plantio / Semeadura</option>
                  <option value="Adubação">Adubação Soló / Folhar</option>
                  <option value="Fertirrigação">Fertirrigação</option>
                  <option value="Pulverização">Pulverização Defensivo</option>
                  <option value="Irrigação">Irrigação</option>
                  <option value="Colheita">Colheita & Transporte</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Talhão</label>
                <select
                  value={form.talhaoId}
                  onChange={e => setForm({ ...form, talhaoId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                >
                  {talhoes.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.areaHa} ha)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Produto Utilizado</label>
                <input
                  type="text"
                  value={form.produtoUtilizado}
                  onChange={e => setForm({ ...form, produtoUtilizado: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Dose / ha</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.dosePorHa}
                  onChange={e => setForm({ ...form, dosePorHa: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Área Aplicada (ha)</label>
                <input
                  type="number"
                  value={form.areaAplicadaHa}
                  onChange={e => setForm({ ...form, areaAplicadaHa: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Custo Total (R$)</label>
                <input
                  type="number"
                  value={form.custoTotalOperacaoR$}
                  onChange={e =>
                    setForm({ ...form, custoTotalOperacaoR$: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-black"
                />
              </div>

              <div className="col-span-2 flex justify-end gap-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-200 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                >
                  Registrar Operação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
