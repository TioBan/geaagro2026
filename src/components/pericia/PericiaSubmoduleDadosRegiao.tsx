import React, { useState } from 'react';
import { CloudSun, Info, Save, Thermometer } from 'lucide-react';
import { Pericia } from '../../types/pericia';

interface PericiaSubmoduleDadosRegiaoProps {
  pericia: Pericia;
  onUpdatePericia: (updated: Pericia) => void;
}

const EMPTY_CLIMATE_DATA = [
  { mes: 'Janeiro', minima: 0, maxima: 0, precipitacao: 0 },
  { mes: 'Fevereiro', minima: 0, maxima: 0, precipitacao: 0 },
  { mes: 'Março', minima: 0, maxima: 0, precipitacao: 0 },
  { mes: 'Abril', minima: 0, maxima: 0, precipitacao: 0 },
  { mes: 'Maio', minima: 0, maxima: 0, precipitacao: 0 },
  { mes: 'Junho', minima: 0, maxima: 0, precipitacao: 0 },
  { mes: 'Julho', minima: 0, maxima: 0, precipitacao: 0 },
  { mes: 'Agosto', minima: 0, maxima: 0, precipitacao: 0 },
  { mes: 'Setembro', minima: 0, maxima: 0, precipitacao: 0 },
  { mes: 'Outubro', minima: 0, maxima: 0, precipitacao: 0 },
  { mes: 'Novembro', minima: 0, maxima: 0, precipitacao: 0 },
  { mes: 'Dezembro', minima: 0, maxima: 0, precipitacao: 0 },
];

const TEMPLATE_CERRADO_CLIMATE = [
  { mes: 'Janeiro', minima: 19.5, maxima: 29.5, precipitacao: 240 },
  { mes: 'Fevereiro', minima: 19.4, maxima: 29.8, precipitacao: 210 },
  { mes: 'Março', minima: 19.2, maxima: 30.1, precipitacao: 180 },
  { mes: 'Abril', minima: 17.5, maxima: 29.8, precipitacao: 80 },
  { mes: 'Maio', minima: 14.8, maxima: 29.0, precipitacao: 30 },
  { mes: 'Junho', minima: 12.5, maxima: 28.5, precipitacao: 5 },
  { mes: 'Julho', minima: 12.0, maxima: 28.6, precipitacao: 2 },
  { mes: 'Agosto', minima: 13.8, maxima: 30.5, precipitacao: 8 },
  { mes: 'Setembro', minima: 17.0, maxima: 32.5, precipitacao: 45 },
  { mes: 'Outubro', minima: 18.5, maxima: 31.8, precipitacao: 130 },
  { mes: 'Novembro', minima: 19.1, maxima: 30.0, precipitacao: 200 },
  { mes: 'Dezembro', minima: 19.4, maxima: 29.2, precipitacao: 260 },
];

const TEMPLATE_CHARACTERISTICS =
  'Região caracterizada pelo bioma Cerrado, relevo predominantemente plano a suave ondulado, favorável à mecanização agrícola intensiva. Solo predominante do tipo Latossolo Vermelho distrófico, argiloso, com alta capacidade de drenagem. O clima é tropical sazonal (Aw na classificação de Köppen), com estação chuvosa bem definida entre outubro e abril, e estiagem acentuada de maio a setembro.';

export const PericiaSubmoduleDadosRegiao: React.FC<PericiaSubmoduleDadosRegiaoProps> = ({
  pericia,
  onUpdatePericia,
}) => {
  const [caracteristicas, setCaracteristicas] = useState(
    pericia.dadosRegiao?.caracteristicas || ''
  );

  const [climaData, setClimaData] = useState(
    pericia.dadosRegiao?.dadosClimatologicos && pericia.dadosRegiao.dadosClimatologicos.length === 12
      ? pericia.dadosRegiao.dadosClimatologicos
      : EMPTY_CLIMATE_DATA
  );

  const [isSaved, setIsSaved] = useState(false);

  const handleApplyTemplate = () => {
    setCaracteristicas(TEMPLATE_CHARACTERISTICS);
    setClimaData(TEMPLATE_CERRADO_CLIMATE);
    setIsSaved(false);
  };

  const handleClimateValueChange = (index: number, field: 'minima' | 'maxima' | 'precipitacao', val: string) => {
    const numVal = parseFloat(val) || 0;
    const updated = [...climaData];
    updated[index] = {
      ...updated[index],
      [field]: numVal,
    };
    setClimaData(updated);
    setIsSaved(false);
  };

  const handleSave = () => {
    onUpdatePericia({
      ...pericia,
      dadosRegiao: {
        caracteristicas,
        dadosClimatologicos: climaData,
      },
      atualizadoEm: new Date().toISOString(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const totalPrecip = climaData.reduce((acc, d) => acc + (d.precipitacao || 0), 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Caracterização Física e Climatológica da Região</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              Aspectos agroclimáticos e série histórica mensal de temperatura e precipitação
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleApplyTemplate}
              type="button"
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Modelo Sugerido</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="h-8 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Salvo' : 'Salvar Dados'}</span>
            </button>
          </div>
        </div>

        <div className="p-5 space-y-2">
          <label className="block text-[11px] font-medium text-slate-600 dark:text-zinc-400">
            Características da Região (Solo, Relevo, Vegetação e Clima)
          </label>
          <textarea
            rows={4}
            value={caracteristicas}
            onChange={e => {
              setCaracteristicas(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Descreva relevo, solo predominante, vegetação típica e aspectos climáticos da localidade periciada..."
            className="w-full p-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* CLIMATE TABLE */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Médias Climatológicas Mensais (12 Meses)</span>
          </h4>
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
            Total anual: <strong className="font-semibold text-slate-800 dark:text-zinc-200">{totalPrecip.toLocaleString('pt-BR')} mm</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-zinc-800 text-[11px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/40">
                <th className="py-2.5 px-4">Mês</th>
                <th className="py-2.5 px-4 text-center">Mínima (°C)</th>
                <th className="py-2.5 px-4 text-center">Máxima (°C)</th>
                <th className="py-2.5 px-4 text-center">Precipitação Média (mm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {climaData.map((d, index) => (
                <tr key={d.mes} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="py-2 px-4 font-medium text-slate-900 dark:text-zinc-100">{d.mes}</td>
                  <td className="py-2 px-4 text-center">
                    <input
                      type="number"
                      step="0.1"
                      value={d.minima}
                      onChange={e => handleClimateValueChange(index, 'minima', e.target.value)}
                      className="w-20 h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 text-center text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <input
                      type="number"
                      step="0.1"
                      value={d.maxima}
                      onChange={e => handleClimateValueChange(index, 'maxima', e.target.value)}
                      className="w-20 h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 text-center text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <input
                      type="number"
                      value={d.precipitacao}
                      onChange={e => handleClimateValueChange(index, 'precipitacao', e.target.value)}
                      className="w-24 h-7 px-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950/60 text-slate-900 dark:text-zinc-100 text-center text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
