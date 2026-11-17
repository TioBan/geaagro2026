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

export const RecuperaProjetosView: React.FC<Props> = ({
  areaAtiva,
  propriedadeId = '',
  projetos,
  onSalvarProjetos
}) => {
  const projetosDaArea = areaAtiva
    ? projetos.filter(p => p.areaId === areaAtiva.id)
    : projetos;
  const [salvo, dispararSalvo] = useTimedFlag(3000);
  const [projetoSelecionado, setProjetoSelecionado] = useState<ProjetoRecuperacao | null>(() => {
    return projetosDaArea[0] || null;
  });

  useEffect(() => {
    const lista = areaAtiva ? projetos.filter(p => p.areaId === areaAtiva.id) : projetos;
    if (projetoSelecionado && lista.some(p => p.id === projetoSelecionado.id)) {
      return;
    }
    setProjetoSelecionado(lista[0] || null);
  }, [areaAtiva?.id, projetos]);

  const handleCriarProjeto = () => {
    const novo: ProjetoRecuperacao = {
      id: `proj-${Date.now()}`,
      areaId: areaAtiva?.id || '',
      propriedadeId,
      codigoProjeto: '',
      titulo: '',
      tipoProjeto: '' as TipoProjetoRecuperacao,
      dataElaboracao: '',
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

  const handleExcluirProjeto = (id: string) => {
    if (window.confirm('Deseja excluir este projeto de recuperação?')) {
      const novaLista = projetos.filter(p => p.id !== id);
      onSalvarProjetos(novaLista);
      const restante = areaAtiva ? novaLista.find(p => p.areaId === areaAtiva.id) : novaLista[0];
      setProjetoSelecionado(restante || null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Fase 4 • Planejamento & Projetos de Recuperação
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-emerald-600" />
            <span>
              Projetos Técnicos (PRAD / RAD){areaAtiva ? `: ${areaAtiva.nomeTalhao}` : ''}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Estratégias agronômicas, operações em campo, cronograma de execução e orçamentos
          </p>
        </div>

        <button
          type="button"
          onClick={handleCriarProjeto}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Elaborar Novo Projeto</span>
        </button>
      </div>

      {salvo && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Projeto técnico salvo com sucesso!</span>
        </div>
      )}

      {/* Seletor de Projetos */}
      {projetosDaArea.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {projetosDaArea.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setProjetoSelecionado(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                projetoSelecionado?.id === p.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{p.titulo.trim() || `Projeto #${idx + 1} (Sem título)`}</span>
              {p.codigoProjeto && (
                <span className="text-[10px] opacity-75 font-mono">({p.codigoProjeto})</span>
              )}
            </button>
          ))}
        </div>
      )}

      {projetoSelecionado ? (
        <form onSubmit={handleSalvarProjetoAtivo} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Dados Gerais do Projeto {projetoSelecionado.codigoProjeto ? `(${projetoSelecionado.codigoProjeto})` : ''}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExcluirProjeto(projetoSelecionado.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  title="Excluir projeto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Projeto</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Título do Projeto *</label>
                <input
                  type="text"
                  value={projetoSelecionado.titulo}
                  onChange={e => setProjetoSelecionado({ ...projetoSelecionado, titulo: e.target.value })}
                  placeholder="Ex: Projeto de Recuperação de Pastagem - Talhão 01"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Código do Projeto</label>
                <input
                  type="text"
                  value={projetoSelecionado.codigoProjeto}
                  onChange={e => setProjetoSelecionado({ ...projetoSelecionado, codigoProjeto: e.target.value })}
                  placeholder="Ex: PRAD-2025-001"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Área Tratada (ha)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={projetoSelecionado.areaTratadaHa || ''}
                  onChange={e => setProjetoSelecionado({ ...projetoSelecionado, areaTratadaHa: parseFloat(e.target.value) || 0 })}
                  placeholder="Ex: 25.0"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Tipo de Projeto *</label>
                <select
                  value={projetoSelecionado.tipoProjeto || ''}
                  onChange={e => setProjetoSelecionado({ ...projetoSelecionado, tipoProjeto: e.target.value as TipoProjetoRecuperacao })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
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
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Data de Início</label>
                <input
                  type="date"
                  value={projetoSelecionado.dataInicio}
                  onChange={e => setProjetoSelecionado({ ...projetoSelecionado, dataInicio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Status Executivo</label>
                <select
                  value={projetoSelecionado.statusProjeto}
                  onChange={e => setProjetoSelecionado({ ...projetoSelecionado, statusProjeto: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-emerald-600"
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
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Objetivo Principal do Projeto</label>
                <textarea
                  value={projetoSelecionado.objetivoPrincipal}
                  onChange={e => setProjetoSelecionado({ ...projetoSelecionado, objetivoPrincipal: e.target.value })}
                  placeholder="Descreva o objetivo técnico esperado para a recuperação da área..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Estratégia Técnica Adotada</label>
                <textarea
                  value={projetoSelecionado.estrategiaAdotada}
                  onChange={e => setProjetoSelecionado({ ...projetoSelecionado, estrategiaAdotada: e.target.value })}
                  placeholder="Descreva o manejo mecânico, correção química e cobertura vegetal adotada..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Operações Sequenciadas do Projeto */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-emerald-600" />
                <span>Operações Agronômicas Sequenciadas ({projetoSelecionado.operacoes.length})</span>
              </h3>
              <span className="text-xs font-bold text-emerald-600">
                Total Previsto: R$ {(projetoSelecionado.orcamentoTotalPrevistoR$ || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {projetoSelecionado.operacoes.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                Nenhuma operação cadastrada. Clique em "Adicionar Operação" para compor o plano operacional.
              </div>
            ) : (
              <div className="space-y-3">
                {projetoSelecionado.operacoes.map((op, idx) => (
                  <div key={op.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-1 text-center">
                      <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center mx-auto text-xs">
                        {op.ordem || idx + 1}
                      </span>
                    </div>

                    <div className="md:col-span-4 space-y-1">
                      <input
                        type="text"
                        value={op.titulo}
                        onChange={e => {
                          const ops = [...projetoSelecionado.operacoes];
                          ops[idx] = { ...ops[idx], titulo: e.target.value };
                          setProjetoSelecionado({ ...projetoSelecionado, operacoes: ops });
                        }}
                        placeholder="Título da operação (ex: Calagem e gessagem)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        value={op.descricao}
                        onChange={e => {
                          const ops = [...projetoSelecionado.operacoes];
                          ops[idx] = { ...ops[idx], descricao: e.target.value };
                          setProjetoSelecionado({ ...projetoSelecionado, operacoes: ops });
                        }}
                        placeholder="Descrição técnica da atividade..."
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] text-slate-600 dark:text-slate-300"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Equipamento / Máquina</label>
                      <input
                        type="text"
                        value={op.maquinarioEquipamento}
                        onChange={e => {
                          const ops = [...projetoSelecionado.operacoes];
                          ops[idx] = { ...ops[idx], maquinarioEquipamento: e.target.value };
                          setProjetoSelecionado({ ...projetoSelecionado, operacoes: ops });
                        }}
                        placeholder="Ex: Trator + Escarificador"
                        className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Custo Previsto (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={op.custoPrevistoR$ || ''}
                        onChange={e => {
                          const ops = [...projetoSelecionado.operacoes];
                          ops[idx] = { ...ops[idx], custoPrevistoR$: parseFloat(e.target.value) || 0 };
                          const novoTotal = ops.reduce((acc, o) => acc + (o.custoPrevistoR$ || 0), 0);
                          setProjetoSelecionado({ ...projetoSelecionado, operacoes: ops, orcamentoTotalPrevistoR$: novoTotal });
                        }}
                        placeholder="0,00"
                        className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-center justify-between gap-1">
                      <select
                        value={op.status}
                        onChange={e => {
                          const ops = [...projetoSelecionado.operacoes];
                          ops[idx] = { ...ops[idx], status: e.target.value as any };
                          setProjetoSelecionado({ ...projetoSelecionado, operacoes: ops });
                        }}
                        className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-900 dark:text-white"
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
                          setProjetoSelecionado({ ...projetoSelecionado, operacoes: ops, orcamentoTotalPrevistoR$: novoTotal });
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600"
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
                setProjetoSelecionado({ ...projetoSelecionado, operacoes: ops, orcamentoTotalPrevistoR$: novoTotal });
              }}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Adicionar Operação</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
          Nenhum projeto cadastrado. Clique em "Elaborar Novo Projeto" para iniciar o planejamento executivo do zero.
        </div>
      )}
    </div>
  );
};
