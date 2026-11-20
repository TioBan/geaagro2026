import React, { useState, useEffect, useRef } from 'react';
import { ImovelComparativoMercado } from '../../types/avaliacaoImoveis';
import {
  calcularFatorOferta,
  calcularFatorDimensaoPollock,
  calcularFatorTopografia,
  calcularFatorAcessibilidade
} from '../../utils/avaliacaoImoveisCalculos';
import {
  TrendingUp,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Filter,
  Search,
  Pencil,
  X
} from 'lucide-react';

interface Props {
  comparativos: ImovelComparativoMercado[];
  areaAvaliandoHa: number;
  onSalvarComparativos: (comps: ImovelComparativoMercado[]) => void;
}

const criarAmostraVazia = (): ImovelComparativoMercado => ({
  id: `comp-${Date.now()}`,
  codigo: '',
  identificacao: '',
  municipio: '',
  estado: '',
  coordenadas: { latitude: 0, longitude: 0 },
  areaTotalHa: 0,
  valorInformadoR$: 0,
  tipoValor: 'anunciado',
  dataInformacao: new Date().toISOString().split('T')[0],
  precoPorHectareR$: 0,
  tipoExploracao: '',
  aptidaoAgricola: '1 - Boa para Lavouras',
  topografia: 'Plano (0-3%)',
  disponibilidadeHidrica: 'Boa',
  benfeitoriasDescricao: '',
  acessibilidade: '',
  distanciaAsfaltoKm: 0,
  distanciaCidadeKm: 0,
  fonteInformacao: '',
  confiabilidade: 'Alta',
  statusInclusao: 'incluido',
  fotos: []
});

const inputCls =
  'w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';
