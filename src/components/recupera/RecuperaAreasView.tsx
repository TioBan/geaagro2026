import React, { useState } from 'react';
import { AreaDegradadaItem, TipoDegradacaoPrincipal, GrauSeveridadeDegradacao } from '../../types/recupera';
import { useTimedFlag } from './useTimedFlag';
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Layers,
  Save
} from 'lucide-react';

interface Props {
  areas: AreaDegradadaItem[];
  propriedadeId?: string;
  areaAtivaId: string;
  onSelecionarArea: (areaId: string) => void;
  onSalvarAreas: (areasAtualizadas: AreaDegradadaItem[]) => void;
}

export const RecuperaAreasView: React.FC<Props> = ({
  areas,
  propriedadeId = '',
  areaAtivaId,
  onSelecionarArea,
  onSalvarAreas
}) => {
  const [editandoArea, setEditandoArea] = useState<AreaDegradadaItem | null>(null);
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
      dataIdentificacao: '',
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

    const lista = [...areas];
    const index = lista.findIndex(a => a.id === editandoArea.id);
    if (index >= 0) {
      lista[index] = editandoArea;
    } else {
      lista.push(editandoArea);
    }

    onSalvarAreas(lista);
    onSelecionarArea(editandoArea.id);
    setEditandoArea(null);
    dispararSalvo();
  };

  const handleExcluirArea = (id: string) => {
    if (window.confirm('Deseja realmente remover esta área degradada?')) {
      const novaLista = areas.filter(a => a.id !== id);
      onSalvarAreas(novaLista);
      if (areaAtivaId === id) {
        onSelecionarArea(novaLista[0]?.id || '');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>Cadastro & Delimitação de Áreas Degradadas</span>
          </h2>
          <p className="text-xs text-slate-500">
            Múltiplos talhões, histórico de exploração, tipo e grau de severidade da degradação
          </p>
        </div>

        <button
          type="button"
          onClick={handleIniciarCriacao}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Área</span>
        </button>
      </div>

      {salvo && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Lista de áreas atualizada com sucesso no banco de dados local!</span>
        </div>
      )}

      {/* Modal / Formulário de Edição de Área */}
      {editandoArea && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-emerald-500 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-emerald-600" />
              <span>{editandoArea.id.startsWith('area-recupera-') && areas.some(a => a.id === editandoArea.id) ? 'Editar Área' : 'Nova Área Degradada'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setEditandoArea(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSalvarEdicao} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome do Talhão / Setor *
              </label>
              <input
                type="text"
                value={editandoArea.nomeTalhao}
                onChange={e => setEditandoArea({ ...editandoArea, nomeTalhao: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Ex: Talhão 02 - Encosta Sul"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Código de Identificação *
              </label>
              <input
                type="text"
                value={editandoArea.codigoIdentificacao}
                onChange={e => setEditandoArea({ ...editandoArea, codigoIdentificacao: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Área em Hectares (ha) *
              </label>
              <input
                type="number"
                step="0.01"
                value={editandoArea.areaHa}
                onChange={e => setEditandoArea({ ...editandoArea, areaHa: parseFloat(e.target.value) || 0 })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Degradação Principal *
              </label>
              <select
                value={editandoArea.tipoDegradacao}
                onChange={e => setEditandoArea({ ...editandoArea, tipoDegradacao: e.target.value as TipoDegradacaoPrincipal })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
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
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Grau de Severidade *
              </label>
              <select
                value={editandoArea.grauSeveridade}
                onChange={e => setEditandoArea({ ...editandoArea, grauSeveridade: e.target.value as GrauSeveridadeDegradacao })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                <option value="leve">Leve (Recuperação Rápida / Manejo)</option>
                <option value="moderada">Moderada (Correção Química e Sobressemeadura)</option>
                <option value="severa">Severa (Reforma Total / Descompactação Mecânica)</option>
                <option value="muito_severa">Muito Severa (Voçorocas / Terraços / Reconstituição)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Atual da Recuperação *
              </label>
              <select
                value={editandoArea.statusRecuperacao}
                onChange={e => setEditandoArea({ ...editandoArea, statusRecuperacao: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              >
                <option value="diagnostico">1. Em Diagnóstico</option>
                <option value="planejamento">2. Em Planejamento / Projeto</option>
                <option value="em_execucao">3. Em Execução de Obras</option>
                <option value="em_monitoramento">4. Em Monitoramento IGRA</option>
                <option value="recuperada">5. Área Recuperada / Estável</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Histórico de Uso, Culturas Anteriores e Manejo
              </label>
              <textarea
                value={editandoArea.historicoUsoManejo}
                onChange={e => setEditandoArea({ ...editandoArea, historicoUsoManejo: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                placeholder="Descreva anos de cultivo contínuo, ausência de calagem, queima de palhada, superpastejo..."
              />
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditandoArea(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Área</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid de Cards das Áreas Cadastradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas.map(a => {
          const isAtiva = a.id === areaAtivaId;
          return (
            <div
              key={a.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all ${
                isAtiva
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {a.codigoIdentificacao}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {a.nomeTalhao}
                  </h3>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                  a.grauSeveridade === 'muito_severa'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : a.grauSeveridade === 'severa'
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                    : a.grauSeveridade === 'moderada'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {a.grauSeveridade.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4">
                <p><strong>Área:</strong> {a.areaHa} hectares</p>
                <p><strong>Degradação:</strong> {a.tipoDegradacao.replace(/_/g, ' ').toUpperCase()}</p>
                <p><strong>Status:</strong> {a.statusRecuperacao.replace('_', ' ')}</p>
                <p className="line-clamp-2 text-slate-500">{a.historicoUsoManejo || 'Sem histórico detalhado informado.'}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditandoArea(a)}
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Editar dados desta área"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExcluirArea(a.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Excluir área"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onSelecionarArea(a.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                    isAtiva
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {isAtiva ? 'Área Selecionada' : 'Selecionar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
