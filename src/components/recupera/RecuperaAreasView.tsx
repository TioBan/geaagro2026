import React, { useState } from 'react';
import { AreaDegradadaItem, TipoDegradacaoPrincipal, GrauSeveridadeDegradacao } from '../../types/recupera';
import { useTimedFlag } from './useTimedFlag';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Layers,
  Save,
  X
} from 'lucide-react';

interface Props {
  areas: AreaDegradadaItem[];
  propriedadeId?: string;
  areaAtivaId: string;
  onSelecionarArea: (areaId: string) => void;
  onSalvarAreas: (areasAtualizadas: AreaDegradadaItem[]) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition';

const SEVERIDADE_STYLES: Record<string, string> = {
  muito_severa: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60',
  severa: 'bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/60',
  moderada: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
  leve: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
};

export const RecuperaAreasView: React.FC<Props> = ({
  areas,
  propriedadeId = '',
  areaAtivaId,
  onSelecionarArea,
  onSalvarAreas
}) => {
  const [editandoArea, setEditandoArea] = useState<AreaDegradadaItem | null>(null);
  const [confirmandoExcluirId, setConfirmandoExcluirId] = useState<string | null>(null);
  const [salvo, dispararSalvo] = useTimedFlag(3000);

  const handleIniciarCriacao = () => {
    const nova: AreaDegradadaItem = {
      id: `area-recupera-${Date.now()}`,
      propriedadeId,
      nomeTalhao: '',
      codigoIdentificacao: '',
      areaHa: 0,
      tipoUtilizacaoAnterior: '',
      tipoUtilizacaoAtual: '',
      tipoDegradacao: 'pastagem_degradada',
      grauSeveridade: 'moderada',
      dataIdentificacao: new Date().toISOString().split('T')[0],
      historicoUsoManejo: '',
      coordenadasCentroid: {
        latitude: 0,
        longitude: 0,
        altitude: 0,
        precisaoM: 0
      },
      verticesPoligono: [],
      responsavelTecnico: '',
      creaNumero: '',
      fotografias: [],
      statusRecuperacao: 'diagnostico',
      observacoes: ''
    };
    setEditandoArea(nova);
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editandoArea) return;

    const existe = areas.some(a => a.id === editandoArea.id);
    const lista = existe
      ? areas.map(a => (a.id === editandoArea.id ? editandoArea : a))
      : [...areas, editandoArea];

    onSalvarAreas(lista);
    onSelecionarArea(editandoArea.id);
    setEditandoArea(null);
    dispararSalvo();
  };

  const handleConfirmarExcluir = (id: string) => {
    const novaLista = areas.filter(a => a.id !== id);
    onSalvarAreas(novaLista);
    if (areaAtivaId === id) {
      onSelecionarArea(novaLista[0]?.id || '');
    }
    setConfirmandoExcluirId(null);
  };

  const isEditandoExistente = editandoArea ? areas.some(a => a.id === editandoArea.id) : false;

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Cadastro & Delimitação de Áreas Degradadas</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Múltiplos talhões, histórico de exploração, tipo e grau de severidade da degradação
          </p>
        </div>

        <button
          type="button"
          onClick={handleIniciarCriacao}
          className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar Nova Área</span>
        </button>
      </div>

      {salvo && (
        <div className="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Lista de áreas atualizada com sucesso.</span>
        </div>
      )}

