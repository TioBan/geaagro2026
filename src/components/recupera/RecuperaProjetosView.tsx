import React, { useState, useEffect } from 'react';
import {
  AreaDegradadaItem,
  ProjetoRecuperacao,
  TipoProjetoRecuperacao,
  OperacaoRecuperacao
} from '../../types/recupera';
import { useTimedFlag } from './useTimedFlag';
import {
  FolderKanban,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ListOrdered
} from 'lucide-react';

interface Props {
  areaAtiva?: AreaDegradadaItem;
  propriedadeId?: string;
  projetos: ProjetoRecuperacao[];
  onSalvarProjetos: (projetosAtualizados: ProjetoRecuperacao[]) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition';

const INPUT_WHITE_CLASS =
  'w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition';

export const RecuperaProjetosView: React.FC<Props> = ({
  areaAtiva,
  propriedadeId = '',
  projetos,
  onSalvarProjetos
}) => {
  const projetosDaArea = areaAtiva ? projetos.filter(p => p.areaId === areaAtiva.id) : projetos;
  const [salvo, dispararSalvo] = useTimedFlag(3000);
  const [confirmandoExcluirId, setConfirmandoExcluirId] = useState<string | null>(null);
  const [projetoSelecionado, setProjetoSelecionado] = useState<ProjetoRecuperacao | null>(() => {
    return projetosDaArea[0] || null;
  });

  useEffect(() => {
    const lista = areaAtiva ? projetos.filter(p => p.areaId === areaAtiva.id) : projetos;
    if (projetoSelecionado && lista.some(p => p.id === projetoSelecionado.id)) {
      return;
    }
    setProjetoSelecionado(lista[0] || null);
    setConfirmandoExcluirId(null);
  }, [areaAtiva?.id, projetos]);

  const handleCriarProjeto = () => {
    const novo: ProjetoRecuperacao = {
      id: `proj-${Date.now()}`,
      areaId: areaAtiva?.id || '',
      propriedadeId,
      codigoProjeto: '',
      titulo: '',
      tipoProjeto: '' as TipoProjetoRecuperacao,
      dataElaboracao: new Date().toISOString().split('T')[0],
      dataInicio: '',
      prazoMeses: 0,
      responsavelTecnico: '',
      creaNumero: '',
      artNumero: '',
      objetivoPrincipal: '',
      justificativaTecnica: '',
      areaTratadaHa: areaAtiva?.areaHa || 0,
      estrategiaAdotada: '',
      operacoes: [],
      orcamentoTotalPrevistoR$: 0,
      orcamentoTotalRealizadoR$: 0,
      statusProjeto: 'planejado',
      indicadoresSucesso: [],
      anexosUrls: []
    };

    const novaLista = [...projetos, novo];
    onSalvarProjetos(novaLista);
    setProjetoSelecionado(novo);
    setConfirmandoExcluirId(null);
  };

  const handleSalvarProjetoAtivo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projetoSelecionado) return;

