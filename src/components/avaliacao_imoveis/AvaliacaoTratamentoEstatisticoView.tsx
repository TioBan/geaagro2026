import React from 'react';
import { EstatisticaTratamento, ImovelComparativoMercado } from '../../types/avaliacaoImoveis';
import { Sigma, ShieldCheck, Scale } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface Props {
  estatistica: EstatisticaTratamento;
  comparativos: ImovelComparativoMercado[];
}

export const AvaliacaoTratamentoEstatisticoView: React.FC<Props> = ({
  estatistica,
  comparativos
}) => {
  const comparativosValidos = comparativos.filter((c) => c.statusInclusao === 'incluido');

  const dadosGrafico = comparativosValidos.map((c) => ({
    x: c.areaTotalHa,
    y: c.fatores?.valorHomogeneizadoPorHaR$ || c.precoPorHectareR$,
    codigo: c.codigo,
    nome: c.identificacao
  }));

  return (
    <div className="space-y-5">
      {/* Cabeçalho + Faixa das 6 Medidas Estatísticas */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Sigma className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Tratamento Estatístico & Enquadramento NBR 14653-3
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Inferência estatística, dispersão, intervalo de confiança (80%) e campo de arbítrio
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60 text-xs font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Fundamentação: {estatistica.grauFundamentacaoApurado}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border border-sky-200/70 dark:border-sky-800/60 text-xs font-medium flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Precisão: {estatistica.grauPrecisaoApurado}
            </span>
          </div>
        </div>

        {/* Hairline KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-t border-slate-200/80 dark:border-zinc-800 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800">
          <div className="p-3.5">
            <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Média Homog.
            </span>
            <p className="text-base font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
              R$ {estatistica.mediaR$PorHa.toLocaleString('pt-BR')}/ha
            </p>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">Ponto central</span>
          </div>

          <div className="p-3.5">
            <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Mediana
            </span>
            <p className="text-base font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
              R$ {estatistica.medianaR$PorHa.toLocaleString('pt-BR')}/ha
            </p>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">Resistente a outliers</span>
          </div>

          <div className="p-3.5">
            <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Desvio Padrão
            </span>
            <p className="text-base font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1">
              R$ {estatistica.desvioPadraoR$PorHa.toLocaleString('pt-BR')}
            </p>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">Dispersão absoluta</span>
          </div>

          <div className="p-3.5">
            <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Coef. Variação
            </span>
            <p
              className={`text-base font-semibold tabular-nums mt-1 ${
                estatistica.coeficienteVariacaoPct <= 20
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {estatistica.coeficienteVariacaoPct.toFixed(2)}%
            </p>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">≤ 20% = bom rigor</span>
          </div>

          <div className="p-3.5">
            <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Mínimo / Máximo
            </span>
            <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-zinc-100 mt-1.5">
              R$ {(estatistica.minimoR$PorHa / 1000).toFixed(0)}k a {(estatistica.maximoR$PorHa / 1000).toFixed(0)}k
            </p>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
              Amp: R$ {estatistica.amplitudeR$PorHa.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="p-3.5">
            <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Amostras Válidas
            </span>
            <p className="text-base font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              {estatistica.quantidadeAmostras}
            </p>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">No cálculo</span>
          </div>
        </div>
      </div>

      {/* Intervalo de Confiança & Campo de Arbítrio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              Intervalo de Confiança de 80% (t-Student)
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">NBR 14653-3</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Faixa estatística onde a média populacional de mercado está contida com 80% de probabilidade:
          </p>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60">
            <div className="px-3.5 py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-zinc-400">Limite Inferior (80%)</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                R$ {estatistica.intervaloConfianca80Min.toLocaleString('pt-BR')}/ha
              </span>
            </div>
            <div className="px-3.5 py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-zinc-400">Limite Superior (80%)</span>
              <span className="font-semibold tabular-nums text-slate-900 dark:text-zinc-100">
                R$ {estatistica.intervaloConfianca80Max.toLocaleString('pt-BR')}/ha
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
              Campo de Arbítrio (±15%)
            </h3>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              Tolerância Legal
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Margem pericial admissível para arbitramento fundamentado de valor sem descaracterizar o método:
          </p>
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/60">
            <div className="px-3.5 py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-zinc-400">Mínimo Admissível (-15%)</span>
              <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                R$ {estatistica.intervaloToleranciaMin15Pct.toLocaleString('pt-BR')}/ha
              </span>
            </div>
            <div className="px-3.5 py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-zinc-400">Máximo Admissível (+15%)</span>
              <span className="font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                R$ {estatistica.intervaloToleranciaMax15Pct.toLocaleString('pt-BR')}/ha
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Dispersão Preço x Área */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Dispersão Amostral & Modelo Linear de Preço por Hectare
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Relação entre Área Total (ha) e Preço Homogeneizado (R$/ha)
            </p>
          </div>
          {estatistica.regressao && (
            <span className="text-xs font-mono tabular-nums font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 w-fit">
              {estatistica.regressao.equacao} (R² = {(estatistica.regressao.r2 * 100).toFixed(1)}%)
            </span>
          )}
        </div>

        <div className="h-64">
          {dadosGrafico.length === 0 ? (
            <div className="h-full flex items-center justify-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-500 dark:text-zinc-400">
              Cadastre ao menos uma amostra válida na etapa de Mercado para visualizar a dispersão.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 16, right: 16, bottom: 16, left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Área"
                  unit=" ha"
                  stroke="#64748b"
                  fontSize={11}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Preço/ha"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-zinc-900 text-zinc-100 p-2.5 rounded-lg border border-zinc-700 text-xs">
                          <p className="font-semibold text-emerald-400">
                            {data.codigo} · {data.nome}
                          </p>
                          <p className="text-zinc-300 mt-0.5 tabular-nums">
                            Área: {data.x.toLocaleString('pt-BR')} ha
                          </p>
                          <p className="text-emerald-300 font-semibold tabular-nums">
                            Valor: R$ {data.y.toLocaleString('pt-BR')}/ha
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={estatistica.mediaR$PorHa} stroke="#10b981" strokeDasharray="4 4" />
                <Scatter name="Comparativos" data={dadosGrafico} fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
