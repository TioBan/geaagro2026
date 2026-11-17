import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    setLista([...comparativos]);
  }, [comparativos]);

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
    setSucesso(true);
    setTimeout(() => setSucesso(false), 3000);
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
    setSucesso(true);
    setTimeout(() => setSucesso(false), 3000);
  };

  const handleToggleStatus = (id: string) => {
    const atualizados = lista.map((c) => {
      if (c.id === id) {
        const novoStatus = c.statusInclusao === 'incluido' ? 'descartado_outlier' : 'incluido';
        return {
          ...c,
          statusInclusao: novoStatus as ImovelComparativoMercado['statusInclusao'],
          justificativaStatus: novoStatus === 'descartado_outlier' ? 'Descartado manualmente pelo avaliador' : undefined
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
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Banco de Dados de Imóveis Comparativos de Mercado
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Amostras de mercado, saneamento de dados, homogeneização por fatores (NBR 14653-3)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sucesso && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mr-2">
              <CheckCircle2 className="w-4 h-4" /> Salvo e Homogeneizado!
            </span>
          )}
          <button
            type="button"
            onClick={handleAbrirNovaAmostra}
            className="px-3 py-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Amostra
          </button>
          <button
            type="button"
            onClick={handleSalvarTudo}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Homogeneizar & Salvar
          </button>
        </div>
      </div>

      {/* Formulário de Criação / Edição de Amostra */}
      {comparativoEditando && (
        <form
          onSubmit={handleSalvarModal}
          className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-emerald-500/50 shadow-md space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {isNovo ? 'Cadastrar Nova Amostra Comparativa' : `Editar Amostra (${comparativoEditando.codigo || comparativoEditando.identificacao})`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Preencha os dados do imóvel pesquisado no mercado para cálculo automático dos fatores NBR 14653-3
              </p>
            </div>
            <button
              type="button"
              onClick={handleFecharModal}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Cancelar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Código da Amostra
              </label>
              <input
                type="text"
                placeholder="Ex: AMOSTRA-01"
                value={comparativoEditando.codigo}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, codigo: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Identificação / Nome do Imóvel *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Fazenda Boa Esperança"
                value={comparativoEditando.identificacao}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, identificacao: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Data da Informação
              </label>
              <input
                type="date"
                value={comparativoEditando.dataInformacao}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, dataInformacao: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Município *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Rio Verde"
                value={comparativoEditando.municipio}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, municipio: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                UF *
              </label>
              <input
                type="text"
                required
                maxLength={2}
                placeholder="Ex: GO"
                value={comparativoEditando.estado}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, estado: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Área Total (ha) *
              </label>
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
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Valor (Oferta / Negociado)
              </label>
              <select
                value={comparativoEditando.tipoValor}
                onChange={(e) =>
                  setComparativoEditando({
                    ...comparativoEditando,
                    tipoValor: e.target.value as 'anunciado' | 'negociado_efetivo'
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="anunciado">Anunciado / Oferta (Fator 0,90)</option>
                <option value="negociado_efetivo">Negociado Efetivo (Fator 1,00)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Valor Total Informado (R$)
              </label>
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
                    precoPorHectareR$: area > 0 ? Math.round(valor / area) : comparativoEditando.precoPorHectareR$
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Valor Unitário (R$/ha) *
              </label>
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
                    valorInformadoR$: area > 0 ? Math.round(precoHa * area) : comparativoEditando.valorInformadoR$
                  });
                }}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Topografia / Relevo
              </label>
              <select
                value={comparativoEditando.topografia}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, topografia: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Plano (0-3%)">Plano (0-3%)</option>
                <option value="Suave Ondulado (3-8%)">Suave Ondulado (3-8%)</option>
                <option value="Ondulado (8-20%)">Ondulado (8-20%)</option>
                <option value="Forte Ondulado (20-45%)">Forte Ondulado (20-45%)</option>
                <option value="Montanhoso (>45%)">Montanhoso (&gt;45%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Aptidão Agrícola
              </label>
              <select
                value={comparativoEditando.aptidaoAgricola}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, aptidaoAgricola: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Disponibilidade Hídrica
              </label>
              <select
                value={comparativoEditando.disponibilidadeHidrica}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, disponibilidadeHidrica: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Excelente">Excelente</option>
                <option value="Boa">Boa</option>
                <option value="Regular">Regular</option>
                <option value="Escassa">Escassa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Distância do Asfalto (km)
              </label>
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
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Exploração
              </label>
              <input
                type="text"
                placeholder="Ex: Lavoura de soja/milho, pecuária..."
                value={comparativoEditando.tipoExploracao}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, tipoExploracao: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Fonte da Informação
              </label>
              <input
                type="text"
                placeholder="Ex: Imobiliária, corretor, cartório..."
                value={comparativoEditando.fonteInformacao}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, fonteInformacao: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Benfeitorias Existentes na Amostra
              </label>
              <input
                type="text"
                placeholder="Ex: Terra nua, sede, curral, barracão..."
                value={comparativoEditando.benfeitoriasDescricao}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, benfeitoriasDescricao: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Acessibilidade
              </label>
              <input
                type="text"
                placeholder="Ex: Asfalto, vicinal cascalhada..."
                value={comparativoEditando.acessibilidade}
                onChange={(e) =>
                  setComparativoEditando({ ...comparativoEditando, acessibilidade: e.target.value })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confiabilidade
              </label>
              <select
                value={comparativoEditando.confiabilidade}
                onChange={(e) =>
                  setComparativoEditando({
                    ...comparativoEditando,
                    confiabilidade: e.target.value as 'Alta' | 'Média' | 'Baixa'
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleFecharModal}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {isNovo ? 'Adicionar Amostra' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome da fazenda, código ou município..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-full sm:w-44"
          >
            <option value="todos">Todos os Status</option>
            <option value="incluido">Somente Válidos / Incluídos</option>
            <option value="descartado_outlier">Descartados / Outliers</option>
          </select>
        </div>
      </div>

      {/* Grid de Cards dos Comparativos */}
      {filtrados.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Nenhuma amostra comparativa encontrada. Clique em <strong>"+ Nova Amostra"</strong> para cadastrar imóveis comparativos de mercado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtrados.map((comp) => {
            const isAtivo = comp.statusInclusao === 'incluido';
            const vHomog = comp.fatores?.valorHomogeneizadoPorHaR$ || comp.precoPorHectareR$;

            return (
              <div
                key={comp.id}
                className={`p-5 rounded-xl border transition-all ${
                  isAtivo
                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700/60 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {comp.codigo}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                          isAtivo
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {comp.statusInclusao}
                      </span>
                      <span className="text-xs text-slate-400">
                        {comp.tipoValor === 'negociado_efetivo' ? 'Negociado Real' : 'Anunciado'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {comp.identificacao}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {comp.municipio}{comp.estado ? ` - ${comp.estado}` : ''} • {comp.areaTotalHa.toLocaleString('pt-BR')} ha • {comp.dataInformacao}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-[10px] uppercase text-slate-400 font-medium">Informado</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      R$ {comp.precoPorHectareR$.toLocaleString('pt-BR')}/ha
                    </span>
                  </div>
                </div>

                {/* Box de Homogeneização */}
                <div className="mt-4 p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                      Fator Total de Homogeneização
                    </span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {comp.fatores?.fatorTotal ? comp.fatores.fatorTotal.toFixed(3) : '1.000'}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      (Oferta: {comp.fatores?.fatorOferta || 1} • Dimensão: {comp.fatores?.fatorDimensao || 1} • Acesso: {comp.fatores?.fatorAcesso || 1})
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                      Valor Homogeneizado
                    </span>
                    <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      R$ {vHomog.toLocaleString('pt-BR')}/ha
                    </span>
                  </div>
                </div>

                {comp.justificativaStatus && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-200 dark:border-red-800/30">
                    <strong>Justificativa do Descarte:</strong> {comp.justificativaStatus}
                  </p>
                )}

                {/* Ações do Card */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs">
                  <span className="text-slate-400 text-[11px] truncate max-w-[180px]">
                    Fonte: {comp.fonteInformacao || 'Não informada'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAbrirEdicao(comp)}
                      className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(comp.id)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        isAtivo
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {isAtivo ? 'Descartar da Amostra' : 'Reintegrar Amostra'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemover(comp.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      title="Remover amostra"
                    >
                      <Trash2 className="w-4 h-4" />
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