const labelCls = 'block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const AvaliacaoPesquisaMercadoView: React.FC<Props> = ({
  comparativos,
  areaAvaliandoHa,
  onSalvarComparativos
}) => {
  const [lista, setLista] = useState<ImovelComparativoMercado[]>([...comparativos]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [sucesso, setSucesso] = useState(false);
  const [comparativoEditando, setComparativoEditando] = useState<ImovelComparativoMercado | null>(null);
  const [isNovo, setIsNovo] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLista([...comparativos]);
  }, [comparativos]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const dispararSucesso = () => {
    setSucesso(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSucesso(false), 3000);
  };

  const recalcularFatores = (comp: ImovelComparativoMercado): ImovelComparativoMercado => {
    const fOferta = calcularFatorOferta(comp.tipoValor);
    const fDimensao = calcularFatorDimensaoPollock(comp.areaTotalHa, areaAvaliandoHa || comp.areaTotalHa || 1);
    const fTopo = calcularFatorTopografia(comp.topografia, 'Plano (0-3%)');
    const fAcesso = calcularFatorAcessibilidade(comp.distanciaAsfaltoKm, 5);

    const fAgua = comp.disponibilidadeHidrica.toLowerCase().includes('excelente') ? 0.98 : 1.0;
    const fAptidao = comp.aptidaoAgricola.includes('1') ? 1.0 : 1.05;

    const fatorTotal = Number((fOferta * fDimensao * fTopo * fAcesso * fAgua * fAptidao).toFixed(3));
    const valorHomogeneizadoPorHaR$ = Math.round((comp.precoPorHectareR$ || 0) * fatorTotal);

    return {
      ...comp,
      fatores: {
        fatorOferta: fOferta,
        fatorDimensao: fDimensao,
        fatorTopografia: fTopo,
        fatorAcesso: fAcesso,
        fatorAgua: fAgua,
        fatorAptidao: fAptidao,
        fatorTotal,
        valorHomogeneizadoPorHaR$
      }
    };
  };

  const handleSalvarTudo = () => {
    const recalcs = lista.map(recalcularFatores);
    setLista(recalcs);
    onSalvarComparativos(recalcs);
    dispararSucesso();
  };

  const handleAbrirNovaAmostra = () => {
    setIsNovo(true);
    setComparativoEditando(criarAmostraVazia());
  };

  const handleAbrirEdicao = (comp: ImovelComparativoMercado) => {
    setIsNovo(false);
    setComparativoEditando({ ...comp, coordenadas: { ...comp.coordenadas } });
  };

  const handleFecharModal = () => {
    setComparativoEditando(null);
    setIsNovo(false);
  };

  const handleSalvarModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comparativoEditando) return;

    const area = Number(comparativoEditando.areaTotalHa) || 0;
    let valorTotal = Number(comparativoEditando.valorInformadoR$) || 0;
    let precoHa = Number(comparativoEditando.precoPorHectareR$) || 0;

    if (precoHa <= 0 && area > 0 && valorTotal > 0) {
      precoHa = Math.round(valorTotal / area);
    } else if (valorTotal <= 0 && area > 0 && precoHa > 0) {
      valorTotal = Math.round(precoHa * area);
    }

    const codigoFinal =
      comparativoEditando.codigo.trim() ||
      `AMOSTRA-${(lista.length + 1).toString().padStart(2, '0')}`;

    const preparado: ImovelComparativoMercado = {
      ...comparativoEditando,
      codigo: codigoFinal,
      estado: comparativoEditando.estado.toUpperCase(),
      areaTotalHa: area,
      valorInformadoR$: valorTotal,
      precoPorHectareR$: precoHa
    };

    const comFatores = recalcularFatores(preparado);
    const novaLista = isNovo
      ? [comFatores, ...lista]
      : lista.map((item) => (item.id === comFatores.id ? comFatores : item));

    setLista(novaLista);
    onSalvarComparativos(novaLista);
    setComparativoEditando(null);
    setIsNovo(false);
    dispararSucesso();
  };

  const handleToggleStatus = (id: string) => {
    const atualizados = lista.map((c) => {
      if (c.id === id) {
        const novoStatus = c.statusInclusao === 'incluido' ? 'descartado_outlier' : 'incluido';
        return {
          ...c,
          statusInclusao: novoStatus as ImovelComparativoMercado['statusInclusao'],
          justificativaStatus:
            novoStatus === 'descartado_outlier' ? 'Descartado manualmente pelo avaliador' : undefined
        };
      }
      return c;
    });
    setLista(atualizados);
    onSalvarComparativos(atualizados);
  };

  const handleRemover = (id: string) => {
    const atualizados = lista.filter((c) => c.id !== id);
    setLista(atualizados);
    onSalvarComparativos(atualizados);
  };

  const filtrados = lista.filter((c) => {
    const termo = busca.toLowerCase();
    const matchesBusca =
      !termo ||
      c.identificacao.toLowerCase().includes(termo) ||
      c.municipio.toLowerCase().includes(termo) ||
      c.codigo.toLowerCase().includes(termo);
    const matchesStatus = filtroStatus === 'todos' || c.statusInclusao === filtroStatus;
    return matchesBusca && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Barra Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Banco de Dados de Imóveis Comparativos de Mercado
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Amostras de mercado, saneamento de dados e homogeneização por fatores (NBR 14653-3)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {sucesso && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mr-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Homogeneizado
            </span>
          )}
          <button
            type="button"
            onClick={handleAbrirNovaAmostra}
            className="h-8 px-2.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/70 rounded-lg flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Amostra
          </button>
          <button
            type="button"
            onClick={handleSalvarTudo}
            className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Homogeneizar & Salvar
          </button>
        </div>
      </div>

      {/* Formulário de Criação / Edição de Amostra */}
      {comparativoEditando && (
        <form
          onSubmit={handleSalvarModal}
          className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-emerald-500/50 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                {isNovo
                  ? 'Cadastrar Nova Amostra Comparativa'
                  : `Editar Amostra (${comparativoEditando.codigo || comparativoEditando.identificacao})`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Preencha os dados do imóvel pesquisado para cálculo automático dos fatores NBR 14653-3
              </p>
            </div>
            <button
              type="button"
              onClick={handleFecharModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className={labelCls}>Código da Amostra</label>
              <input
                type="text"
                placeholder="Ex: AMOSTRA-01"
                value={comparativoEditando.codigo}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, codigo: e.target.value })
                }
                className={`${inputCls} font-mono`}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Identificação / Nome do Imóvel *</label>
              <input
                type="text"
                required
                placeholder="Ex: Fazenda Boa Esperança"
                value={comparativoEditando.identificacao}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, identificacao: e.target.value })
                }
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Data da Informação</label>
              <input
                type="date"
                value={comparativoEditando.dataInformacao}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, dataInformacao: e.target.value })
                }
                className={`${inputCls} tabular-nums`}
              />
            </div>

            <div>
              <label className={labelCls}>Município *</label>
              <input
                type="text"
                required
                placeholder="Ex: Rio Verde"
                value={comparativoEditando.municipio}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, municipio: e.target.value })
                }
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>UF *</label>
              <input
                type="text"
                required
                maxLength={2}
                placeholder="Ex: GO"
                value={comparativoEditando.estado}
                onChange={(e) =>
                  setComparativoEditando({
                    ...comparativoEditando,
                    estado: e.target.value.toUpperCase()
                  })
                }
                className={`${inputCls} uppercase`}
              />
            </div>

            <div>
              <label className={labelCls}>Área Total (ha) *</label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                placeholder="0"
                value={comparativoEditando.areaTotalHa || ''}
                onChange={(e) => {
                  const area = parseFloat(e.target.value) || 0;
                  const valor = comparativoEditando.valorInformadoR$;
                  const precoHa = comparativoEditando.precoPorHectareR$;
                  setComparativoEditando({
                    ...comparativoEditando,
                    areaTotalHa: area,
                    precoPorHectareR$: area > 0 && valor > 0 ? Math.round(valor / area) : precoHa
                  });
                }}
                className={`${inputCls} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className={labelCls}>Tipo de Valor (Oferta / Negociado)</label>
              <select
                value={comparativoEditando.tipoValor}
                onChange={(e) =>
                  setComparativoEditando({
                    ...comparativoEditando,
                    tipoValor: e.target.value as 'anunciado' | 'negociado_efetivo'
                  })
                }
                className={inputCls}
              >
                <option value="anunciado">Anunciado / Oferta (Fator 0,90)</option>
                <option value="negociado_efetivo">Negociado Efetivo (Fator 1,00)</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Valor Total Informado (R$)</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0,00"
                value={comparativoEditando.valorInformadoR$ || ''}
                onChange={(e) => {
                  const valor = parseFloat(e.target.value) || 0;
                  const area = comparativoEditando.areaTotalHa;
                  setComparativoEditando({
                    ...comparativoEditando,
                    valorInformadoR$: valor,
                    precoPorHectareR$:
                      area > 0 ? Math.round(valor / area) : comparativoEditando.precoPorHectareR$
                  });
                }}
                className={`${inputCls} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className={labelCls}>Valor Unitário (R$/ha) *</label>
              <input
                type="number"
                required
                min="1"
                step="any"
                placeholder="0,00"
                value={comparativoEditando.precoPorHectareR$ || ''}
                onChange={(e) => {
                  const precoHa = parseFloat(e.target.value) || 0;
                  const area = comparativoEditando.areaTotalHa;
                  setComparativoEditando({
                    ...comparativoEditando,
                    precoPorHectareR$: precoHa,
                    valorInformadoR$:
                      area > 0 ? Math.round(precoHa * area) : comparativoEditando.valorInformadoR$
                  });
                }}
                className={`${inputCls} font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400`}
              />
            </div>

            <div>
              <label className={labelCls}>Topografia / Relevo</label>
              <select
                value={comparativoEditando.topografia}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, topografia: e.target.value })
                }
                className={inputCls}
              >
                <option value="Plano (0-3%)">Plano (0-3%)</option>
                <option value="Suave Ondulado (3-8%)">Suave Ondulado (3-8%)</option>
                <option value="Ondulado (8-20%)">Ondulado (8-20%)</option>
                <option value="Forte Ondulado (20-45%)">Forte Ondulado (20-45%)</option>
                <option value="Montanhoso (>45%)">Montanhoso (&gt;45%)</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Aptidão Agrícola</label>
              <select
                value={comparativoEditando.aptidaoAgricola}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, aptidaoAgricola: e.target.value })
                }
                className={inputCls}
              >
                <option value="1 - Boa para Lavouras">1 - Boa para Lavouras</option>
                <option value="2 - Regular para Lavouras">2 - Regular para Lavouras</option>
                <option value="3 - Restrita para Lavouras">3 - Restrita para Lavouras</option>
                <option value="4 - Apta para Pastagem Plantada">4 - Apta para Pastagem Plantada</option>
                <option value="5 - Apta para Silvicultura">5 - Apta para Silvicultura</option>
                <option value="6 - Preservação da Fauna e Flora">6 - Preservação da Fauna e Flora</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Disponibilidade Hídrica</label>
              <select
                value={comparativoEditando.disponibilidadeHidrica}
                onChange={(e) =>
                  setComparativoEditando({
                    ...comparativoEditando,
                    disponibilidadeHidrica: e.target.value
                  })
                }
                className={inputCls}
              >
                <option value="Excelente">Excelente</option>
                <option value="Boa">Boa</option>
                <option value="Regular">Regular</option>
                <option value="Escassa">Escassa</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Distância do Asfalto (km)</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0"
                value={comparativoEditando.distanciaAsfaltoKm || ''}
                onChange={(e) =>
                  setComparativoEditando({
                    ...comparativoEditando,
                    distanciaAsfaltoKm: parseFloat(e.target.value) || 0
                  })
                }
                className={`${inputCls} font-mono tabular-nums`}
              />
            </div>

            <div>
              <label className={labelCls}>Tipo de Exploração</label>
              <input
                type="text"
                placeholder="Ex: Lavoura de soja/milho, pecuária..."
                value={comparativoEditando.tipoExploracao}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, tipoExploracao: e.target.value })
                }
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Fonte da Informação</label>
              <input
                type="text"
                placeholder="Ex: Imobiliária, corretor, cartório..."
                value={comparativoEditando.fonteInformacao}
                onChange={(e) =>
                  setComparativoEditando({
                    ...comparativoEditando,
                    fonteInformacao: e.target.value
                  })
                }
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Benfeitorias Existentes na Amostra</label>
              <input
                type="text"
                placeholder="Ex: Terra nua, sede, curral, barracão..."
                value={comparativoEditando.benfeitoriasDescricao}
                onChange={(e) =>
                  setComparativoEditando({
                    ...comparativoEditando,
                    benfeitoriasDescricao: e.target.value
                  })
                }
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Acessibilidade</label>
              <input
                type="text"
                placeholder="Ex: Asfalto, vicinal cascalhada..."
                value={comparativoEditando.acessibilidade}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, acessibilidade: e.target.value })
                }
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Confiabilidade</label>
              <select
                value={comparativoEditando.confiabilidade}
                onChange={(e) =>
                  setComparativoEditando({
                    ...comparativoEditando,
                    confiabilidade: e.target.value as 'Alta' | 'Média' | 'Baixa'
                  })
                }
                className={inputCls}
              >
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleFecharModal}
              className="h-8 px-3 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-8 px-3.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {isNovo ? 'Adicionar Amostra' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome da fazenda, código ou município..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="h-8 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 w-full sm:w-48 focus:outline-none focus:border-emerald-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="incluido">Somente Válidos / Incluídos</option>
            <option value="descartado_outlier">Descartados / Outliers</option>
          </select>
        </div>
      </div>

      {/* Grid de Cards dos Comparativos */}
      {filtrados.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 p-8 text-center text-xs text-slate-500 dark:text-zinc-400">
          Nenhuma amostra comparativa encontrada. Clique em <strong>Nova Amostra</strong> para cadastrar imóveis de mercado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtrados.map((comp) => {
            const isAtivo = comp.statusInclusao === 'incluido';
            const vHomog = comp.fatores?.valorHomogeneizadoPorHaR$ || comp.precoPorHectareR$;

            return (
              <div
                key={comp.id}
                className={`p-4 rounded-xl border transition-colors ${
                  isAtivo
                    ? 'bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800'
                    : 'bg-slate-50/70 dark:bg-zinc-950/60 border-slate-200/60 dark:border-zinc-800/60 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                        {comp.codigo}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded uppercase ${
                          isAtivo
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {isAtivo ? 'Incluído' : 'Descartado'}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                        {comp.tipoValor === 'negociado_efetivo' ? 'Negociado Real' : 'Anunciado'}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-1 truncate">
                      {comp.identificacao}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 tabular-nums">
                      {comp.municipio}
                      {comp.estado ? ` - ${comp.estado}` : ''} ·{' '}
                      {comp.areaTotalHa.toLocaleString('pt-BR')} ha · {comp.dataInformacao}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-[10px] uppercase text-slate-400 dark:text-zinc-500 font-medium">
                      Informado
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-slate-800 dark:text-zinc-200">
                      R$ {comp.precoPorHectareR$.toLocaleString('pt-BR')}/ha
                    </span>
                  </div>
                </div>

                {/* Bloco de Homogeneização */}
                <div className="mt-3 p-3 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400">
                      Fator Total
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-zinc-200">
                      {comp.fatores?.fatorTotal ? comp.fatores.fatorTotal.toFixed(3) : '1.000'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 block tabular-nums">
                      Oferta {comp.fatores?.fatorOferta || 1} · Dim {comp.fatores?.fatorDimensao || 1} · Acesso {comp.fatores?.fatorAcesso || 1}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400">
                      Homogeneizado
                    </span>
                    <span className="text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                      R$ {vHomog.toLocaleString('pt-BR')}/ha
                    </span>
                  </div>
                </div>

                {comp.justificativaStatus && (
                  <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-2 bg-rose-50/70 dark:bg-rose-950/30 p-2 rounded-md border border-rose-200/70 dark:border-rose-800/40">
                    <strong>Descarte:</strong> {comp.justificativaStatus}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
                  <span className="text-slate-400 dark:text-zinc-500 text-[11px] truncate">
                    Fonte: {comp.fonteInformacao || 'Não informada'}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAbrirEdicao(comp)}
                      className="h-7 px-2 rounded-md text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-200/80 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(comp.id)}
                      className={`h-7 px-2 rounded-md text-xs font-medium transition-colors ${
                        isAtivo
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300'
                      }`}
                    >
                      {isAtivo ? 'Descartar' : 'Reintegrar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemover(comp.id)}
                      className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remover amostra"
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
  );
};
