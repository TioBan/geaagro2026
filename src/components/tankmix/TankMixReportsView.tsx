import React, { useState } from 'react';
import {
  FileText,
  Printer,
  AlertTriangle,
} from 'lucide-react';
import { TankSelectedProduct, WaterQualityParameters, WeatherCondition, TankMixEvaluationResult } from '../../types/tankMix';
import { TANKMIX_PRODUCTS_DATABASE, POPULAR_TANK_RECIPES } from '../../data/tankMixData';

interface Props {
  selectedProducts: TankSelectedProduct[];
  evaluation: TankMixEvaluationResult;
  waterQuality: WaterQualityParameters;
  weather: WeatherCondition;
  farmName: string;
  plotName: string;
}

export const TankMixReportsView: React.FC<Props> = ({
  selectedProducts,
  evaluation,
  waterQuality,
  weather,
  farmName,
  plotName,
}) => {
  const [reportAgronomist, setReportAgronomist] = useState('Eng. Agrônomo Responsável');
  const [reportCrea, setReportCrea] = useState('CREA/ART Nº 2026-BR-8891');
  const [targetCrop, setTargetCrop] = useState('Soja / Milho');

  const handlePrint = () => {
    window.print();
  };

  const rating = evaluation.rating || evaluation.worstRating || 'compativel';
  const mixingSteps = evaluation.recommendedMixingOrder || [];
  const issues = evaluation.issues || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Emissão de Laudos & Receitas
            </span>
            <span className="text-xs text-gray-500">• Ordem de Serviço & Parecer Técnico</span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mt-1">Laudo Técnico de Compatibilidade de Calda</h1>
          <p className="text-xs text-gray-600 mt-1">
            Gere ordens de serviço e laudos técnicos oficiais formatados para impressão e assinatura agronômica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Card (A4 Layout) */}
      <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-lg max-w-4xl mx-auto space-y-6 print:m-0 print:p-0 print:border-none print:shadow-none">
        {/* Report Header */}
        <div className="border-b-2 border-gray-900 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
          <div>
            <div className="text-xs font-black uppercase text-emerald-800 tracking-wider">
              GeaAgro Suite • TankMix Tech
            </div>
            <h2 className="text-xl font-black text-gray-900 mt-1">Parecer Técnico de Compatibilidade de Calda</h2>
            <div className="text-xs text-gray-500 mt-0.5">
              Protocolo Oficial de Preparo & Ordem de Abastecimento de Pulverizador
            </div>
          </div>

          <div className="text-right text-xs">
            <div className="font-bold text-gray-900">Data: {new Date().toLocaleDateString('pt-BR')}</div>
            <div className="text-gray-500 font-mono">ID: TMX-{Date.now().toString().slice(-6)}</div>
          </div>
        </div>

        {/* Farm & Agronomist Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs">
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Propriedade</span>
            <span className="font-bold text-gray-900 mt-0.5 block">{farmName || 'Fazenda Modelo'}</span>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Talhão / Cultura</span>
            <span className="font-bold text-gray-900 mt-0.5 block">{plotName || 'Talhão 01'} • {targetCrop}</span>
          </div>
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Responsável Técnico</span>
            <input
              type="text"
              value={reportAgronomist}
              onChange={e => setReportAgronomist(e.target.value)}
              className="font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none w-full text-xs"
            />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Registro Profissional</span>
            <input
              type="text"
              value={reportCrea}
              onChange={e => setReportCrea(e.target.value)}
              className="font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:outline-none w-full text-xs"
            />
          </div>
        </div>

        {/* Score & Verdict Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            rating === 'incompativel'
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : rating === 'restricao_severa'
              ? 'bg-orange-50 border-orange-300 text-orange-950'
              : rating === 'compativel_restricoes'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}
        >
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">Classificação Global da Mistura</div>
            <div className="text-base font-extrabold mt-0.5">
              {rating === 'incompativel'
                ? '🔴 MISTURA INCOMPATÍVEL - RISCO DE PERDA DE CALDA'
                : rating === 'restricao_severa'
                ? '🟠 RESTRIÇÃO SEVERA - ANTAGONISMO BIOLÓGICO'
                : rating === 'compativel_restricoes'
                ? '🟡 COMPATÍVEL COM CUIDADOS DE PREPARO'
                : '🟢 COMPATÍVEL - MISTURA APROVADA'}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold block">Índice ICG</span>
            <span className="text-2xl font-black">{evaluation.icgScore}%</span>
          </div>
        </div>

        {/* Products In Recipe Table */}
        <div className="space-y-2">
          <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">
            Composição da Calda ({(selectedProducts || []).length} Produtos)
          </h3>
          <table className="w-full text-xs border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="p-2.5 text-center w-12">Ordem</th>
                <th className="p-2.5 text-left">Produto Comercial</th>
                <th className="p-2.5 text-left">Ingrediente Ativo</th>
                <th className="p-2.5 text-center">Formulação</th>
                <th className="p-2.5 text-right">Dose/ha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(selectedProducts || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-400 italic">
                    Nenhum produto selecionado no laboratório virtual.
                  </td>
                </tr>
              ) : (
                selectedProducts.map((p, idx) => {
                  const prod = p?.product || (TANKMIX_PRODUCTS_DATABASE || []).find(item => item?.id === p?.productId);
                  if (!prod) return null;
                  return (
                    <tr key={prod.id || idx}>
                      <td className="p-2.5 text-center font-bold font-mono bg-gray-50">{idx + 1}º</td>
                      <td className="p-2.5 font-bold text-gray-900">{prod.commercialName}</td>
                      <td className="p-2.5 text-gray-600">{prod.activeIngredient}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-purple-700">{prod.formulation}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-800">
                        {p.dose} {p.doseUnit}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Official Mixing Order Protocol (WALES) */}
        {(mixingSteps || []).length > 0 && (
          <div className="space-y-2">
            <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">
              Sequência Oficial de Abastecimento (Método WALES)
            </h3>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
              {mixingSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-gray-900">{step.stepName}:</span>{' '}
                    <span className="text-gray-700">{step.instructions}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Alerts */}
        {(issues || []).length > 0 && (
          <div className="space-y-2">
            <h3 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">
              Alertas Físico-Químicos & Recomendações
            </h3>
            <div className="space-y-2 text-xs">
              {issues.map(iss => (
                <div key={iss.id} className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{iss.summary}</span>
                  </div>
                  <p className="mt-1 text-gray-700 leading-relaxed">{iss.details}</p>
                  <div className="mt-1 font-semibold text-emerald-800">
                    Ação recomendada: {iss.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Water & Weather Context */}
        <div className="grid grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3 bg-cyan-50 rounded-xl border border-cyan-200">
            <span className="font-bold text-cyan-900 block mb-1">Qualidade da Água Cadastrada:</span>
            <div className="text-cyan-800">
              pH: <strong>{waterQuality.ph}</strong> • Dureza:{' '}
              <strong>{waterQuality.hardnessMgL} mg/L CaCO₃ ({waterQuality.classification || 'Padrão'})</strong>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="font-bold text-amber-900 block mb-1">Janela Climática Registrada:</span>
            <div className="text-amber-800">
              Temp: <strong>{weather.temperatureC}°C</strong> • Umidade: <strong>{weather.relativeHumidityPct}%</strong> • Delta T:{' '}
              <strong>{weather.deltaT}°C</strong> • Vento: <strong>{weather.windSpeedKmH} km/h</strong>
            </div>
          </div>
        </div>

        {/* Signature Line for Print */}
        <div className="pt-10 border-t border-gray-300 grid grid-cols-2 gap-10 text-center text-xs">
          <div>
            <div className="border-b border-gray-400 pb-1 mb-1"></div>
            <div className="font-bold text-gray-900">{reportAgronomist}</div>
            <div className="text-gray-500">{reportCrea}</div>
          </div>
          <div>
            <div className="border-b border-gray-400 pb-1 mb-1"></div>
            <div className="font-bold text-gray-900">Operador / Aplicador Responsável</div>
            <div className="text-gray-500">Assinatura de Recebimento</div>
          </div>
        </div>
      </div>
    </div>
  );
};