    const existe = projetos.some(p => p.id === projetoSelecionado.id);
    const novaLista = existe
      ? projetos.map(p => (p.id === projetoSelecionado.id ? projetoSelecionado : p))
      : [...projetos, projetoSelecionado];
    onSalvarProjetos(novaLista);
    dispararSalvo();
  };

  const handleConfirmarExcluirProjeto = (id: string) => {
    const novaLista = projetos.filter(p => p.id !== id);
    onSalvarProjetos(novaLista);
    const restante = areaAtiva ? novaLista.find(p => p.areaId === areaAtiva.id) : novaLista[0];
    setProjetoSelecionado(restante || null);
    setConfirmandoExcluirId(null);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Fase 4 • Planejamento & Projetos de Recuperação
          </span>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 mt-0.5">
            <FolderKanban className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              Projetos Técnicos (PRAD / RAD){areaAtiva ? `: ${areaAtiva.nomeTalhao}` : ''}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Estratégias agronômicas, operações em campo, cronograma de execução e orçamentos
          </p>
        </div>

        <button
          type="button"
          onClick={handleCriarProjeto}
          className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Elaborar Novo Projeto</span>
        </button>
      </div>

      {salvo && (
        <div className="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Projeto técnico salvo com sucesso.</span>
        </div>
      )}

      {/* Seletor de Projetos */}
      {projetosDaArea.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {projetosDaArea.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setProjetoSelecionado(p);
                setConfirmandoExcluirId(null);
              }}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap border ${
                projetoSelecionado?.id === p.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{p.titulo.trim() || `Projeto #${idx + 1} (Sem título)`}</span>
              {p.codigoProjeto && <span className="text-[10px] opacity-80 font-mono">({p.codigoProjeto})</span>}
            </button>
          ))}
        </div>
      )}

      {projetoSelecionado ? (
        <form onSubmit={handleSalvarProjetoAtivo} className="space-y-5">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                Dados Gerais do Projeto {projetoSelecionado.codigoProjeto ? `(${projetoSelecionado.codigoProjeto})` : ''}
              </h3>

              <div className="flex items-center gap-2">
                {confirmandoExcluirId === projetoSelecionado.id ? (
                  <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg px-2 h-8">
                    <span className="text-[11px] font-medium text-rose-700 dark:text-rose-300">Excluir projeto?</span>
                    <button
                      type="button"
                      onClick={() => handleConfirmarExcluirProjeto(projetoSelecionado.id)}
                      className="px-1.5 py-0.5 text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded"
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmandoExcluirId(null)}
                      className="px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-200/70 dark:hover:bg-zinc-800 rounded"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmandoExcluirId(projetoSelecionado.id)}
                    className="h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg border border-slate-200 dark:border-zinc-700 hover:border-rose-200 dark:hover:border-rose-900/60 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition"
                    title="Excluir projeto"
                    aria-label="Excluir projeto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="submit"
                  className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs inline-flex items-center gap-1.5 transition whitespace-nowrap"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Projeto</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Título do Projeto *</label>
                <input
                  type="text"
                  value={projetoSelecionado.titulo}
                  onChange={e => setProjetoSelecionado(prev => (prev ? { ...prev, titulo: e.target.value } : null))}
                  placeholder="Ex: Projeto de Recuperação de Pastagem - Talhão 01"
                  required
                  className={`${INPUT_CLASS} font-medium`}
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Código do Projeto</label>
                <input
                  type="text"
                  value={projetoSelecionado.codigoProjeto}
                  onChange={e =>
                    setProjetoSelecionado(prev => (prev ? { ...prev, codigoProjeto: e.target.value } : null))
                  }
                  placeholder="Ex: PRAD-2025-001"
                  className={`${INPUT_CLASS} font-mono`}
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Área Tratada (ha)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={projetoSelecionado.areaTratadaHa || ''}
                  onChange={e =>
                    setProjetoSelecionado(prev =>
                      prev ? { ...prev, areaTratadaHa: parseFloat(e.target.value) || 0 } : null
                    )
                  }
                  placeholder="Ex: 25.0"
                  className={`${INPUT_CLASS} font-semibold tabular-nums`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Tipo de Projeto *</label>
                <select
                  value={projetoSelecionado.tipoProjeto || ''}
                  onChange={e =>
                    setProjetoSelecionado(prev =>
                      prev ? { ...prev, tipoProjeto: e.target.value as TipoProjetoRecuperacao } : null
                    )
                  }
                  required
                  className={INPUT_CLASS}
                >
                  <option value="">Selecione a modalidade do projeto...</option>
                  <option value="recuperacao_pastagens">1. Recuperação de Pastagens Degradadas</option>
                  <option value="solos_compactados">2. Recuperação de Solos Compactados</option>
                  <option value="areas_erosivas">3. Recuperação de Áreas Erosivas (Voçorocas)</option>
                  <option value="recuperacao_fertilidade">4. Recuperação da Fertilidade & Acidez</option>
                  <option value="plantas_cobertura">5. Plantas de Cobertura & Adubação Verde</option>
                  <option value="sistemas_agroflorestais">6. Sistemas Agroflorestais (SAF)</option>
                  <option value="integracao_lavoura_pecuaria">7. Integração Lavoura-Pecuária (ILP)</option>
                  <option value="integracao_lavoura_pecuaria_floresta">8. Integração Lavoura-Pecuária-Floresta (ILPF)</option>
                  <option value="regeneracao_natural">9. Regeneração Natural Assistida</option>
                  <option value="recuperacao_app">10. Recomposição de APP (Mata Ciliar)</option>
                  <option value="recuperacao_reserva_legal">11. Recomposição de Reserva Legal</option>
                  <option value="recuperacao_ambiental">12. PRAD - Plano de Recuperação Ambiental</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Data de Início</label>
                <input
                  type="date"
                  value={projetoSelecionado.dataInicio}
                  onChange={e => setProjetoSelecionado(prev => (prev ? { ...prev, dataInicio: e.target.value } : null))}
                  className={`${INPUT_CLASS} tabular-nums`}
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Status Executivo</label>
                <select
                  value={projetoSelecionado.statusProjeto}
                  onChange={e =>
                    setProjetoSelecionado(prev =>
                      prev
                        ? { ...prev, statusProjeto: e.target.value as ProjetoRecuperacao['statusProjeto'] }
                        : null
                    )
                  }
                  className={`${INPUT_CLASS} font-semibold text-emerald-700 dark:text-emerald-400`}
                >
                  <option value="planejado">Planejado</option>
                  <option value="em_implantacao">Em Implantação</option>
                  <option value="em_manutencao">Em Manutenção / Tratamento</option>
                  <option value="recuperado">Área Recuperada</option>
                  <option value="concluido">Concluído & Homologado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">
                  Objetivo Principal do Projeto
                </label>
                <textarea
                  value={projetoSelecionado.objetivoPrincipal}
                  onChange={e =>
                    setProjetoSelecionado(prev => (prev ? { ...prev, objetivoPrincipal: e.target.value } : null))
                  }
                  placeholder="Descreva o objetivo técnico esperado para a recuperação da área..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">
                  Estratégia Técnica Adotada
                </label>
                <textarea
                  value={projetoSelecionado.estrategiaAdotada}
                  onChange={e =>
                    setProjetoSelecionado(prev => (prev ? { ...prev, estrategiaAdotada: e.target.value } : null))
                  }
                  placeholder="Descreva o manejo mecânico, correção química e cobertura vegetal adotada..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Operações Sequenciadas do Projeto */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="tabular-nums">
                  Operações Agronômicas Sequenciadas ({projetoSelecionado.operacoes.length})
                </span>
              </h3>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                Total Previsto: R${' '}
                {(projetoSelecionado.orcamentoTotalPrevistoR$ || 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                })}
              </span>
            </div>

            {projetoSelecionado.operacoes.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800">
                Nenhuma operação cadastrada. Clique em "Adicionar Operação" para compor o plano operacional.
              </div>
            ) : (
              <div className="space-y-2.5">
                {projetoSelecionado.operacoes.map((op, idx) => (
                  <div
                    key={op.id}
                    className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center"
                  >
                    <div className="md:col-span-1 text-center">
                      <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-semibold flex items-center justify-center mx-auto text-[11px] tabular-nums">
                        {op.ordem || idx + 1}
                      </span>
                    </div>

                    <div className="md:col-span-4 space-y-1.5">
                      <input
                        type="text"
                        value={op.titulo}
                        onChange={e => {
                          const ops = projetoSelecionado.operacoes.map((item, i) =>
                            i === idx ? { ...item, titulo: e.target.value } : item
                          );
                          setProjetoSelecionado({ ...projetoSelecionado, operacoes: ops });
                        }}
                        placeholder="Título da operação (ex: Calagem e gessagem)"
                        className={`${INPUT_WHITE_CLASS} font-medium`}
                      />
                      <input
                        type="text"
                        value={op.descricao}
                        onChange={e => {
                          const ops = projetoSelecionado.operacoes.map((item, i) =>
                            i === idx ? { ...item, descricao: e.target.value } : item
                          );
                          setProjetoSelecionado({ ...projetoSelecionado, operacoes: ops });
                        }}
                        placeholder="Descrição técnica da atividade..."
                        className={`${INPUT_WHITE_CLASS} text-[11px] text-slate-600 dark:text-zinc-300`}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[10px] text-slate-500 dark:text-zinc-400 mb-0.5">
                        Equipamento / Máquina
                      </label>
                      <input
                        type="text"
                        value={op.maquinarioEquipamento}
                        onChange={e => {
                          const ops = projetoSelecionado.operacoes.map((item, i) =>
                            i === idx ? { ...item, maquinarioEquipamento: e.target.value } : item
                          );
                          setProjetoSelecionado({ ...projetoSelecionado, operacoes: ops });
                        }}
                        placeholder="Ex: Trator + Escarificador"
                        className={INPUT_WHITE_CLASS}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-500 dark:text-zinc-400 mb-0.5">
                        Custo Previsto (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={op.custoPrevistoR$ || ''}
                        onChange={e => {
                          const ops = projetoSelecionado.operacoes.map((item, i) =>
                            i === idx ? { ...item, custoPrevistoR$: parseFloat(e.target.value) || 0 } : item
                          );
                          const novoTotal = ops.reduce((acc, o) => acc + (o.custoPrevistoR$ || 0), 0);
                          setProjetoSelecionado({
                            ...projetoSelecionado,
                            operacoes: ops,
                            orcamentoTotalPrevistoR$: novoTotal
                          });
                        }}
                        placeholder="0,00"
                        className={`${INPUT_WHITE_CLASS} font-semibold tabular-nums`}
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center justify-between gap-1.5">
                      <select
                        value={op.status}
                        onChange={e => {
                          const ops = projetoSelecionado.operacoes.map((item, i) =>
                            i === idx ? { ...item, status: e.target.value as OperacaoRecuperacao['status'] } : item
                          );
                          setProjetoSelecionado({ ...projetoSelecionado, operacoes: ops });
                        }}
                        className={`${INPUT_WHITE_CLASS} text-[11px] font-medium`}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="concluida">Concluída</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          const ops = projetoSelecionado.operacoes.filter((_, i) => i !== idx);
                          const novoTotal = ops.reduce((acc, o) => acc + (o.custoPrevistoR$ || 0), 0);
                          setProjetoSelecionado({
                            ...projetoSelecionado,
                            operacoes: ops,
                            orcamentoTotalPrevistoR$: novoTotal
                          });
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0"
                        aria-label="Remover operação"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                const novaOp: OperacaoRecuperacao = {
                  id: `op-${Date.now()}`,
                  ordem: projetoSelecionado.operacoes.length + 1,
                  etapa: 'manejo_tratos',
                  titulo: '',
                  descricao: '',
                  maquinarioEquipamento: '',
                  insumosUtilizados: '',
                  maoDeObraHomemDia: 0,
                  dataInicioPrevista: '',
                  dataFimPrevista: '',
                  status: 'pendente',
                  custoPrevistoR$: 0,
                  custoRealizadoR$: 0
                };
                const ops = [...projetoSelecionado.operacoes, novaOp];
                const novoTotal = ops.reduce((acc, o) => acc + (o.custoPrevistoR$ || 0), 0);
                setProjetoSelecionado({
                  ...projetoSelecionado,
                  operacoes: ops,
                  orcamentoTotalPrevistoR$: novoTotal
                });
              }}
              className="h-8 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-medium rounded-lg text-xs inline-flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Adicionar Operação</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-10 text-center text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-xs space-y-3">
          <p>Nenhum projeto cadastrado. Clique em "Elaborar Novo Projeto" para iniciar o planejamento executivo.</p>
          <button
            type="button"
            onClick={handleCriarProjeto}
            className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs inline-flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Elaborar Novo Projeto</span>
          </button>
        </div>
      )}
    </div>
  );
};
