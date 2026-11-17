import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MetodoAvaliacaoPrincipal,
  MetodoCapitalizacaoRendaConfig,
  MetodoEvolutivoConfig,
  AvaliacaoCompletaImovel
} from '../../types/avaliacaoImoveis';
import {
  calcularMetodoCapitalizacaoRenda,
  calcularMetodoEvolutivo
} from '../../utils/avaliacaoImoveisCalculos';
import {
  Scale,
  DollarSign,
  Building,
  CheckCircle2,
  Save
} from 'lucide-react';

interface Props {
  avaliacao: AvaliacaoCompletaImovel;
  onAtualizarMetodoPrincipal: (metodo: MetodoAvaliacaoPrincipal) => void;
  onSalvarConfiguracoes: (capRenda?: MetodoCapitalizacaoRendaConfig, evolutivo?: MetodoEvolutivoConfig) => void;
}

export const AvaliacaoMetodosView: React.FC<Props> = ({
  avaliacao,
  onAtualizarMetodoPrincipal,
  onSalvarConfiguracoes
}) => {
  const [metodoAtivo, setMetodoAtivo] = useState<MetodoAvaliacaoPrincipal>(
    avaliacao.metodoPrincipal || 'comparativo_direto'
  );

  // Estado do Método da Capitalização da Renda (sem dados pré-preenchidos)
  const [fluxoLiquidoAnual, setFluxoLiquidoAnual] = useState<number>(
    avaliacao.capitalizacaoRenda?.fluxoCaixaLiquidoAnualR$ ?? 0
  );
  const [taxaDesconto, setTaxaDesconto] = useState<number>(
    avaliacao.capitalizacaoRenda?.taxaDescontoAnualPct ?? 0
  );
  const [horizonteAnos, setHorizonteAnos] = useState<number>(
    avaliacao.capitalizacaoRenda?.horizonteAnos ?? 0
  );
  const [valorResidual, setValorResidual] = useState<number>(
    avaliacao.capitalizacaoRenda?.valorResidualFinalR$ ?? 0
  );

  // Estado do Método Evolutivo (sem dados pré-preenchidos)
  const [fatorComercializacaoFc, setFatorComercializacaoFc] = useState<number>(
    avaliacao.metodoEvolutivo?.fatorComercializacaoFc ?? 0
  );
  const [justificativaFc, setJustificativaFc] = useState<string>(
    avaliacao.metodoEvolutivo?.justificativaFc ?? ''
  );

  const [sucesso, setSucesso] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMetodoAtivo(avaliacao.metodoPrincipal || 'comparativo_direto');
    setFluxoLiquidoAnual(avaliacao.capitalizacaoRenda?.fluxoCaixaLiquidoAnualR$ ?? 0);
    setTaxaDesconto(avaliacao.capitalizacaoRenda?.taxaDescontoAnualPct ?? 0);
    setHorizonteAnos(avaliacao.capitalizacaoRenda?.horizonteAnos ?? 0);
    setValorResidual(avaliacao.capitalizacaoRenda?.valorResidualFinalR$ ?? 0);
    setFatorComercializacaoFc(avaliacao.metodoEvolutivo?.fatorComercializacaoFc ?? 0);
    setJustificativaFc(avaliacao.metodoEvolutivo?.justificativaFc ?? '');
  }, [avaliacao]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Cálculos reativos memoizados
  const resultadoRenda = useMemo(
    () =>
      calcularMetodoCapitalizacaoRenda(
        fluxoLiquidoAnual,
        taxaDesconto,
        horizonteAnos,
        valorResidual
      ),
    [fluxoLiquidoAnual, taxaDesconto, horizonteAnos, valorResidual]
  );

  const resultadoEvolutivo = useMemo(
    () =>
      calcularMetodoEvolutivo(
        avaliacao.valorTotalHomogeneizadoR$,
        avaliacao.valorTotalBenfeitoriasR$,
        fatorComercializacaoFc
      ),
    [avaliacao.valorTotalHomogeneizadoR$, avaliacao.valorTotalBenfeitoriasR$, fatorComercializacaoFc]
  );

  const handleSalvar = () => {
    onAtualizarMetodoPrincipal(metodoAtivo);

    const configRenda: MetodoCapitalizacaoRendaConfig = {
      receitasAnuais: avaliacao.capitalizacaoRenda?.receitasAnuais ?? [],
      custosOperacionaisR$: avaliacao.capitalizacaoRenda?.custosOperacionaisR$ ?? 0,
      despesasAdministrativasR$: avaliacao.capitalizacaoRenda?.despesasAdministrativasR$ ?? 0,
      impostosTaxasR$: avaliacao.capitalizacaoRenda?.impostosTaxasR$ ?? 0,
      investimentoManutencaoR$: avaliacao.capitalizacaoRenda?.investimentoManutencaoR$ ?? 0,
      fluxoCaixaLiquidoAnualR$: fluxoLiquidoAnual,
      taxaDescontoAnualPct: taxaDesconto,
      taxaCapitalizacaoPct:
        resultadoRenda.valorPresenteLiquido > 0
          ? (fluxoLiquidoAnual / resultadoRenda.valorPresenteLiquido) * 100
          : 0,
      horizonteAnos,
      valorResidualFinalR$: valorResidual,
      valorPresenteLiquidoR$: resultadoRenda.valorPresenteLiquido,
      analiseSensibilidade: resultadoRenda.sensibilidade
    };

    const configEvolutivo: MetodoEvolutivoConfig = {
      valorTerraNuaR$: avaliacao.valorTotalHomogeneizadoR$,
      valorBenfeitoriasR$: avaliacao.valorTotalBenfeitoriasR$,
      valorInstalacoesEquipamentosR$: avaliacao.metodoEvolutivo?.valorInstalacoesEquipamentosR$ ?? 0,
      fatorComercializacaoFc,
      valorTotalEvolutivoR$: resultadoEvolutivo.valorFinal,
      justificativaFc: justificativaFc.trim()
    };

    onSalvarConfiguracoes(configRenda, configEvolutivo);
    setSucesso(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSucesso(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Métodos de Avaliação de Imóveis Rurais (ABNT NBR 14653-3)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simulação e conciliação entre o Método Comparativo Direto, Capitalização da Renda e Método Evolutivo
          </p>
        </div>

        <div className="flex items-center gap-3">
          {sucesso && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Configurações salvas!
            </span>
          )}
          <button
            type="button"
            onClick={handleSalvar}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Definir Método & Salvar
          </button>
        </div>
      </div>

      {/* Seleção do Método Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Método 1: Comparativo Direto */}
        <div
          onClick={() => setMetodoAtivo('comparativo_direto')}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            metodoAtivo === 'comparativo_direto'
              ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              Método Preferencial
            </span>
            <input
              type="radio"
              name="metodo"
              checked={metodoAtivo === 'comparativo_direto'}
              onChange={() => setMetodoAtivo('comparativo_direto')}
              className="text-emerald-600 focus:ring-emerald-500"
            />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
            Comparativo Direto de Mercado
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Identifica o valor pelo tratamento estatístico e homogeneização de dados de mercado assemelhados.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Valor Concluído</span>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              R$ {avaliacao.valorFinalImovelR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Card Método 2: Capitalização da Renda */}
        <div
          onClick={() => setMetodoAtivo('capitalizacao_renda')}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            metodoAtivo === 'capitalizacao_renda'
              ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
              Fluxo Descontado
            </span>
            <input
              type="radio"
              name="metodo"
              checked={metodoAtivo === 'capitalizacao_renda'}
              onChange={() => setMetodoAtivo('capitalizacao_renda')}
              className="text-emerald-600 focus:ring-emerald-500"
            />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
            Capitalização da Renda Líquida
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Calcula o valor presente líquido das receitas operacionais agrícolas futuras descontadas por taxa de atratividade.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-bold">VPL da Propriedade</span>
            <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
              R$ {resultadoRenda.valorPresenteLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Card Método 3: Método Evolutivo */}
        <div
          onClick={() => setMetodoAtivo('evolutivo')}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            metodoAtivo === 'evolutivo'
              ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
              Soma com Fator Fc
            </span>
            <input
              type="radio"
              name="metodo"
              checked={metodoAtivo === 'evolutivo'}
              onChange={() => setMetodoAtivo('evolutivo')}
              className="text-emerald-600 focus:ring-emerald-500"
            />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
            Método Evolutivo
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Combina o valor da terra nua (VTN) com as benfeitorias depreciadas, ajustadas por fator de comercialização.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Valor Evolutivo</span>
            <p className="text-lg font-extrabold text-purple-600 dark:text-purple-400">
              R$ {resultadoEvolutivo.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Painel de Configuração do Método da Renda */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          Parâmetros do Método da Capitalização da Renda
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Fluxo de Caixa Líquido Anual (R$)
            </label>
            <input
              type="number"
              min="0"
              value={fluxoLiquidoAnual || ''}
              onChange={(e) => setFluxoLiquidoAnual(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Taxa de Desconto Anual (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={taxaDesconto || ''}
              onChange={(e) => setTaxaDesconto(parseFloat(e.target.value) || 0)}
              placeholder="0,0"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Horizonte de Projeção (Anos)
            </label>
            <input
              type="number"
              min="0"
              value={horizonteAnos || ''}
              onChange={(e) => setHorizonteAnos(parseInt(e.target.value, 10) || 0)}
              placeholder="0"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Valor Residual de Saída (R$)
            </label>
            <input
              type="number"
              min="0"
              value={valorResidual || ''}
              onChange={(e) => setValorResidual(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Tabela de Sensibilidade da Renda */}
        <div className="pt-2">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Matriz de Análise de Sensibilidade (Variação de Receitas vs VPL)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {resultadoRenda.sensibilidade.map((s, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">{s.cenario}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Taxa: {s.taxaDescontoPct}% • Variação: {s.variacaoReceitaPct > 0 ? `+${s.variacaoReceitaPct}` : s.variacaoReceitaPct}%</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block mt-1">
                  R$ {s.vplR$.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel de Configuração do Método Evolutivo */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
          <Building className="w-4 h-4 text-emerald-500" />
          Parâmetros do Método Evolutivo [ Vi = (VTN + Benfeitorias) × Fc ]
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Fator de Comercialização (Fc)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={fatorComercializacaoFc || ''}
              onChange={(e) => setFatorComercializacaoFc(parseFloat(e.target.value) || 0)}
              placeholder="Ex: 1.00"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-bold text-purple-600 dark:text-purple-400 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Típico entre 0.90 e 1.10</span>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Justificativa Técnica do Fator de Comercialização
            </label>
            <input
              type="text"
              value={justificativaFc}
              onChange={(e) => setJustificativaFc(e.target.value)}
              placeholder="Informe a justificativa técnica para o fator de comercialização..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
