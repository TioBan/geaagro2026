import React, { useState, useMemo } from 'react';
import {
  FolderPlus,
  FlaskConical,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
  Edit3,
  Search,
  History,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
} from 'lucide-react';
import {
  EstatisticaProjeto,
  EstatisticaExperimento,
  EstatisticaHistoricoRegistro,
  TipoDelineamento,
} from '../types/estatistica';
import { estatisticaStorage } from '../storage/estatisticaStorage';
import { EXPERIMENTAL_DESIGNS_CATALOG } from '../statistics-engine/designs/experimentalDesigns';

interface ProjetosExperimentosViewProps {
  projetos: EstatisticaProjeto[];
  experimentos: EstatisticaExperimento[];
  historico: EstatisticaHistoricoRegistro[];
  selectedProjetoId: string | null;
  selectedExperimentoId: string | null;
  onSelectProjeto: (id: string) => void;
  onSelectExperimento: (id: string) => void;
  onRefresh: () => Promise<void>;
  onIrParaDados: () => void;
}

const CATEGORIAS_PROJETO = [
  'Experimentação Agrícola',
  'Solos & Nutrição de Plantas',
  'Fitossanidade & Nematologia',
  'Melhoramento Genético',
  'Zootecnia & Produção Animal',
  'Engenharia Agrícola & Irrigação',
  'Pesquisa Laboratorial / Acadêmica',
  'Perícia & Avaliação Rural',
];

