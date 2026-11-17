import React, { useState, useEffect, useRef } from 'react';
import {
  BenfeitoriaItem,
  EstadoConservacaoRossHeidecke
} from '../../types/avaliacaoImoveis';
import {
  calcularDepreciacaoRossHeidecke,
  COEFICIENTES_ROSS_HEIDECKE
} from '../../utils/avaliacaoImoveisCalculos';
import {
  Building2,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  X,
  Calculator
} from 'lucide-react';

interface Props {
  benfeitorias: BenfeitoriaItem[];
  propriedadeId: string;
  onSalvarBenfeitorias: (itens: BenfeitoriaItem[]) => void;
}

const INTERVENCOES_ROSS_HEIDECKE: Record<EstadoConservacaoRossHeidecke, string> = {
  A: 'Nenhum reparo necessário',
  B: 'Pequenos retoques de pintura',
  C: 'Manutenção preventiva rotineira',
  D: 'Substituição de pequenos componentes',
  E: 'Revisão elétrica, hidráulica e forros',
  F: 'Recuperação de alvenaria e telhado',
  G: 'Comprometimento estrutural severo',
  H: 'Recomendada demolição / descarte'
};

const IDADE_PERCENTUAIS_TABELA = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];
const ESTADOS_ORDEM: EstadoConservacaoRossHeidecke[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const AvaliacaoBenfeitoriasView: React.FC<Props> = ({
  benfeitorias,
  propriedadeId,
  onSalvarBenfeitorias
}) => {
  const [itens, setItens] = useState<BenfeitoriaItem[]>([...benfeitorias]);
  const [sucesso, setSucesso] = useState(false);
  const [mostrarTabelaExplicativa, setMostrarTabelaExplicativa] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItens([...benfeitorias]);
  }, [propriedadeId, benfeitorias]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const recalcularItem = (item: BenfeitoriaItem): BenfeitoriaItem => {
    const dimensao = Number(item.dimensaoM2) || 0;
    const custoUnitario = Number(item.custoReproducaoNovoUnitarioR$) || 0;
    const qtd = Number(item.quantidade) || 1;
    const custoNovo = dimensao * custoUnitario * qtd;

    if (custoNovo <= 0 || (Number(item.vidaUtilAnos) || 0) <= 0) {
      return {
        ...item,
        custoReproducaoNovoTotalR$: custoNovo,
        fatorDepreciacaoRossHeideckePct: 0,
        valorDepreciadoFinalR$: custoNovo
      };
    }

    const resultado = calcularDepreciacaoRossHeidecke(
      Number(item.idadeAparenteAnos) || 0,
      Number(item.vidaUtilAnos) || 0,
      item.estadoConservacao,
      0.15 // valor residual 15%
    );

    const valorDepreciado = Math.round(custoNovo * resultado.fatorDepreciado);

    return {
      ...item,
      custoReproducaoNovoTotalR$: custoNovo,
      fatorDepreciacaoRossHeideckePct: resultado.taxaDepreciacaoPct,
      valorDepreciadoFinalR$: valorDepreciado
    };
  };

  const handleSalvar = () => {
    const atualizados = itens.map(recalcularItem);
    setItens(atualizados);
    onSalvarBenfeitorias(atualizados);
    setSucesso(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSucesso(false), 3000);
  };

  const handleAddItem = () => {
    const novo: BenfeitoriaItem = {
      id: `benf-${Date.now()}`,
      propriedadeId,
      categoria: 'construcao',
      nome: '',
      dimensaoM2: 0,
      quantidade: 1,
      anoConstrucao: new Date().getFullYear(),
      idadeAparenteAnos: 0,
      vidaUtilAnos: 0,
      estadoConservacao: 'A',
      padraoConstrutivo: 'Normal/Médio',
      custoReproducaoNovoUnitarioR$: 0,
      custoReproducaoNovoTotalR$: 0,
      fatorDepreciacaoRossHeideckePct: 0,
      valorDepreciadoFinalR$: 0,
      fotos: [],
      observacoes: ''
    };
    setItens([...itens, novo]);
  };

  const handleRemoveItem = (id: string) => {
    setItens(itens.filter((i) => i.id !== id));
  };

  const totalNovoR$ = itens.reduce((acc, i) => acc + (i.custoReproducaoNovoTotalR$ || 0), 0);
  const totalDepreciadoR$ = itens.reduce((acc, i) => acc + (i.valorDepreciadoFinalR$ || 0), 0);
  const depreciacaoMediaPct = totalNovoR$ > 0 ? ((totalNovoR$ - totalDepreciadoR$) / totalNovoR$) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Barra de Ações Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Inventário & Depreciação de Benfeitorias (Ross-Heidecke)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cálculo matemático rigoroso de custo de reprodução novo e depreciação física conforme ABNT NBR 14653-3
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sucesso && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mr-2">
              <CheckCircle2 className="w-4 h-4" /> Salvo!
            </span>
          )}
          <button
            type="button"
            onClick={() => setMostrarTabelaExplicativa(!mostrarTabelaExplicativa)}
            aria-expanded={mostrarTabelaExplicativa}
            className={`px-3 py-2 text-xs rounded-lg flex items-center gap-1.5 font-medium transition-colors border ${
              mostrarTabelaExplicativa
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Tabela Ross-Heidecke
          </button>
          <button
            type="button"
            onClick={handleAddItem}
            className="px-3 py-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Benfeitoria
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Salvar & Recalcular
          </button>
        </div>
      </div>

      {/* Tabela Completa Ross-Heidecke (exibida logo abaixo da barra ao clicar) */}
      {mostrarTabelaExplicativa && (
        <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-5 rounded-xl border border-emerald-500/40 shadow-md space-y-5">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-3">
            <div>
              <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Tabela Completa e Critério Ross-Heidecke (Estados A a H)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                O método combina a idade aparente em relação à vida útil econômica (Ross) com o estado de conservação (Heidecke), considerando valor residual irredutível padrão de 15%.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMostrarTabelaExplicativa(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Fechar Tabela Ross-Heidecke"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-center rounded-lg text-xs border border-slate-700">
            D(%) = [ d_r + K_h × (1 - d_r) ] × 100 &nbsp;|&nbsp; d_r = 0,5 × (x + x²) &nbsp;|&nbsp; x = Idade / Vida Útil
          </div>

          {/* Classificação dos Estados A a H */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            {ESTADOS_ORDEM.map((estado) => {
              const coef = COEFICIENTES_ROSS_HEIDECKE[estado];
              return (
                <div
                  key={estado}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">Estado {estado}</span>
                    <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      Kh = {(coef.coeficienteReparo * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">{coef.descricao}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {INTERVENCOES_ROSS_HEIDECKE[estado]}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Matriz Percentual de Depreciação Ross-Heidecke */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Matriz de Depreciação Física (%) — % da Vida Útil × Estado de Conservação (sem residual)
            </h5>
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-center text-[11px] border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  <tr>
                    <th className="p-2 border-b border-r border-slate-200 dark:border-slate-700 text-left font-bold">
                      Idade / Vida Útil
                    </th>
                    {ESTADOS_ORDEM.map((est) => (
                      <th
                        key={est}
                        className="p-2 border-b border-slate-200 dark:border-slate-700 font-bold text-emerald-700 dark:text-emerald-400"
                      >
                        {est}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 font-mono">
                  {IDADE_PERCENTUAIS_TABELA.map((pctIdade) => {
                    const x = pctIdade / 100;
                    const dr = 0.5 * (x + x * x);
                    return (
                      <tr key={pctIdade} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <td className="p-1.5 px-2.5 border-r border-slate-200 dark:border-slate-700 text-left font-bold text-slate-800 dark:text-slate-200">
                          {pctIdade}%
                        </td>
                        {ESTADOS_ORDEM.map((est) => {
                          const dh = COEFICIENTES_ROSS_HEIDECKE[est].coeficienteReparo;
                          const depPct = (dr + dh * (1 - dr)) * 100;
                          return (
                            <td key={est} className="p-1.5 text-slate-700 dark:text-slate-300">
                              {depPct.toFixed(1)}%
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Custo de Reprodução a Novo</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            R$ {totalNovoR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{itens.length} benfeitorias cadastradas</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Depreciação Média Física</span>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
            <TrendingDown className="w-4 h-4" />
            {depreciacaoMediaPct.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Desconto médio acumulado</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-emerald-500">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase">Valor Atual Depreciado (Final)</span>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            R$ {totalDepreciadoR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Componente do laudo patrimonial</p>
        </div>
      </div>

      {/* Lista / Tabela de Benfeitorias */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Detalhamento das Benfeitorias Reprodutivas
          </h3>
        </div>

        {itens.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
            Nenhuma benfeitoria cadastrada. Clique em <strong>"+ Adicionar Benfeitoria"</strong> para inserir uma edificação ou instalação do zero.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {itens.map((item, idx) => (
              <div key={item.id} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-700/40 transition-colors">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Nome da Benfeitoria
                    </label>
                    <input
                      type="text"
                      value={item.nome}
                      placeholder="Ex: Galpão de Máquinas, Casa Sede..."
                      onChange={(e) => {
                        const upd = [...itens];
                        upd[idx].nome = e.target.value;
                        setItens(upd);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Categoria
                    </label>
                    <select
                      value={item.categoria}
                      onChange={(e: any) => {
                        const upd = [...itens];
                        upd[idx].categoria = e.target.value;
                        setItens(upd);
                      }}
                      className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="construcao">Construção Civil</option>
                      <option value="irrigacao">Irrigação / Pivô</option>
                      <option value="infraestrutura">Infraestrutura</option>
                      <option value="pecuaria">Instalação Pecuária</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Dimensão (m² ou un)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={item.dimensaoM2 || ''}
                      onChange={(e) => {
                        const upd = [...itens];
                        upd[idx].dimensaoM2 = parseFloat(e.target.value) || 0;
                        setItens(upd.map(recalcularItem));
                      }}
                      className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Custo Novo Unitário (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0,00"
                      value={item.custoReproducaoNovoUnitarioR$ || ''}
                      onChange={(e) => {
                        const upd = [...itens];
                        upd[idx].custoReproducaoNovoUnitarioR$ = parseFloat(e.target.value) || 0;
                        setItens(upd.map(recalcularItem));
                      }}
                      className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div className="md:col-span-2 text-right">
                    <span className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                      Valor Novo Total
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      R$ {(item.custoReproducaoNovoTotalR$ || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Linha dos Fatores de Depreciação Ross-Heidecke */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 items-center text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Idade Aparente (anos)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={item.idadeAparenteAnos || ''}
                      onChange={(e) => {
                        const upd = [...itens];
                        upd[idx].idadeAparenteAnos = parseFloat(e.target.value) || 0;
                        setItens(upd.map(recalcularItem));
                      }}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Vida Útil (anos)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Ex: 40"
                      value={item.vidaUtilAnos || ''}
                      onChange={(e) => {
                        const upd = [...itens];
                        upd[idx].vidaUtilAnos = parseFloat(e.target.value) || 0;
                        setItens(upd.map(recalcularItem));
                      }}
                      className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Conservação (R-H)</label>
                    <select
                      value={item.estadoConservacao}
                      onChange={(e: any) => {
                        const upd = [...itens];
                        upd[idx].estadoConservacao = e.target.value as EstadoConservacaoRossHeidecke;
                        setItens(upd.map(recalcularItem));
                      }}
                      className="w-full px-2 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
                    >
                      <option value="A">A - Novo (0%)</option>
                      <option value="B">B - Muito Bom (1%)</option>
                      <option value="C">C - Bom / Regular (3.2%)</option>
                      <option value="D">D - Reparos Leves (8.1%)</option>
                      <option value="E">E - Reparos Simples (18.1%)</option>
                      <option value="F">F - Reparos Médios (32.1%)</option>
                      <option value="G">G - Reparos Graves (52.1%)</option>
                      <option value="H">H - Demolição (100%)</option>
                    </select>
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">Depreciação Total</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {(item.fatorDepreciacaoRossHeideckePct || 0).toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">Valor Depreciado</span>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      R$ {(item.valorDepreciadoFinalR$ || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Remover benfeitoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
