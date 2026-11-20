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
import { Scale, DollarSign, Building, CheckCircle2, Save } from 'lucide-react';

interface Props {
  avaliacao: AvaliacaoCompletaImovel;
  onAtualizarMetodoPrincipal: (metodo: MetodoAvaliacaoPrincipal) => void;
  onSalvarConfiguracoes: (
    capRenda?: MetodoCapitalizacaoRendaConfig,
    evolutivo?: MetodoEvolutivoConfig
  ) => void;
}

const inputCls =
  'w-full h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';
const labelCls = 'block text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const AvaliacaoMetodosView: React.FC<Props> = ({
  avaliacao,
  onAtualizarMetodoPrincipal,
  onSalvarConfiguracoes
}) => {
  const [metodoAtivo, setMetodoAtivo] = useState<MetodoAvaliacaoPrincipal>(
    avaliacao.metodoPrincipal || 'comparativo_direto'
  );

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
      valorInstalacoesEquipamentosR$:
        avaliacao.metodoEvolutivo?.valorInstalacoesEquipamentosR$ ?? 0,
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
    <div className="space-y-5">
      {/* Barra Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Métodos de Avaliação de Imóveis Rurais (ABNT NBR 14653-3)
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Conciliação entre Comparativo Direto, Capitalização da Renda e Método Evolutivo
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sucesso && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Salvo
            </span>
          )}
          <button
            type="button"
            onClick={handleSalvar}
            className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> Definir Método & Salvar
          </button>
        </div>
      </div>

      {/* Seleção do Método Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setMetodoAtivo('comparativo_direto')}
          className={`p-4 text-left rounded-xl border transition-colors ${
            metodoAtivo === 'comparativo_direto'
              ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/25'
              : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              Método Preferencial
            </span>
            <input
              type="radio"
              name="metodo"
              checked={metodoAtivo === 'comparativo_direto'}
              onChange={() => setMetodoAtivo('comparativo_direto')}
              className="accent-emerald-600"
            />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-3">
            Comparativo Direto de Mercado
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Identifica o valor pelo tratamento estatístico e homogeneização de dados de mercado assemelhados.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-medium">
              Valor Concluído
            </span>
            <p className="text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              R$ {avaliacao.valorFinalImovelR$.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMetodoAtivo('capitalizacao_renda')}
          className={`p-4 text-left rounded-xl border transition-colors ${
            metodoAtivo === 'capitalizacao_renda'
              ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/25'
              : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400">
              Fluxo Descontado
            </span>
            <input
              type="radio"
              name="metodo"
              checked={metodoAtivo === 'capitalizacao_renda'}
              onChange={() => setMetodoAtivo('capitalizacao_renda')}
              className="accent-emerald-600"
            />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-3">
            Capitalização da Renda Líquida
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Calcula o valor presente líquido das receitas operacionais futuras descontadas por taxa de atratividade.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-medium">
              VPL da Propriedade
            </span>
            <p className="text-lg font-bold tabular-nums text-sky-600 dark:text-sky-400">
              R$ {resultadoRenda.valorPresenteLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMetodoAtivo('evolutivo')}
          className={`p-4 text-left rounded-xl border transition-colors ${
            metodoAtivo === 'evolutivo'
              ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/25'
              : 'border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400">
              Soma com Fator Fc
            </span>
            <input
              type="radio"
              name="metodo"
              checked={metodoAtivo === 'evolutivo'}
              onChange={() => setMetodoAtivo('evolutivo')}
              className="accent-emerald-600"
            />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-3">
            Método Evolutivo
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
            Combina o valor da terra nua (VTN) com as benfeitorias depreciadas, ajustadas por fator de comercialização.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-medium">
              Valor Evolutivo
            </span>
            <p className="text-lg font-bold tabular-nums text-violet-600 dark:text-violet-400">
              R$ {resultadoEvolutivo.valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </button>
      </div>

      {/* Painel de Configuração do Método da Renda */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Parâmetros do Método da Capitalização da Renda
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Fluxo de Caixa Líquido Anual (R$)</label>
            <input
              type="number"
              min="0"
              value={fluxoLiquidoAnual || ''}
              onChange={(e) => setFluxoLiquidoAnual(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className={`${inputCls} font-semibold tabular-nums`}
            />
          </div>

          <div>
            <label className={labelCls}>Taxa de Desconto Anual (%)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={taxaDesconto || ''}
              onChange={(e) => setTaxaDesconto(parseFloat(e.target.value) || 0)}
              placeholder="0,0"
              className={`${inputCls} tabular-nums`}
            />
          </div>

          <div>
            <label className={labelCls}>Horizonte de Projeção (Anos)</label>
            <input
              type="number"
              min="0"
              value={horizonteAnos || ''}
              onChange={(e) => setHorizonteAnos(parseInt(e.target.value, 10) || 0)}
              placeholder="0"
              className={`${inputCls} tabular-nums`}
            />
          </div>

          <div>
            <label className={labelCls}>Valor Residual de Saída (R$)</label>
            <input
              type="number"
              min="0"
              value={valorResidual || ''}
              onChange={(e) => setValorResidual(parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className={`${inputCls} tabular-nums`}
            />
          </div>
        </div>

        <div className="pt-2">
          <h4 className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-2">
            Matriz de Sensibilidade (Variação de Receitas vs VPL)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {resultadoRenda.sensibilidade.map((s, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 text-xs"
              >
                <span className="font-semibold text-slate-900 dark:text-zinc-100 block">
                  {s.cenario}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                  Taxa: {s.taxaDescontoPct}% · Variação:{' '}
                  {s.variacaoReceitaPct > 0 ? `+${s.variacaoReceitaPct}` : s.variacaoReceitaPct}%
                </span>
                <span className="text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400 block mt-1">
                  R$ {s.vplR$.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel de Configuração do Método Evolutivo */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Parâmetros do Método Evolutivo [ Vi = (VTN + Benfeitorias) × Fc ]
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Fator de Comercialização (Fc)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={fatorComercializacaoFc || ''}
              onChange={(e) => setFatorComercializacaoFc(parseFloat(e.target.value) || 0)}
              placeholder="Ex: 1.00"
              className={`${inputCls} font-semibold tabular-nums text-violet-600 dark:text-violet-400`}
            />
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 block">
              Faixa típica entre 0,90 e 1,10
            </span>
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>Justificativa Técnica do Fator de Comercialização</label>
            <input
              type="text"
              value={justificativaFc}
              onChange={(e) => setJustificativaFc(e.target.value)}
              placeholder="Informe a justificativa técnica para o fator de comercialização..."
              className={inputCls}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