export const ProjetosExperimentosView: React.FC<ProjetosExperimentosViewProps> = ({
  projetos,
  experimentos,
  historico,
  selectedProjetoId,
  selectedExperimentoId,
  onSelectProjeto,
  onSelectExperimento,
  onRefresh,
  onIrParaDados,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ativo' | 'arquivado' | 'todos'>('ativo');
  const [showProjModal, setShowProjModal] = useState(false);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [projForm, setProjForm] = useState({
    nome: '',
    categoria: CATEGORIAS_PROJETO[0],
    pesquisador: '',
    instituicao: '',
    culturaOuArea: '',
    localidade: '',
    descricao: '',
  });

  const [showExpModal, setShowExpModal] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expForm, setExpForm] = useState<{
    nome: string;
    objetivo: string;
    descricao: string;
    delineamento: TipoDelineamento;
    alphaPadrao: number;
  }>({
    nome: '',
    objetivo: '',
    descricao: '',
    delineamento: 'DIC',
    alphaPadrao: 0.05,
  });

  const [confirmDelete, setConfirmDelete] = useState<{
    tipo: 'projeto' | 'experimento';
    id: string;
    nome: string;
  } | null>(null);

  const [showAuditDrawer, setShowAuditDrawer] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const filteredProjetos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return projetos.filter((p) => {
      if (statusFilter !== 'todos' && p.status !== statusFilter) return false;
      if (!term) return true;
      return (
        p.nome.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term) ||
        p.pesquisador.toLowerCase().includes(term) ||
        p.culturaOuArea.toLowerCase().includes(term)
      );
    });
  }, [projetos, searchTerm, statusFilter]);

  const activeProjeto = projetos.find((p) => p.id === selectedProjetoId) || null;
  const experimentosDoProjeto = useMemo(
    () => experimentos.filter((e) => e.projetoId === activeProjeto?.id),
    [experimentos, activeProjeto?.id]
  );

  const openNewProj = () => {
    setEditingProjId(null);
    setProjForm({
      nome: '',
      categoria: CATEGORIAS_PROJETO[0],
      pesquisador: '',
      instituicao: '',
      culturaOuArea: '',
      localidade: '',
      descricao: '',
    });
    setShowProjModal(true);
  };

  const openEditProj = (p: EstatisticaProjeto) => {
    setEditingProjId(p.id);
    setProjForm({
      nome: p.nome,
      categoria: p.categoria,
      pesquisador: p.pesquisador,
      instituicao: p.instituicao,
      culturaOuArea: p.culturaOuArea,
      localidade: p.localidade,
      descricao: p.descricao,
    });
    setShowProjModal(true);
  };

  const handleSaveProjeto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projForm.nome.trim()) return;
    setBusy(true);
    try {
      const saved = await estatisticaStorage.salvarProjeto({
        id: editingProjId || undefined,
        ...projForm,
        tags: [],
        status: 'ativo',
      });
      await onRefresh();
      onSelectProjeto(saved.id);
      setShowProjModal(false);
      setFeedbackMsg({
        type: 'ok',
        text: `Projeto "${saved.nome}" salvo com segurança no armazenamento local OPFS.`,
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err?.message || 'Erro ao salvar projeto.' });
    } finally {
      setBusy(false);
    }
  };

  const openNewExp = () => {
    if (!activeProjeto) return;
    setEditingExpId(null);
    setExpForm({
      nome: '',
      objetivo: '',
      descricao: '',
      delineamento: 'DIC',
      alphaPadrao: 0.05,
    });
    setShowExpModal(true);
  };

  const openEditExp = (exp: EstatisticaExperimento) => {
    setEditingExpId(exp.id);
    setExpForm({
      nome: exp.nome,
      objetivo: exp.objetivo,
      descricao: exp.descricao,
      delineamento: exp.delineamento,
      alphaPadrao: exp.alphaPadrao,
    });
    setShowExpModal(true);
  };

  const handleSaveExperimento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjeto || !expForm.nome.trim()) return;
    setBusy(true);
    try {
      const existing = editingExpId ? experimentos.find((x) => x.id === editingExpId) : null;
      const saved = await estatisticaStorage.salvarExperimento({
        id: editingExpId || undefined,
        projetoId: activeProjeto.id,
        nome: expForm.nome,
        objetivo: expForm.objetivo,
        descricao: expForm.descricao,
        delineamento: expForm.delineamento,
        alphaPadrao: expForm.alphaPadrao,
        mapeamento: existing?.mapeamento || { respostaCols: [] },
        status: existing?.status || 'rascunho',
      });
      await onRefresh();
      onSelectExperimento(saved.id);
      setShowExpModal(false);
      setFeedbackMsg({
        type: 'ok',
        text: `Experimento "${saved.nome}" (${saved.delineamento}) salvo.`,
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err?.message || 'Erro ao salvar experimento.' });
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      if (confirmDelete.tipo === 'projeto') {
        await estatisticaStorage.excluirProjeto(confirmDelete.id);
      } else {
        await estatisticaStorage.excluirExperimento(confirmDelete.id);
      }
      await onRefresh();
      setFeedbackMsg({
        type: 'ok',
        text: `${confirmDelete.tipo === 'projeto' ? 'Projeto' : 'Experimento'} "${confirmDelete.nome}" excluído permanentemente.`,
      });
      setConfirmDelete(null);
    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err?.message || 'Falha ao excluir.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {feedbackMsg && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs font-medium ${
            feedbackMsg.type === 'ok'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="p-1 hover:opacity-75 cursor-pointer"
            aria-label="Fechar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Barra Superior de Pesquisa e Ações */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar projeto, pesquisador, cultura ou área..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800">
            {(['ativo', 'arquivado', 'todos'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'ativo' ? 'Ativos' : st === 'arquivado' ? 'Arquivados' : 'Todos'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAuditDrawer((v) => !v)}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>Trilha de Auditoria ({historico.length})</span>
          </button>
          <button
            type="button"
            onClick={openNewProj}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Estado Vazio Inicial (Sem Dados Fictícios) */}
      {projetos.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center mx-auto border border-slate-200 dark:border-zinc-700">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div className="max-w-lg mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nenhum projeto de pesquisa cadastrado
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Crie seu primeiro projeto experimental para organizar tratamentos, repetições, importar
              planilhas CSV/XLSX ou digitar dados de campo com persistência offline garantida em OPFS + WASM.
            </p>
          </div>
          <button
            type="button"
            onClick={openNewProj}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Criar Primeiro Projeto de Pesquisa</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Coluna Esquerda: Lista de Projetos */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Projetos de Pesquisa
              </h3>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-zinc-400">
                {filteredProjetos.length} registro(s)
              </span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-zinc-800 max-h-[540px] overflow-y-auto">
              {filteredProjetos.length === 0 ? (
                <p className="p-6 text-xs text-slate-500 dark:text-zinc-400 text-center">
                  Nenhum projeto corresponde ao filtro atual.
                </p>
              ) : (
                filteredProjetos.map((proj) => {
                  const isSel = proj.id === activeProjeto?.id;
                  const countExps = experimentos.filter((e) => e.projetoId === proj.id).length;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => onSelectProjeto(proj.id)}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSel
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/25'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {proj.nome}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-zinc-400">
                            <span>{proj.categoria}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{countExps} experimento(s)</span>
                            {proj.status === 'arquivado' && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                  Arquivado
                                </span>
                              </>
                            )}
                          </div>
                          {(proj.pesquisador || proj.culturaOuArea) && (
                            <p className="text-xs text-slate-600 dark:text-zinc-400 truncate">
                              {[proj.pesquisador, proj.culturaOuArea, proj.localidade]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          )}
                        </div>

                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => openEditProj(proj)}
                            title="Editar projeto"
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              setBusy(true);
                              await estatisticaStorage.duplicarProjeto(proj.id);
                              await onRefresh();
                              setBusy(false);
                            }}
                            title="Duplicar projeto e experimentos"
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await estatisticaStorage.arquivarProjeto(
                                proj.id,
                                proj.status !== 'arquivado'
                              );
                              await onRefresh();
                            }}
                            title={proj.status === 'arquivado' ? 'Reativar projeto' : 'Arquivar projeto'}
                            className="p-1.5 text-slate-500 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            {proj.status === 'arquivado' ? (
                              <ArchiveRestore className="w-3.5 h-3.5" />
                            ) : (
                              <Archive className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDelete({ tipo: 'projeto', id: proj.id, nome: proj.nome })
                            }
                            title="Excluir projeto"
                            className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Coluna Direita: Experimentos do Projeto Ativo */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {activeProjeto
                    ? `Experimentos — ${activeProjeto.nome}`
                    : 'Selecione um Projeto'}
                </h3>
                {activeProjeto && (
                  <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                    {activeProjeto.descricao || activeProjeto.categoria}
                  </p>
                )}
              </div>
              {activeProjeto && (
                <button
                  type="button"
                  onClick={openNewExp}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Experimento</span>
                </button>
              )}
            </div>

            {!activeProjeto ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
                Selecione um projeto à esquerda para visualizar ou criar experimentos.
              </div>
            ) : experimentosDoProjeto.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Este projeto ainda não possui experimentos cadastrados.
                </p>
                <button
                  type="button"
                  onClick={openNewExp}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Primeiro Experimento</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-zinc-800">
                {experimentosDoProjeto.map((exp) => {
                  const isSel = exp.id === selectedExperimentoId;
                  const metaDel = EXPERIMENTAL_DESIGNS_CATALOG[exp.delineamento];
                  return (
                    <div
                      key={exp.id}
                      onClick={() => onSelectExperimento(exp.id)}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSel
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/25'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {exp.nome}
                            </span>
                            {isSel && (
                              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                                · Ativo
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-zinc-400">
                            <span>{metaDel?.sigla || exp.delineamento}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              α = {(exp.alphaPadrao * 100).toFixed(1)}%
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono">
                              {exp.mapeamento.respostaCols?.length
                                ? `Resposta: ${exp.mapeamento.respostaCols.join(', ')}`
                                : 'Variáveis pendentes'}
                            </span>
                          </div>
                          {exp.objetivo && (
                            <p className="text-xs text-slate-600 dark:text-zinc-400">
                              {exp.objetivo}
                            </p>
                          )}
                        </div>

                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onSelectExperimento(exp.id);
                              onIrParaDados();
                            }}
                            className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900/50 whitespace-nowrap cursor-pointer"
                          >
                            Abrir Dados
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditExp(exp)}
                            title="Editar experimento"
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await estatisticaStorage.duplicarExperimento(exp.id);
                              await onRefresh();
                            }}
                            title="Duplicar experimento"
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDelete({ tipo: 'experimento', id: exp.id, nome: exp.nome })
                            }
                            title="Excluir experimento"
                            className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Painel de Auditoria / Histórico */}
      {showAuditDrawer && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Histórico & Auditoria de Operações Científicas
            </h4>
            <button
              type="button"
              onClick={() => setShowAuditDrawer(false)}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Fechar
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800">
            {historico.length === 0 ? (
              <p className="p-4 text-xs text-slate-500">Nenhuma operação registrada ainda.</p>
            ) : (
              historico.slice(0, 60).map((h) => (
                <div
                  key={h.id}
                  className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      {h.entidade}
                    </span>
                    <span className="mx-1.5 text-slate-400">·</span>
                    <span className="text-slate-600 dark:text-zinc-400">{h.descricao}</span>
                  </div>
                  <span className="font-mono tabular-nums text-[11px] text-slate-400 shrink-0">
                    {new Date(h.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Criar/Editar Projeto */}
      {showProjModal && (
        <div className="fixed inset-0 z-[1400] bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProjeto}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingProjId ? 'Editar Projeto de Pesquisa' : 'Novo Projeto de Pesquisa'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProjModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Nome do Projeto *
                </label>
                <input
                  required
                  value={projForm.nome}
                  onChange={(e) => setProjForm({ ...projForm, nome: e.target.value })}
                  placeholder="Ex: Ensaio de Doses de Nitrogênio em Milho Safrinha"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Categoria / Área
                </label>
                <select
                  value={projForm.categoria}
                  onChange={(e) => setProjForm({ ...projForm, categoria: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white"
                >
                  {CATEGORIAS_PROJETO.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Cultura / Objeto de Estudo
                </label>
                <input
                  value={projForm.culturaOuArea}
                  onChange={(e) => setProjForm({ ...projForm, culturaOuArea: e.target.value })}
                  placeholder="Ex: Soja, Bovinos Nelore, Latossolo..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Pesquisador / Responsável
                </label>
                <input
                  value={projForm.pesquisador}
                  onChange={(e) => setProjForm({ ...projForm, pesquisador: e.target.value })}
                  placeholder="Nome completo / CREA / CRMV"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Instituição / Fazenda / Laboratório
                </label>
                <input
                  value={projForm.instituicao}
                  onChange={(e) => setProjForm({ ...projForm, instituicao: e.target.value })}
                  placeholder="Universidade, Fazenda Experimental..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Localidade / Safra
                </label>
                <input
                  value={projForm.localidade}
                  onChange={(e) => setProjForm({ ...projForm, localidade: e.target.value })}
                  placeholder="Município/UF, Safra 2025/2026"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Descrição / Protocolo Experimental
                </label>
                <textarea
                  rows={2}
                  value={projForm.descricao}
                  onChange={(e) => setProjForm({ ...projForm, descricao: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowProjModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {busy ? 'Salvando...' : 'Salvar Projeto'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Criar/Editar Experimento */}
      {showExpModal && (
        <div className="fixed inset-0 z-[1400] bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveExperimento}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingExpId ? 'Editar Experimento' : 'Novo Experimento Científico'}
              </h3>
              <button
                type="button"
                onClick={() => setShowExpModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Nome do Experimento *
                </label>
                <input
                  required
                  value={expForm.nome}
                  onChange={(e) => setExpForm({ ...expForm, nome: e.target.value })}
                  placeholder="Ex: Experimento 01 — Produtividade de Grãos"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Delineamento Experimental
                  </label>
                  <select
                    value={expForm.delineamento}
                    onChange={(e) =>
                      setExpForm({ ...expForm, delineamento: e.target.value as TipoDelineamento })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white"
                  >
                    {Object.values(EXPERIMENTAL_DESIGNS_CATALOG).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.sigla} — {d.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Nível de Significância Padrão (α)
                  </label>
                  <select
                    value={expForm.alphaPadrao}
                    onChange={(e) =>
                      setExpForm({ ...expForm, alphaPadrao: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white font-mono"
                  >
                    <option value={0.01}>1% (α = 0,01)</option>
                    <option value={0.05}>5% (α = 0,05)</option>
                    <option value={0.1}>10% (α = 0,10)</option>
                  </select>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg space-y-1">
                <p className="font-semibold text-slate-700 dark:text-zinc-300">
                  {EXPERIMENTAL_DESIGNS_CATALOG[expForm.delineamento].nome}
                </p>
                <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400">
                  {EXPERIMENTAL_DESIGNS_CATALOG[expForm.delineamento].formulaModelo}
                </p>
                <p className="text-slate-500 dark:text-zinc-400">
                  {EXPERIMENTAL_DESIGNS_CATALOG[expForm.delineamento].descricao}
                </p>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Objetivo / Hipótese
                </label>
                <input
                  value={expForm.objetivo}
                  onChange={(e) => setExpForm({ ...expForm, objetivo: e.target.value })}
                  placeholder="Ex: Avaliar resposta produtiva à adubação..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExpModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {busy ? 'Salvando...' : 'Salvar Experimento'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Confirmação de Exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[1500] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900 rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Confirmar Exclusão Permanente
                </h4>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Deseja realmente excluir o {confirmDelete.tipo}{' '}
                  <strong>"{confirmDelete.nome}"</strong>? Todos os conjuntos de dados, arquivos OPFS
                  vinculados, análises e gráficos associados serão removidos permanentemente.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={busy}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                {busy ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
