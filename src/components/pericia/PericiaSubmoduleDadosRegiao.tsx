import React, { useState, useEffect } from 'react';
import { CloudSun, Info, Save, HelpCircle, Thermometer, Droplets, Landmark } from 'lucide-react';
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Info Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-emerald-600 animate-pulse" />
              Caracterização Física e Climatológica da Região
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Registre as características agroclimáticas gerais e o histórico de temperatura e precipitação mensal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyTemplate}
              type="button"
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Preencher com modelo padrão de Cerrado/Tropical"
            >
              <Info className="w-3.5 h-3.5 text-amber-500" />
              <span>Inserir Modelo Sugerido</span>
            </button>

            <button
              onClick={handleSave}
              className={`px-4 py-2 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
                isSaved
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSaved ? 'Dados Salvos!' : 'Salvar Dados da Região'}
            </button>
          </div>
        </div>

        {/* Section 1: Características Gerais */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
            Características da Região (Solo, Relevo, Vegetação e Clima)
          </label>
          <textarea
            rows={4}
            value={caracteristicas}
            onChange={e => {
              setCaracteristicas(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Descreva o relevo, tipo de solo predominante, vegetação típica e aspectos climáticos gerais da localidade periciada..."
            className="w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs leading-relaxed focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <p className="text-[10px] text-slate-400">
            ℹ️ Essas informações apoiam a fundamentação do laudo e ajudam a contextualizar as vulnerabilidades geográficas.
          </p>
        </div>
      </div>

      {/* Section 2: Tabela de Dados Climatológicos dos 12 Meses */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2">
          <Thermometer className="w-5 h-5 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Histórico de Dados Climatológicos dos 12 Meses (Média Mensal Histórica)
          </h4>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-zinc-850">
          <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
            <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="p-3 font-bold">Mês do Ano</th>
                <th className="p-3 font-bold text-center">Mínima (°C)</th>
                <th className="p-3 font-bold text-center">Máxima (°C)</th>
                <th className="p-3 font-bold text-center">Precipitação Média (mm)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {climaData.map((d, index) => (
                <tr key={d.mes} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/20 transition-colors">
                  <td className="p-3 font-bold text-slate-950 dark:text-white">{d.mes}</td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={d.minima}
                        onChange={e => handleClimateValueChange(index, 'minima', e.target.value)}
                        className="w-16 p-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-center text-xs font-semibold focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center justify-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        value={d.maxima}
                        onChange={e => handleClimateValueChange(index, 'maxima', e.target.value)}
                        className="w-16 p-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-center text-xs font-semibold focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center justify-center gap-1">
                      <input
                        type="number"
                        value={d.precipitacao}
                        onChange={e => handleClimateValueChange(index, 'precipitacao', e.target.value)}
                        className="w-18 p-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-center text-xs font-semibold focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 p-3.5 bg-slate-50 dark:bg-zinc-850/40 rounded-xl border border-slate-150 border-dashed text-[10px] text-slate-500">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            💡 Os dados climatológicos editáveis acima constituem a base histórica oficial de confronto para sinistros decorrentes de estiagens severas, excessos de umidade ou flutuações anômalas de temperatura na região.
          </span>
        </div>
      </div>
    </div>
  );
};