      {/* Formulário de Edição / Criação */}
      {editandoArea && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-emerald-500/70 dark:border-emerald-600/70 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Edit2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isEditandoExistente ? 'Editar Área Degradada' : 'Nova Área Degradada'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setEditandoArea(null)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-md transition"
              aria-label="Fechar formulário"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSalvarEdicao} className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Nome do Talhão / Setor *
              </label>
              <input
                type="text"
                value={editandoArea.nomeTalhao}
                onChange={e => setEditandoArea({ ...editandoArea, nomeTalhao: e.target.value })}
                required
                className={INPUT_CLASS}
                placeholder="Ex: Talhão 02 - Encosta Sul"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Código de Identificação *
              </label>
              <input
                type="text"
                value={editandoArea.codigoIdentificacao}
                onChange={e => setEditandoArea({ ...editandoArea, codigoIdentificacao: e.target.value })}
                required
                className={`${INPUT_CLASS} font-mono`}
                placeholder="Ex: TL-02"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Área em Hectares (ha) *
              </label>
              <input
                type="number"
                step="0.01"
                value={editandoArea.areaHa}
                onChange={e => setEditandoArea({ ...editandoArea, areaHa: parseFloat(e.target.value) || 0 })}
                required
                className={`${INPUT_CLASS} font-semibold tabular-nums`}
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Tipo de Degradação Principal *
              </label>
              <select
                value={editandoArea.tipoDegradacao}
                onChange={e => setEditandoArea({ ...editandoArea, tipoDegradacao: e.target.value as TipoDegradacaoPrincipal })}
                className={INPUT_CLASS}
              >
                <option value="pastagem_degradada">Pastagem Degradada</option>
                <option value="solo_compactado">Solo Compactado / Adensado</option>
                <option value="erosao_laminar_sulcos">Erosão Laminar e em Sulcos</option>
                <option value="ravina_vocoroca">Ravinas e Voçorocas</option>
                <option value="baixa_fertilidade_acidez">Baixa Fertilidade & Acidez Extrema</option>
                <option value="salinizacao_sodicidade">Salinização / Sodicidade</option>
                <option value="perda_materia_organica">Perda Severa de Matéria Orgânica</option>
                <option value="app_degradada">Degradação em APP (Mata Ciliar)</option>
                <option value="reserva_legal_degradada">Reserva Legal Degradada</option>
                <option value="nascente_assoreada">Nascente Assoreada / Desprotegida</option>
                <option value="vegetacao_nativa_suprimida">Vegetação Nativa Suprimida</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Grau de Severidade *
              </label>
              <select
                value={editandoArea.grauSeveridade}
                onChange={e => setEditandoArea({ ...editandoArea, grauSeveridade: e.target.value as GrauSeveridadeDegradacao })}
                className={`${INPUT_CLASS} font-medium`}
              >
                <option value="leve">Leve (Recuperação Rápida / Manejo)</option>
                <option value="moderada">Moderada (Correção Química e Sobressemeadura)</option>
                <option value="severa">Severa (Reforma Total / Descompactação Mecânica)</option>
                <option value="muito_severa">Muito Severa (Voçorocas / Terraços / Reconstituição)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Status Atual da Recuperação *
              </label>
              <select
                value={editandoArea.statusRecuperacao}
                onChange={e =>
                  setEditandoArea({
                    ...editandoArea,
                    statusRecuperacao: e.target.value as AreaDegradadaItem['statusRecuperacao']
                  })
                }
                className={`${INPUT_CLASS} font-medium`}
              >
                <option value="diagnostico">1. Em Diagnóstico</option>
                <option value="planejamento">2. Em Planejamento / Projeto</option>
                <option value="em_execucao">3. Em Execução de Obras</option>
                <option value="em_monitoramento">4. Em Monitoramento IGRA</option>
                <option value="recuperada">5. Área Recuperada / Estável</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Histórico de Uso, Culturas Anteriores e Manejo
              </label>
              <textarea
                value={editandoArea.historicoUsoManejo}
                onChange={e => setEditandoArea({ ...editandoArea, historicoUsoManejo: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                placeholder="Descreva anos de cultivo contínuo, ausência de calagem, queima de palhada, superpastejo..."
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditandoArea(null)}
                className="h-8 px-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 font-medium rounded-lg text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs inline-flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Área</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de Áreas Cadastradas */}
      {areas.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-10 border border-slate-200/80 dark:border-zinc-800 text-center space-y-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center mx-auto">
            <Layers className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Nenhuma área degradada cadastrada</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
              Cadastre o primeiro talhão para habilitar o diagnóstico técnico, análises de solo, calculadoras e relatórios.
            </p>
          </div>
          <button
            type="button"
            onClick={handleIniciarCriacao}
            className="h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Primeira Área</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map(a => {
            const isAtiva = a.id === areaAtivaId;
            const isConfirmando = confirmandoExcluirId === a.id;
            return (
              <div
                key={a.id}
                className={`bg-white dark:bg-zinc-900 rounded-xl p-4 border transition flex flex-col justify-between ${
                  isAtiva
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                    : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        {a.codigoIdentificacao || 'SEM CÓDIGO'}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {a.nomeTalhao}
                      </h3>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase border shrink-0 ${
                        SEVERIDADE_STYLES[a.grauSeveridade] || SEVERIDADE_STYLES.leve
                      }`}
                    >
                      {a.grauSeveridade.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 dark:text-zinc-400 mb-3.5">
                    <p className="tabular-nums">
                      <span className="font-medium text-slate-700 dark:text-zinc-300">Área:</span>{' '}
                      {a.areaHa.toLocaleString('pt-BR')} ha
                    </p>
                    <p className="truncate">
                      <span className="font-medium text-slate-700 dark:text-zinc-300">Degradação:</span>{' '}
                      {a.tipoDegradacao.replace(/_/g, ' ')}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">Status:</span>{' '}
                      {a.statusRecuperacao.replace('_', ' ')}
                    </p>
                    <p className="line-clamp-2 text-[11px] text-slate-500 dark:text-zinc-500 pt-0.5">
                      {a.historicoUsoManejo || 'Sem histórico detalhado informado.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  {isConfirmando ? (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="text-rose-600 dark:text-rose-400 font-medium">Excluir?</span>
                      <button
                        type="button"
                        onClick={() => handleConfirmarExcluir(a.id)}
                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium transition"
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmandoExcluirId(null)}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded font-medium transition"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditandoArea(a)}
                        className="h-7 w-7 inline-flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                        title="Editar dados desta área"
                        aria-label="Editar área"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmandoExcluirId(a.id)}
                        className="h-7 w-7 inline-flex items-center justify-center text-slate-400 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title="Excluir área"
                        aria-label="Excluir área"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelecionarArea(a.id)}
                    className={`h-7 px-2.5 rounded-md font-medium text-xs transition whitespace-nowrap ${
                      isAtiva
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200/80 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {isAtiva ? 'Selecionada' : 'Selecionar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
