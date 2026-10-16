import React, { useState } from 'react';
import {
  Sprout,
  FlaskConical,
  Bug,
  AlertTriangle,
  CloudSun,
  Droplets,
  TrendingDown,
  Brain,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Layers,
  Activity,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { Pericia, PericiaHipoteseTecnica } from '../../types/pericia';

interface PericiaSubmoduleAnaliseProps {
  pericia: Pericia;
  onUpdatePericia: (updated: Pericia) => void;
}

export const PericiaSubmoduleAnalise: React.FC<PericiaSubmoduleAnaliseProps> = ({
  pericia,
  onUpdatePericia,
}) => {
  const [activeTab, setActiveTab] = useState<
    'cultura' | 'solo' | 'hipoteses' | 'fitotoxicidade' | 'clima' | 'diagnostico'
  >('cultura');

  // New Hipótese State
  const [newHipotese, setNewHipotese] = useState<{
    descricao: string;
    probabilidade: 'alta' | 'media' | 'baixa' | 'descartada';
  }>({
    descricao: '',
    probabilidade: 'alta',
  });

  const analise = pericia.analiseTecnica;

  // Handlers
  const handleCulturaChange = (field: string, value: any) => {
    onUpdatePericia({
      ...pericia,
      analiseTecnica: {
        ...analise,
        caracterizacaoCultura: {
          ...analise.caracterizacaoCultura,
          [field]: value,
        },
      },
      atualizadoEm: new Date().toISOString(),
    });
  };

  const handleFitotoxicidadeChange = (field: string, value: any) => {
    onUpdatePericia({
      ...pericia,
      analiseTecnica: {
        ...analise,
        fitotoxicidade: {
          ...analise.fitotoxicidade,
          [field]: value,
        },
      },
      atualizadoEm: new Date().toISOString(),
    });
  };

  const handleAddHipotese = () => {
    if (!newHipotese.descricao) return;
    const hip: PericiaHipoteseTecnica = {
      id: `hip-${Date.now()}`,
      descricao: newHipotese.descricao,
      evidenciasSustentacao: ['Vistoria de Campo'],
      probabilidade: newHipotese.probabilidade,
      status: 'em_investigacao',
    };
    onUpdatePericia({
      ...pericia,
      analiseTecnica: {
        ...analise,
        hipotesesTecnicas: [...analise.hipotesesTecnicas, hip],
      },
      atualizadoEm: new Date().toISOString(),
    });
    setNewHipotese({ descricao: '', probabilidade: 'alta' });
  };

  const handleRemoveHipotese = (id: string) => {
    onUpdatePericia({
      ...pericia,
      analiseTecnica: {
        ...analise,
        hipotesesTecnicas: analise.hipotesesTecnicas.filter(h => h.id !== id),
      },
      atualizadoEm: new Date().toISOString(),
    });
  };

  // Solo & Nutrição Handlers & Calculations
  const solo = analise.analiseSoloNutricao || {
    phCaCl2: 5.6,
    materiaOrganicaPercent: 3.2,
    fosforoP: 18,
    potassioK: 0.35,
    calcioCa: 4.5,
    magnesioMg: 1.5,
    ctc: 10.2,
    vPercent: 62.5,
    mPercent: 0,
    compactacaoSolo: '',
    observacoes: '',
  };

  const handleSoloChange = (field: string, value: any) => {
    onUpdatePericia({
      ...pericia,
      analiseTecnica: {
        ...analise,
        analiseSoloNutricao: {
          ...solo,
          [field]: value,
        },
      },
      atualizadoEm: new Date().toISOString(),
    });
  };

  const handleLoadDefaultSoilData = () => {
    onUpdatePericia({
      ...pericia,
      analiseTecnica: {
        ...analise,
        analiseSoloNutricao: {
          ...solo,
          laboratorio: 'Laboratório Central de Solos & Foliar (Certificado ISO/IEC 17025)',
          numeroLaudo: 'LAB-2024/9841',
          dataColeta: new Date().toISOString().split('T')[0],
          profundidadeAmostra: '0 - 20 cm',
          texturaSolo: 'Argilosa (Teor de argila > 40%)',
          teorArgilaPercent: 48,
          phCaCl2: 5.7,
          materiaOrganicaPercent: 3.4,
          fosforoP: 22.0,
          potassioK: 0.42,
          calcioCa: 5.2,
          magnesioMg: 1.8,
          aluminioAl: 0.0,
          hMaisAl: 3.6,
          ctc: 11.02,
          vPercent: 67.3,
          mPercent: 0.0,
          enxofreS: 14.5,
          compactacaoSolo: 'Camada adensada a 18-24 cm detectada por penetrometria (RP média 2,4 MPa); sem impedimento químico subsuperficial',
          drenagemSolo: 'Boa a moderada, sem indícios de hidromorfismo ou encharcamento',
          observacoes: 'A fertilidade do solo encontra-se em níveis adequados e compatíveis com altas produtividades (V% de 67,3%, pH CaCl2 5,7 e ausência de Al³⁺ tóxico), afastando a hipótese de que a quebra de safra periciada decorreu de deficiência nutricional primária ou acidez extrema.',
        },
      },
      atualizadoEm: new Date().toISOString(),
    });
  };

  // Real-time soil calculations
  const ca = Number(solo.calcioCa || 0);
  const mg = Number(solo.magnesioMg || 0);
  const k = Number(solo.potassioK || 0);
  const al = Number(solo.aluminioAl || 0);
  const hAl = Number(solo.hMaisAl || 3.5);
  const somaBasesCalc = ca + mg + k;
  const ctcCalc = somaBasesCalc + hAl;
  const vPercentCalc = ctcCalc > 0 ? Math.min(100, (somaBasesCalc / ctcCalc) * 100) : (solo.vPercent || 0);
  const mPercentCalc = (somaBasesCalc + al) > 0 ? (al / (somaBasesCalc + al)) * 100 : (solo.mPercent || 0);

  // Calculate Physical Loss
  const prodEsperada = analise.caracterizacaoCultura?.produtividadeEsperadaKgHa || 0;
  const prodObservada = analise.caracterizacaoCultura?.produtividadeObservadaKgHa || 0;
  const perdaFisicaKgHa = Math.max(0, prodEsperada - prodObservada);
  const perdaFisicaPercent = prodEsperada > 0 ? ((perdaFisicaKgHa / prodEsperada) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Submodule Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-zinc-800/80 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs">
        <button
          onClick={() => setActiveTab('cultura')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'cultura'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          3.1 Cultura & Produtividade
        </button>

        <button
          onClick={() => setActiveTab('solo')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'solo'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          3.2 Solo & Nutrição
        </button>

        <button
          onClick={() => setActiveTab('fitotoxicidade')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'fitotoxicidade'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          3.5 Fitotoxicidade & Deriva
        </button>

        <button
          onClick={() => setActiveTab('hipoteses')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'hipoteses'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          3.3 Hipóteses Técnicas ({analise.hipotesesTecnicas.length})
        </button>

        <button
          onClick={() => setActiveTab('diagnostico')}
          className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'diagnostico'
              ? 'bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          3.9 Diagnóstico Estruturado
        </button>
      </div>

      {/* 3.1 CULTURA E PRODUTIVIDADE */}
      {activeTab === 'cultura' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              3.1 Caracterização Agronômica da Cultura e Apuração de Perda Física
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Cultura Agrícola</label>
              <input
                type="text"
                value={analise.caracterizacaoCultura?.cultura || ''}
                onChange={e => handleCulturaChange('cultura', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Cultivar / Híbrido</label>
              <input
                type="text"
                value={analise.caracterizacaoCultura?.cultivar || ''}
                onChange={e => handleCulturaChange('cultivar', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Área Cultivada (ha)</label>
              <input
                type="number"
                step="0.1"
                value={analise.caracterizacaoCultura?.areaHa || 0}
                onChange={e => handleCulturaChange('areaHa', Number(e.target.value))}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Produtividade Esperada (kg/ha)</label>
              <input
                type="number"
                value={analise.caracterizacaoCultura?.produtividadeEsperadaKgHa || 0}
                onChange={e => handleCulturaChange('produtividadeEsperadaKgHa', Number(e.target.value))}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-emerald-700 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Produtividade Observada (kg/ha)</label>
              <input
                type="number"
                value={analise.caracterizacaoCultura?.produtividadeObservadaKgHa || 0}
                onChange={e => handleCulturaChange('produtividadeObservadaKgHa', Number(e.target.value))}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-amber-700 dark:text-amber-400"
              />
            </div>

            {/* Calculated Physical Loss Badge */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Perda Física Calculada
              </span>
              <p className="text-lg font-black text-amber-900 dark:text-amber-200">
                {perdaFisicaKgHa.toLocaleString('pt-BR')} kg/ha ({perdaFisicaPercent}%)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3.2 SOLO & NUTRIÇÃO */}
      {activeTab === 'solo' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-150 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-600" />
                3.2 Avaliação Edáfica: Fertilidade do Solo, Nutrição Mineral e Física
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Preencha os dados do laudo laboratorial de fertilidade para afastar ou comprovar nexo de causalidade nutricional.
              </p>
            </div>

            <button
              onClick={handleLoadDefaultSoilData}
              className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Preencher com laudo laboratorial de referência típico"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Carregar Laudo Padrão
            </button>
          </div>

          {/* Quick Real-Time Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* V% Saturação por Bases */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${
              vPercentCalc >= 60
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                : vPercentCalc >= 50
                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                Saturação por Bases (V%)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                  {vPercentCalc.toFixed(1)}%
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  vPercentCalc >= 60 ? 'bg-emerald-200 text-emerald-800' : vPercentCalc >= 50 ? 'bg-amber-200 text-amber-800' : 'bg-rose-200 text-rose-800'
                }`}>
                  {vPercentCalc >= 60 ? 'Adequado' : vPercentCalc >= 50 ? 'Médio' : 'Crítico'}
                </span>
              </div>
            </div>

            {/* pH em CaCl2 */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                pH (CaCl₂)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                  {Number(solo.phCaCl2 || 0).toFixed(2)}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  solo.phCaCl2 >= 5.5 && solo.phCaCl2 <= 6.3
                    ? 'bg-emerald-100 text-emerald-800'
                    : solo.phCaCl2 < 5.0
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {solo.phCaCl2 >= 5.5 && solo.phCaCl2 <= 6.3 ? 'Ideal' : solo.phCaCl2 < 5.0 ? 'Ácido' : 'Moderado'}
                </span>
              </div>
            </div>

            {/* CTC a pH 7.0 (T) */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                CTC pH 7.0 (T) & Soma Bases
              </span>
              <div className="mt-1">
                <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                  {ctcCalc.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 ml-1">cmolc/dm³</span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  SB: {somaBasesCalc.toFixed(2)} cmolc/dm³
                </p>
              </div>
            </div>

            {/* Toxidez de Alumínio (m%) */}
            <div className={`p-3 rounded-xl border flex flex-col justify-between ${
              mPercentCalc === 0
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                Saturação Alumínio (m%)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                  {mPercentCalc.toFixed(1)}%
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  mPercentCalc === 0 ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                }`}>
                  {mPercentCalc === 0 ? 'Sem Al³⁺ Tóxico' : 'Alerta Al³⁺'}
                </span>
              </div>
            </div>
          </div>

          {/* Subcard 1: Identificação da Amostragem e Laudo Laboratorial */}
          <div className="bg-slate-50/80 dark:bg-zinc-850/60 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              1. Identificação do Laudo Laboratorial e Textura
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-500 font-semibold mb-1">Laboratório Responsável</label>
                <input
                  type="text"
                  placeholder="Ex: Laboratório Central Agro (ISO 17025)"
                  value={solo.laboratorio || ''}
                  onChange={e => handleSoloChange('laboratorio', e.target.value)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Nº do Laudo Laboratorial</label>
                <input
                  type="text"
                  placeholder="Ex: LAB-2024/7821"
                  value={solo.numeroLaudo || ''}
                  onChange={e => handleSoloChange('numeroLaudo', e.target.value)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Data da Coleta / Análise</label>
                <input
                  type="date"
                  value={solo.dataColeta || ''}
                  onChange={e => handleSoloChange('dataColeta', e.target.value)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Profundidade da Amostragem</label>
                <select
                  value={solo.profundidadeAmostra || '0 - 20 cm'}
                  onChange={e => handleSoloChange('profundidadeAmostra', e.target.value)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium"
                >
                  <option value="0 - 20 cm">0 - 20 cm (Camada Arável)</option>
                  <option value="20 - 40 cm">20 - 40 cm (Subsuperfície)</option>
                  <option value="0 - 40 cm">0 - 40 cm (Perfil Combinado)</option>
                  <option value="40 - 60 cm">40 - 60 cm (Diagnóstico Profundo)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-500 font-semibold mb-1">Classe Textural do Solo</label>
                <input
                  type="text"
                  placeholder="Ex: Argilosa (35% a 60% de Argila) ou Latossolo Vermelho"
                  value={solo.texturaSolo || ''}
                  onChange={e => handleSoloChange('texturaSolo', e.target.value)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Teor de Argila (%)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 45"
                  value={solo.teorArgilaPercent ?? ''}
                  onChange={e => handleSoloChange('teorArgilaPercent', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Subcard 2: Análise Química e Macronutrientes */}
          <div className="bg-slate-50/80 dark:bg-zinc-850/60 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
              2. Parâmetros Químicos de Fertilidade (Macronutrientes)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
              {/* pH CaCl2 */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">pH em CaCl₂</label>
                <input
                  type="number"
                  step="0.01"
                  value={solo.phCaCl2 ?? ''}
                  onChange={e => handleSoloChange('phCaCl2', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                />
              </div>

              {/* Matéria Orgânica */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Matéria Orgânica (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={solo.materiaOrganicaPercent ?? ''}
                  onChange={e => handleSoloChange('materiaOrganicaPercent', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                />
              </div>

              {/* Fósforo P */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Fósforo P (mg/dm³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={solo.fosforoP ?? ''}
                  onChange={e => handleSoloChange('fosforoP', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-amber-700 dark:text-amber-400"
                />
              </div>

              {/* Potássio K */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Potássio K (cmolc/dm³)</label>
                <input
                  type="number"
                  step="0.01"
                  value={solo.potassioK ?? ''}
                  onChange={e => handleSoloChange('potassioK', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                />
              </div>

              {/* Cálcio Ca */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Cálcio Ca (cmolc/dm³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={solo.calcioCa ?? ''}
                  onChange={e => handleSoloChange('calcioCa', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-emerald-700 dark:text-emerald-400"
                />
              </div>

              {/* Magnésio Mg */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Magnésio Mg (cmolc/dm³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={solo.magnesioMg ?? ''}
                  onChange={e => handleSoloChange('magnesioMg', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                />
              </div>

              {/* Alumínio Al3+ */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Alumínio Al³⁺ (cmolc/dm³)</label>
                <input
                  type="number"
                  step="0.05"
                  value={solo.aluminioAl ?? 0}
                  onChange={e => handleSoloChange('aluminioAl', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-rose-700 dark:text-rose-400"
                />
              </div>

              {/* H+Al Acidez Potencial */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">H + Al (cmolc/dm³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={solo.hMaisAl ?? 3.5}
                  onChange={e => handleSoloChange('hMaisAl', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                />
              </div>

              {/* Enxofre S */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Enxofre S (mg/dm³)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 12.0"
                  value={solo.enxofreS ?? ''}
                  onChange={e => handleSoloChange('enxofreS', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold"
                />
              </div>

              {/* V% Registrado */}
              <div>
                <label className="block text-slate-500 font-semibold mb-1">V% (Saturação Bases)</label>
                <input
                  type="number"
                  step="0.1"
                  value={solo.vPercent ?? ''}
                  onChange={e => handleSoloChange('vPercent', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-mono font-bold text-emerald-700 dark:text-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Subcard 3: Física do Solo, Compactação e Drenagem */}
          <div className="bg-slate-50/80 dark:bg-zinc-850/60 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              3. Física do Solo, Compactação Mecânica e Condições Hídricas
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  Compactação e Resistência à Penetração (Penetrometria)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Camada adensada a 18-24 cm (RP 2,4 MPa); sem pé de grade impeditivo"
                  value={solo.compactacaoSolo || ''}
                  onChange={e => handleSoloChange('compactacaoSolo', e.target.value)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">
                  Condições de Drenagem e Permeabilidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: Solo bem drenado, sem sinais de encharcamento recente ou anoxia radicular"
                  value={solo.drenagemSolo || ''}
                  onChange={e => handleSoloChange('drenagemSolo', e.target.value)}
                  className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium"
                />
              </div>
            </div>
          </div>

          {/* Subcard 4: Parecer Pericial de Fertilidade e Nexo Causal Edáfico */}
          <div className="bg-slate-50/80 dark:bg-zinc-850/60 rounded-xl p-4 border border-slate-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-zinc-200 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                4. Parecer Pericial de Fertilidade e Nexo Causal Edáfico
              </label>
              <span className="text-[11px] text-slate-500">
                Texto para fundamentação no Laudo Oficial
              </span>
            </div>

            <textarea
              rows={3}
              placeholder="Ex: Conforme apurado nos laudos analíticos laboratoriais, os níveis de fertilidade, pH e saturação por bases encontram-se plenamente adequados ao cultivo periciado, restando afastada a hipótese de que as perdas ou anomalias decorreram de deficiência mineral ou impedimentos de solo..."
              value={solo.observacoes || ''}
              onChange={e => handleSoloChange('observacoes', e.target.value)}
              className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-normal leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* 3.3 HIPÓTESES TÉCNICAS */}
      {activeTab === 'hipoteses' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-600" />
              3.3 Formulação e Avaliação de Hipóteses Causais
            </h3>
            <span className="text-xs text-amber-600 font-semibold">
              Hipóteses são abertas sem gerar conclusão automática
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              Cadastrar Hipótese Técnica
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Descrição da Hipótese Causal *"
                value={newHipotese.descricao}
                onChange={e => setNewHipotese({ ...newHipotese, descricao: e.target.value })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl md:col-span-2"
              />
              <select
                value={newHipotese.probabilidade}
                onChange={e => setNewHipotese({ ...newHipotese, probabilidade: e.target.value as any })}
                className="p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              >
                <option value="alta">Probabilidade ALTA</option>
                <option value="media">Probabilidade MÉDIA</option>
                <option value="baixa">Probabilidade BAIXA</option>
                <option value="descartada">DESCARTADA</option>
              </select>
            </div>
            <button
              onClick={handleAddHipotese}
              disabled={!newHipotese.descricao}
              className="px-4 py-2 bg-emerald-600 disabled:opacity-50 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Registrar Hipótese
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {analise.hipotesesTecnicas.map(hip => (
              <div
                key={hip.id}
                className="p-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{hip.descricao}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        hip.probabilidade === 'alta'
                          ? 'bg-emerald-100 text-emerald-800'
                          : hip.probabilidade === 'descartada'
                          ? 'bg-slate-200 text-slate-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {hip.probabilidade}
                    </span>
                    <button
                      onClick={() => handleRemoveHipotese(hip.id)}
                      className="text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  <strong>Evidências de Sustentação:</strong> {hip.evidenciasSustentacao.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3.5 FITOTOXICIDADE */}
      {activeTab === 'fitotoxicidade' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-emerald-600" />
              3.5 Avaliação de Fitotoxicidade e Deriva de Defensivos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Produto Comercial Utilizado/Atingido</label>
              <input
                type="text"
                value={analise.fitotoxicidade?.produtoUtilizado || ''}
                onChange={e => handleFitotoxicidadeChange('produtoUtilizado', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Ingrediente Ativo</label>
              <input
                type="text"
                value={analise.fitotoxicidade?.ingredienteAtivo || ''}
                onChange={e => handleFitotoxicidadeChange('ingredienteAtivo', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Dose Aplicada / Estimada</label>
              <input
                type="text"
                value={analise.fitotoxicidade?.doseAplicada || ''}
                onChange={e => handleFitotoxicidadeChange('doseAplicada', e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-slate-500 font-semibold mb-1">Sintomas Constatados e Padrão de Distribuição</label>
              <textarea
                rows={2}
                value={analise.fitotoxicidade?.sintomasConstatados || ''}
                onChange={e => handleFitotoxicidadeChange('sintomasConstatados', e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3.9 DIAGNÓSTICO ESTRUTURADO */}
      {activeTab === 'diagnostico' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              3.9 Estrutura do Diagnóstico Pericial
            </h3>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Observação Geral de Campo</label>
              <input
                type="text"
                value={analise.diagnosticoEstruturado?.observacaoGeral || ''}
                onChange={e =>
                  onUpdatePericia({
                    ...pericia,
                    analiseTecnica: {
                      ...analise,
                      diagnosticoEstruturado: { ...analise.diagnosticoEstruturado, observacaoGeral: e.target.value },
                    },
                  })
                }
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Evidência-Chave Determinante</label>
              <input
                type="text"
                value={analise.diagnosticoEstruturado?.evidenciaChave || ''}
                onChange={e =>
                  onUpdatePericia({
                    ...pericia,
                    analiseTecnica: {
                      ...analise,
                      diagnosticoEstruturado: { ...analise.diagnosticoEstruturado, evidenciaChave: e.target.value },
                    },
                  })
                }
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Análise Causal e Conclusão Técnica Preliminar</label>
              <textarea
                rows={3}
                value={analise.diagnosticoEstruturado?.conclusaoTecnicaPreliminar || ''}
                onChange={e =>
                  onUpdatePericia({
                    ...pericia,
                    analiseTecnica: {
                      ...analise,
                      diagnosticoEstruturado: {
                        ...analise.diagnosticoEstruturado,
                        conclusaoTecnicaPreliminar: e.target.value,
                      },
                    },
                  })
                }
                className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl font-medium"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
