import React from 'react';
import { EstatisticaTratamento, ImovelComparativoMercado } from '../../types/avaliacaoImoveis';
import {
  Sigma,
  ShieldCheck,
  Scale
} from 'lucide-react';
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

  // Dados para o Scatter Plot (Preço Homogeneizado vs Área Total)
  const dadosGrafico = comparativosValidos.map((c) => ({
    x: c.areaTotalHa,
    y: c.fatores?.valorHomogeneizadoPorHaR$ || c.precoPorHectareR$,
    codigo: c.codigo,
    nome: c.identificacao
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sigma className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Tratamento Estatístico & Enquadramento Normativo NBR 14653-3
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Inferência estatística, dispersão, intervalo de confiança (80%), campo de arbítrio e enquadramento de graus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Fundamentação: {estatistica.grauFundamentacaoApurado}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 text-xs font-bold flex items-center gap-1.5">
            <Scale className="w-4 h-4" />
            Precisão: {estatistica.grauPrecisaoApurado}
          </div>
        </div>
      </div>

      {/* Grid de Medidas Estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Média Homogeneizada</span>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
            R$ {estatistica.mediaR$PorHa.toLocaleString('pt-BR')}/ha
          </p>
          <span className="text-[10px] text-slate-400">Ponto central da amostra</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Mediana</span>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
            R$ {estatistica.medianaR$PorHa.toLocaleString('pt-BR')}/ha
          </p>
          <span className="text-[10px] text-slate-400">Resistente a outliers</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Desvio Padrão</span>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
            R$ {estatistica.desvioPadraoR$PorHa.toLocaleString('pt-BR')}
          </p>
          <span className="text-[10px] text-slate-400">Variabilidade absoluta</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Coeficiente Variação</span>
          <p className={`text-base sm:text-lg font-bold mt-1 ${estatistica.coeficienteVariacaoPct <= 20 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {estatistica.coeficienteVariacaoPct.toFixed(2)}%
          </p>
          <span className="text-[10px] text-slate-400">&le; 20% = Ótimo rigor</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Mínimo / Máximo</span>
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1">
            R$ {(estatistica.minimoR$PorHa / 1000).toFixed(0)}k a {(estatistica.maximoR$PorHa / 1000).toFixed(0)}k
          </p>
          <span className="text-[10px] text-slate-400">Amp: R$ {estatistica.amplitudeR$PorHa.toLocaleString('pt-BR')}</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Amostras Válidas</span>
          <p className="text-base sm:text-lg font-bold text-emerald-600 mt-1">
            {estatistica.quantidadeAmostras}
          </p>
          <span className="text-[10px] text-slate-400">Efetivamente no cálculo</span>
        </div>
      </div>

      {/* Intervalo de Confiança & Tolerância (Campo de Arbítrio) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Intervalo de Confiança de 80% (t-Student)
            </h3>
            <span className="text-xs text-slate-400 font-medium">NBR 14653-3</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A faixa estatística onde a média populacional de mercado está contida com 80% de probabilidade:
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Limite Inferior (80%):</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              R$ {estatistica.intervaloConfianca80Min.toLocaleString('pt-BR')}/ha
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Limite Superior (80%):</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              R$ {estatistica.intervaloConfianca80Max.toLocaleString('pt-BR')}/ha
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Campo de Arbítrio / Intervalo Admissível (±15%)
            </h3>
            <span className="text-xs text-emerald-600 font-bold">Tolerância Legal</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Margem pericial admissível para arbitramento fundamentado de valor sem descaracterizar o método:
          </p>
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mínimo Admissível (-15%):</span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              R$ {estatistica.intervaloToleranciaMin15Pct.toLocaleString('pt-BR')}/ha
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Máximo Admissível (+15%):</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              R$ {estatistica.intervaloToleranciaMax15Pct.toLocaleString('pt-BR')}/ha
            </span>
          </div>
        </div>
      </div>

      {/* Gráfico de Dispersão Preço x Área */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Dispersão Amostral & Modelo Linear de Preço por Hectare
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Relação entre Área Total (ha) e Preço Homogeneizado (R$/ha)
            </p>
          </div>
          {estatistica.regressao && (
            <span className="text-xs font-mono font-semibold px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
              {estatistica.regressao.equacao} (R² = {(estatistica.regressao.r2 * 100).toFixed(1)}%)
            </span>
          )}
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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
                      <div className="bg-slate-900 text-white p-3 rounded-lg border border-slate-700 text-xs shadow-xl">
                        <p className="font-bold text-emerald-400">{data.codigo} - {data.nome}</p>
                        <p className="text-slate-300 mt-1">Área: {data.x.toLocaleString('pt-BR')} ha</p>
                        <p className="text-emerald-300 font-semibold">Valor: R$ {data.y.toLocaleString('pt-BR')}/ha</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={estatistica.mediaR$PorHa} stroke="#10b981" strokeDasharray="4 4" label="Média" />
              <Scatter name="Comparativos" data={dadosGrafico} fill="#10b981" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
