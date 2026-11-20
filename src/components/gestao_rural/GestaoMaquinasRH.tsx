import React, { useEffect, useState } from 'react';
import { Wrench, Plus, X } from 'lucide-react';
import {
  MaquinaImplementoRecord,
  ManutencaoPreventivaRecord,
  FuncionarioRuralRecord,
} from '../../types/gestaoRural';

interface GestaoMaquinasRHProps {
  maquinas: MaquinaImplementoRecord[];
  manutencoes: ManutencaoPreventivaRecord[];
  funcionarios: FuncionarioRuralRecord[];
  onAddMaquina: (maquina: MaquinaImplementoRecord) => void;
  onAddFuncionario: (func: FuncionarioRuralRecord) => void;
  onAddManutencao: (manut: ManutencaoPreventivaRecord) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';
const LABEL_CLASS = 'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const GestaoMaquinasRH: React.FC<GestaoMaquinasRHProps> = ({
  maquinas,
  manutencoes,
  funcionarios,
  onAddMaquina,
  onAddFuncionario,
  onAddManutencao,
}) => {
  const [activeTab, setActiveTab] = useState<'frota' | 'rh' | 'manutencao'>('frota');
  const [showMaqModal, setShowMaqModal] = useState(false);
  const [showFuncModal, setShowFuncModal] = useState(false);
  const [showManutModal, setShowManutModal] = useState(false);

  const [newMaq, setNewMaq] = useState<Partial<MaquinaImplementoRecord>>({
    codigo: `MAQ-${String(maquinas.length + 1).padStart(2, '0')}`,
    nome: '',
    tipo: 'Trator',
    marcaModelo: '',
    anoFabricacao: new Date().getFullYear(),
    horimetroOuKmAtual: 0,
    consumoMedioLitersHour: 12,
    status: 'ativo',
    proximaManutencaoHorimetro: 500,
    custoManutencaoAcumuladoR$: 0,
    observacoes: '',
  });

  const [newFunc, setNewFunc] = useState<Partial<FuncionarioRuralRecord>>({
    nome: '',
    cpf: '',
    cargoFuncao: 'Operador de Máquinas',
    salarioBaseR$: 2800,
    dataAdmissao: new Date().toISOString().split('T')[0],
    jornadaHorasDiarias: 8,
    horasExtrasMes: 0,
    status: 'ativo',
  });

  const [newManut, setNewManut] = useState<Partial<ManutencaoPreventivaRecord>>({
    maquinaId: maquinas[0]?.id || '',
    tipoManutencao: 'Preventiva',
    dataManutencao: new Date().toISOString().split('T')[0],
    horimetroNoAto: maquinas[0]?.horimetroOuKmAtual || 0,
    descricaoServico: '',
    pecasSubstituidas: '',
    oficinaOutrabalhador: '',
    custoTotalR$: 0,
  });

  useEffect(() => {
    if (!showMaqModal && !showFuncModal && !showManutModal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMaqModal(false);
        setShowFuncModal(false);
        setShowManutModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showMaqModal, showFuncModal, showManutModal]);

  const handleSaveMaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaq.nome?.trim()) return;
    const created: MaquinaImplementoRecord = {
      id: `maq-${Date.now()}`,
      codigo: newMaq.codigo || `MAQ-${String(maquinas.length + 1).padStart(2, '0')}`,
      nome: newMaq.nome.trim(),
      tipo: newMaq.tipo || 'Trator',
      marcaModelo: newMaq.marcaModelo?.trim() || 'Padrão',
      anoFabricacao: Number(newMaq.anoFabricacao) || new Date().getFullYear(),
      horimetroOuKmAtual: Number(newMaq.horimetroOuKmAtual) || 0,
      consumoMedioLitersHour: Number(newMaq.consumoMedioLitersHour) || 0,
      status: newMaq.status || 'ativo',
      proximaManutencaoHorimetro: Number(newMaq.proximaManutencaoHorimetro) || 500,
      custoManutencaoAcumuladoR$: Number(newMaq.custoManutencaoAcumuladoR$) || 0,
      observacoes: newMaq.observacoes || '',
    };
    onAddMaquina(created);
    setShowMaqModal(false);
    setNewMaq(prev => ({
      ...prev,
      codigo: `MAQ-${String(maquinas.length + 2).padStart(2, '0')}`,
      nome: '',
      marcaModelo: '',
    }));
  };

  const handleSaveFunc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFunc.nome?.trim()) return;
    const created: FuncionarioRuralRecord = {
      id: `func-${Date.now()}`,
      nome: newFunc.nome.trim(),
      cpf: newFunc.cpf || '',
      cargoFuncao: newFunc.cargoFuncao || 'Colaborador Rural',
      salarioBaseR$: Number(newFunc.salarioBaseR$) || 0,
      dataAdmissao: newFunc.dataAdmissao || new Date().toISOString().split('T')[0],
      treinamentosEPIs: ['NR-31'],
      episEntregues: [],
      jornadaHorasDiarias: Number(newFunc.jornadaHorasDiarias) || 8,
      horasExtrasMes: Number(newFunc.horasExtrasMes) || 0,
      status: newFunc.status || 'ativo',
      talhoesAtribuidos: [],
    };
    onAddFuncionario(created);
    setShowFuncModal(false);
    setNewFunc(prev => ({ ...prev, nome: '', cpf: '' }));
  };

  const handleSaveManut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManut.descricaoServico?.trim()) return;
    const maq = maquinas.find(m => m.id === newManut.maquinaId);
    const created: ManutencaoPreventivaRecord = {
      id: `mnt-${Date.now()}`,
      maquinaId: maq?.id || 'geral',
      maquinaNome: maq?.nome || 'Equipamento Geral',
      tipoManutencao: newManut.tipoManutencao || 'Preventiva',
      dataManutencao: newManut.dataManutencao || new Date().toISOString().split('T')[0],
      horimetroNoAto: Number(newManut.horimetroNoAto) || 0,
      descricaoServico: newManut.descricaoServico.trim(),
      pecasSubstituidas: newManut.pecasSubstituidas?.trim() || '—',
      oficinaOutrabalhador: newManut.oficinaOutrabalhador?.trim() || 'Oficina Interna',
      custoTotalR$: Number(newManut.custoTotalR$) || 0,
    };
    onAddManutencao(created);
    setShowManutModal(false);
    setNewManut(prev => ({ ...prev, descricaoServico: '', pecasSubstituidas: '', custoTotalR$: 0 }));
  };

  const openPrimaryModal = () => {
    if (activeTab === 'frota') setShowMaqModal(true);
    else if (activeTab === 'rh') setShowFuncModal(true);
    else setShowManutModal(true);
  };

  const primaryButtonLabel =
    activeTab === 'frota' ? 'Nova Máquina' : activeTab === 'rh' ? 'Novo Colaborador' : 'Nova Manutenção';

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Máquinas, Manutenção &amp; Equipe</span>
            </h2>
            <div className="flex items-center gap-3 border-l border-slate-200 dark:border-zinc-800 pl-4">
              {[
                { id: 'frota' as const, label: `Frota (${maquinas.length})` },
                { id: 'rh' as const, label: `Equipe (${funcionarios.length})` },
                { id: 'manutencao' as const, label: `Manutenções (${manutencoes.length})` },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs font-medium cursor-pointer transition-colors ${
                    activeTab === tab.id
                      ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={openPrimaryModal}
            className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{primaryButtonLabel}</span>
          </button>
        </div>

        {/* FROTA TABLE */}
        {activeTab === 'frota' &&
          (maquinas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                    <th className="py-2.5 px-4">Código / Equipamento</th>
                    <th className="py-2.5 px-4">Tipo / Modelo</th>
                    <th className="py-2.5 px-4 text-right">Horímetro</th>
                    <th className="py-2.5 px-4 text-right">Consumo</th>
                    <th className="py-2.5 px-4 text-right">Próx. Revisão</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {maquinas.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100">{m.nome}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">{m.codigo}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                        <div>{m.tipo}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">
                          {m.marcaModelo} · {m.anoFabricacao}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                        {m.horimetroOuKmAtual.toLocaleString('pt-BR')} h
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-zinc-300 tabular-nums">
                        {m.consumoMedioLitersHour} L/h
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-zinc-300 tabular-nums">
                        {m.proximaManutencaoHorimetro.toLocaleString('pt-BR')} h
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        <span
                          className={
                            m.status === 'ativo'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : m.status === 'em_manutencao'
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-slate-400 dark:text-zinc-500'
                          }
                        >
                          {m.status === 'ativo' ? 'Ativo' : m.status === 'em_manutencao' ? 'Em manutenção' : 'Inativo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma máquina cadastrada. Clique em <strong className="font-medium text-slate-700 dark:text-zinc-200">Nova Máquina</strong> para registrar sua frota.
            </div>
          ))}

        {/* RH TABLE */}
        {activeTab === 'rh' &&
          (funcionarios.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                    <th className="py-2.5 px-4">Colaborador</th>
                    <th className="py-2.5 px-4">Função</th>
                    <th className="py-2.5 px-4">Admissão</th>
                    <th className="py-2.5 px-4 text-right">Jornada</th>
                    <th className="py-2.5 px-4 text-right">Salário Base</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {funcionarios.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100">{f.nome}</div>
                        {f.cpf && <div className="text-[11px] text-slate-400 dark:text-zinc-500 tabular-nums">{f.cpf}</div>}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">{f.cargoFuncao}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-zinc-400 tabular-nums">
                        {new Date(`${f.dataAdmissao}T00:00:00`).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-zinc-300 tabular-nums">
                        {f.jornadaHorasDiarias}h/dia
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                        R$ {f.salarioBaseR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right capitalize font-medium text-emerald-700 dark:text-emerald-400">
                        {f.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhum colaborador cadastrado. Clique em <strong className="font-medium text-slate-700 dark:text-zinc-200">Novo Colaborador</strong> para cadastrar sua equipe.
            </div>
          ))}

        {/* MANUTENÇÕES TABLE */}
        {activeTab === 'manutencao' &&
          (manutencoes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                    <th className="py-2.5 px-4">Data</th>
                    <th className="py-2.5 px-4">Máquina / Tipo</th>
                    <th className="py-2.5 px-4">Serviço / Peças</th>
                    <th className="py-2.5 px-4">Responsável</th>
                    <th className="py-2.5 px-4 text-right">Horímetro</th>
                    <th className="py-2.5 px-4 text-right">Custo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {manutencoes.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-500 dark:text-zinc-400 tabular-nums whitespace-nowrap">
                        {new Date(`${m.dataManutencao}T00:00:00`).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100">{m.maquinaNome}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500">{m.tipoManutencao}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">
                        <div>{m.descricaoServico}</div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500">{m.pecasSubstituidas}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">{m.oficinaOutrabalhador}</td>
                      <td className="py-3 px-4 text-right text-slate-600 dark:text-zinc-300 tabular-nums">
                        {m.horimetroNoAto.toLocaleString('pt-BR')} h
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 dark:text-zinc-100 tabular-nums whitespace-nowrap">
                        R$ {m.custoTotalR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
              Nenhuma manutenção registrada. Clique em <strong className="font-medium text-slate-700 dark:text-zinc-200">Nova Manutenção</strong> para lançar revisões ou corretivas.
            </div>
          ))}
      </div>

      {/* MODAL MÁQUINA */}
      {showMaqModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setShowMaqModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Cadastrar Máquina / Implemento</h3>
              <button type="button" onClick={() => setShowMaqModal(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveMaq} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={LABEL_CLASS}>Nome / Identificação</label>
                <input type="text" placeholder="Ex: Trator 7200J" value={newMaq.nome} onChange={e => setNewMaq({ ...newMaq, nome: e.target.value })} className={INPUT_CLASS} required />
              </div>
              <div>
                <label className={LABEL_CLASS}>Tipo</label>
                <select value={newMaq.tipo} onChange={e => setNewMaq({ ...newMaq, tipo: e.target.value as MaquinaImplementoRecord['tipo'] })} className={INPUT_CLASS}>
                  <option value="Trator">Trator</option>
                  <option value="Pulverizador">Pulverizador</option>
                  <option value="Plantadeira">Plantadeira</option>
                  <option value="Colheitadeira">Colheitadeira</option>
                  <option value="Caminhão">Caminhão</option>
                  <option value="Implemento">Implemento</option>
                  <option value="Utilitário">Utilitário</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Marca / Modelo</label>
                <input type="text" placeholder="Ex: John Deere" value={newMaq.marcaModelo} onChange={e => setNewMaq({ ...newMaq, marcaModelo: e.target.value })} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Ano</label>
                <input type="number" value={newMaq.anoFabricacao} onChange={e => setNewMaq({ ...newMaq, anoFabricacao: Number(e.target.value) })} className={`${INPUT_CLASS} tabular-nums`} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Horímetro Atual (h)</label>
                <input type="number" value={newMaq.horimetroOuKmAtual} onChange={e => setNewMaq({ ...newMaq, horimetroOuKmAtual: Number(e.target.value) })} className={`${INPUT_CLASS} tabular-nums`} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Consumo Médio (L/h)</label>
                <input type="number" step="0.1" value={newMaq.consumoMedioLitersHour} onChange={e => setNewMaq({ ...newMaq, consumoMedioLitersHour: Number(e.target.value) })} className={`${INPUT_CLASS} tabular-nums`} />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setShowMaqModal(false)} className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer">
                  Cadastrar Máquina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FUNCIONÁRIO */}
      {showFuncModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setShowFuncModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Cadastrar Colaborador</h3>
              <button type="button" onClick={() => setShowFuncModal(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveFunc} className="p-5 space-y-3.5">
              <div>
                <label className={LABEL_CLASS}>Nome Completo</label>
                <input type="text" value={newFunc.nome} onChange={e => setNewFunc({ ...newFunc, nome: e.target.value })} className={INPUT_CLASS} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Cargo / Função</label>
                  <input type="text" value={newFunc.cargoFuncao} onChange={e => setNewFunc({ ...newFunc, cargoFuncao: e.target.value })} className={INPUT_CLASS} required />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Salário Base (R$)</label>
                  <input type="number" step="0.01" value={newFunc.salarioBaseR$} onChange={e => setNewFunc({ ...newFunc, salarioBaseR$: Number(e.target.value) })} className={`${INPUT_CLASS} tabular-nums`} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>CPF (opcional)</label>
                  <input type="text" value={newFunc.cpf} onChange={e => setNewFunc({ ...newFunc, cpf: e.target.value })} className={INPUT_CLASS} />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Data Admissão</label>
                  <input type="date" value={newFunc.dataAdmissao} onChange={e => setNewFunc({ ...newFunc, dataAdmissao: e.target.value })} className={`${INPUT_CLASS} tabular-nums`} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setShowFuncModal(false)} className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer">
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MANUTENÇÃO */}
      {showManutModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setShowManutModal(false);
          }}
        >
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Registrar Manutenção</h3>
              <button type="button" onClick={() => setShowManutModal(false)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveManut} className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className={LABEL_CLASS}>Máquina</label>
                <select value={newManut.maquinaId} onChange={e => setNewManut({ ...newManut, maquinaId: e.target.value })} className={INPUT_CLASS}>
                  <option value="">Equipamento Geral</option>
                  {maquinas.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nome} ({m.codigo})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Tipo</label>
                <select value={newManut.tipoManutencao} onChange={e => setNewManut({ ...newManut, tipoManutencao: e.target.value as ManutencaoPreventivaRecord['tipoManutencao'] })} className={INPUT_CLASS}>
                  <option value="Preventiva">Preventiva</option>
                  <option value="Corretiva">Corretiva</option>
                  <option value="Revisão Periódica">Revisão Periódica</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={LABEL_CLASS}>Serviço Realizado</label>
                <input type="text" placeholder="Ex: Troca de óleo hidráulico e filtros" value={newManut.descricaoServico} onChange={e => setNewManut({ ...newManut, descricaoServico: e.target.value })} className={INPUT_CLASS} required />
              </div>
              <div>
                <label className={LABEL_CLASS}>Peças Substituídas</label>
                <input type="text" placeholder="Ex: Filtro de óleo, correia" value={newManut.pecasSubstituidas} onChange={e => setNewManut({ ...newManut, pecasSubstituidas: e.target.value })} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Oficina / Mecânico</label>
                <input type="text" placeholder="Responsável" value={newManut.oficinaOutrabalhador} onChange={e => setNewManut({ ...newManut, oficinaOutrabalhador: e.target.value })} className={INPUT_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Horímetro no Ato (h)</label>
                <input type="number" value={newManut.horimetroNoAto} onChange={e => setNewManut({ ...newManut, horimetroNoAto: Number(e.target.value) })} className={`${INPUT_CLASS} tabular-nums`} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Custo Total (R$)</label>
                <input type="number" step="0.01" value={newManut.custoTotalR$} onChange={e => setNewManut({ ...newManut, custoTotalR$: Number(e.target.value) })} className={`${INPUT_CLASS} tabular-nums`} required />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setShowManutModal(false)} className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-600 dark:text-zinc-300 cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium cursor-pointer">
                  Registrar Manutenção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
