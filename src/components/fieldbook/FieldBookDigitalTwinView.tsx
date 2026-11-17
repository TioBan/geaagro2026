import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bug,
  Building2,
  Camera,
  ChevronRight,
  Clock,
  Dna,
  FlaskConical,
  Layers,
  Leaf,
  Microscope,
  Navigation,
  Sprout,
  Sun,
  Tractor,
} from 'lucide-react';
import { Farm, FieldPlot, SoilSample } from '../../types/agronomy';
import { Field, FieldOperation } from '../../types/fieldbook';
import { CROPS_CATALOG } from '../../data/agronomicStandards';
import { INITIAL_NEMATODE_FIELDS, NEMATODE_SPECIES_CATALOG } from '../../data/nematologyData';
import { calculateLiming, calculateGypsum, calculateFertilization } from '../../utils/agronomicCalculations';

interface FieldBookDigitalTwinViewProps {
  farm?: Farm;
  fields: Field[];
  operations: FieldOperation[];
  soilSamples?: SoilSample[];
  handleNavigateToRegister: () => void;
}

export const FieldBookDigitalTwinView: React.FC<FieldBookDigitalTwinViewProps> = ({
  farm,
  fields,
  operations,
  soilSamples,
  handleNavigateToRegister,
}) => {
  const [selectedTwinFieldId, setSelectedTwinFieldId] = useState<string>(fields[0]?.id || '');
  const [activeLayer, setActiveLayer] = useState<'soil' | 'fertility' | 'spraying' | 'satellite' | 'nematology'>('soil');

  const selectedField = fields.find(f => f?.id === selectedTwinFieldId) || fields[0];
  if (!selectedField) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl p-10 text-center space-y-3 animate-fade-in">
        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
          <Layers className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-white text-base">Nenhum talhão cadastrado para o Gêmeo Digital</h4>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
          Cadastre os talhões da propriedade para visualizar o painel 360°, análises vinculadas, recomendações e custos operacionais por hectare.
        </p>
        <button
          onClick={handleNavigateToRegister}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer"
        >
          <Building2 className="w-4 h-4" />
          <span>Cadastrar Talhões na Fazenda</span>
        </button>
      </div>
    );
  }

  const matchingSample =
    (soilSamples || []).find(
      s =>
        farm?.id &&
        s?.farmId === farm.id &&
        (s?.plotId === selectedField?.id ||
          (selectedField?.id === 'fld-1' && s?.plotId === 'plot-1-1') ||
          (selectedField?.id === 'fld-2' && s?.plotId === 'plot-1-2') ||
          (s?.plotId && selectedField?.id && s.plotId.includes(selectedField.id)) ||
          (selectedField?.id && s?.plotId && selectedField.id.includes(s.plotId)))
    ) || (soilSamples || []).find(s => farm?.id && s?.farmId === farm.id);

  const plotForCalc: FieldPlot = {
    id: selectedField.id,
    name: selectedField.name,
    farmId: selectedField.farmId,
    areaHa: selectedField.areaHa,
    texture: 'medio',
    clayPercentage: matchingSample?.clayPercent || 35,
    currentCrop: selectedField.crop,
    spacingBetweenRowsMeters: 0.5,
    spacingBetweenPlantsMeters: 0.1,
    plantPopulationPerHa: 200000,
    linearMetersPerHa: 20000,
    irrigationType: 'sequeiro',
  };

  const cropTarget =
    CROPS_CATALOG.find(c => {
      const fieldCrop = (selectedField.crop || '').toLowerCase();
      const catalogCrop = (c?.name || '').toLowerCase();
      return catalogCrop.includes(fieldCrop) || fieldCrop.includes(catalogCrop);
    }) || CROPS_CATALOG[0];

  const limingRec = matchingSample ? calculateLiming(matchingSample, plotForCalc, cropTarget, 85, 20, 100, 'base_saturation') : null;
  const gypsumRec = matchingSample ? calculateGypsum(matchingSample, undefined, plotForCalc, cropTarget) : null;
  const fertRec = matchingSample ? calculateFertilization(matchingSample, plotForCalc, cropTarget) : null;

  const renderLayerDetails = () => {
    switch (activeLayer) {
      case 'soil':
        return (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 dark:border-zinc-800 pb-4 gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Laudo de Recomendação: Correção do Solo</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Recomendação integrada de calagem e gessagem calculada em tempo real.</p>
                </div>
              </div>
              {matchingSample && (
                <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/30 w-fit">
                  Amostra: {matchingSample.sampleCode}
                </span>
              )}
            </div>

            {!matchingSample ? (
              <div className="text-center py-8 text-slate-500 dark:text-zinc-400">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-pulse" />
                <p className="font-semibold text-sm">Nenhuma análise de solo vinculada a este talhão.</p>
                <p className="text-xs mt-1">Cadastre uma análise química para gerar recomendações.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-2.5 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">pH CaCl₂</span>
                    <strong className="text-sm text-slate-800 dark:text-white">{matchingSample.phCaCl2 || '-'}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-2.5 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">M.O. (g/dm³)</span>
                    <strong className="text-sm text-slate-800 dark:text-white">{matchingSample.organicMatterGdm3 || '-'}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-2.5 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Argila (%)</span>
                    <strong className="text-sm text-slate-800 dark:text-white">{matchingSample.clayPercent || '-'}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-2.5 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">P Mehlich</span>
                    <strong className="text-sm text-slate-800 dark:text-white">{matchingSample.pMehlich1MgDm3 || '-'}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-2.5 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">V% Atual</span>
                    <strong className="text-sm text-slate-800 dark:text-white">{matchingSample.vPercent || '-'}%</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-2.5 rounded-lg text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">CTC (T)</span>
                    <strong className="text-sm text-slate-800 dark:text-white">{matchingSample.ctcTotal || '-'}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-800/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/50 pb-2">
                      <span className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        Recomendação de Calagem
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-full">
                        V% Alvo: {cropTarget.targetVPercent}%
                      </span>
                    </div>

                    {limingRec && limingRec.dose.kgPerHa > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                            {(limingRec.dose.kgPerHa / 1000).toFixed(2)}
                          </span>
                          <span className="text-sm font-bold text-slate-600 dark:text-zinc-400">t / ha</span>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                          <p>
                            <strong>Calcário Indicado:</strong>{' '}
                            {limingRec.limestoneTypeRecommended === 'dolomitico'
                              ? 'Dolomítico (>12% MgO)'
                              : limingRec.limestoneTypeRecommended === 'calcico'
                              ? 'Calcítico'
                              : 'Magnesiano'}
                          </p>
                          <p>
                            <strong>Distribuição Linear:</strong> {limingRec.dose.gPerLinearMeter} g/m de sulco
                          </p>
                          <p>
                            <strong>Justificativa:</strong> {limingRec.justification}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                        Saturação por bases atual de {matchingSample?.vPercent}% é adequada para {cropTarget.name}. Calagem dispensada.
                      </p>
                    )}
                  </div>

                  <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-800/20 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/50 pb-2">
                      <span className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                        Recomendação de Gessagem
                      </span>
                      {gypsumRec?.isNeeded ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-full">
                          Recomendado
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full">
                          Dispensado
                        </span>
                      )}
                    </div>

                    {gypsumRec?.isNeeded ? (
                      <div className="space-y-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                            {(gypsumRec.dose.kgPerHa / 1000).toFixed(2)}
                          </span>
                          <span className="text-sm font-bold text-slate-600 dark:text-zinc-400">t / ha</span>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                          <p>
                            <strong>Aplicação:</strong> {gypsumRec.applicationMode}
                          </p>
                          <p>
                            <strong>Justificativa:</strong> {gypsumRec.justification}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                        {gypsumRec?.justification || 'Subsolo livre de barreiras de alumínio tóxico ou acidez severa. Gessagem dispensada.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'fertility':
        return (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Recomendação Nutricional NPK (Adubação de Plantio)</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Cálculo de adubação específico para a cultura {selectedField.crop}.</p>
                </div>
              </div>
            </div>

            {!matchingSample ? (
              <div className="text-center py-8 text-slate-500 dark:text-zinc-400">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 animate-pulse" />
                <p className="font-semibold text-sm">Nenhuma análise de solo vinculada para calibrar a adubação.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nitrogênio (N)</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-800 dark:text-white">
                        {fertRec?.plantingFertilizer.nutrientsProvidedKgHa.n ?? 0}
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">kg/ha</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Manejo biológico (Inoculação) + adubação de arranque.</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fósforo (P₂O₅)</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-800 dark:text-white">
                        {fertRec?.plantingFertilizer.nutrientsProvidedKgHa.p2o5 ?? 0}
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">kg/ha</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Dose ajustada para a classe de argila do solo ({matchingSample.clayPercent || '--'}%).</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Potássio (K₂O)</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-800 dark:text-white">
                        {fertRec?.plantingFertilizer.nutrientsProvidedKgHa.k2o ?? 0}
                      </span>
                      <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">kg/ha</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Equilibra a nutrição celular de potássio na fase de crescimento.</p>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-3">
                  <h5 className="font-bold text-sm text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                    <Tractor className="w-4 h-4" />
                    Sugestão de Formulação Comercial Equivalente
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 text-slate-700 dark:text-zinc-300">
                      <p>
                        <strong>Formulação Recomendada:</strong> {fertRec?.plantingFertilizer.formulaName || '--'}
                      </p>
                      <p>
                        <strong>Dose do Formulador Comercial:</strong> {fertRec?.plantingFertilizer.dose.kgPerHa ?? 0} kg/ha
                      </p>
                    </div>
                    <div className="space-y-1 text-slate-700 dark:text-zinc-300">
                      <p>
                        <strong>Quantidade Linear de Plantio:</strong> {fertRec?.plantingFertilizer.dose.gPerLinearMeter ?? 0} g/metro linear
                      </p>
                      <p>
                        <strong>Cobertura Recomendada:</strong> Cloreto de Potássio (KCl) se houver déficit severo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'spraying': {
        const fieldPestOps = (operations || []).filter(
          o => o.fieldId === selectedField.id && (o.type === 'spraying' || o.type === 'tankmix_application' || o.type === 'monitoring')
        );
        return (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="p-2 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg">
                <Bug className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Janela Sanitária &amp; Alertas de MIP</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Condições de pulverização e monitoramento integrado de pragas.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-800/20 space-y-3">
                <span className="font-extrabold text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-orange-500" />
                  Janela Climática para Pulverização
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Vento</span>
                    <strong className="text-slate-700 dark:text-zinc-300">--</strong>
                  </div>
                  <div className="bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">UR %</span>
                    <strong className="text-slate-700 dark:text-zinc-300">--</strong>
                  </div>
                  <div className="bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Temp.</span>
                    <strong className="text-slate-700 dark:text-zinc-300">--</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium bg-slate-100 dark:bg-zinc-800/80 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700">
                  Sem medições meteorológicas registradas para este talhão.
                </p>
              </div>

              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-800/20 space-y-3">
                <span className="font-extrabold text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-2">
                  <Bug className="w-4 h-4 text-amber-500" />
                  Monitoramento Recente de Pragas ({fieldPestOps.length})
                </span>
                {fieldPestOps.length === 0 ? (
                  <div className="text-xs text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 p-3 rounded-lg border border-dashed border-slate-200 dark:border-zinc-700 text-center">
                    Nenhum registro de pulverização ou MIP neste talhão.
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    {fieldPestOps.slice(0, 3).map(op => (
                      <div key={op.id} className="flex justify-between items-center bg-white dark:bg-zinc-800 p-2 rounded-lg border border-slate-100 dark:border-zinc-700">
                        <span className="font-medium text-slate-700 dark:text-zinc-200">{op.details?.target || op.details?.product || op.type}</span>
                        <span className="font-mono text-[11px] text-slate-500">{new Date(op.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'satellite':
        return (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Sensoriamento NDVI &amp; Vigor Vegetativo</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Análise espectral de vigor fotossintético e biomassa ativa.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                <span className="text-xs text-slate-400 block">Variação NDVI (Últimos 30 dias)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-700 dark:text-zinc-200">--</span>
                  <span className="text-xs text-slate-400">(Sem leitura atual)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-[10px] text-slate-500">Nenhuma leitura de satélite NDVI vinculada a este talhão.</p>
              </div>

              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
                <span className="text-xs text-slate-400 block">Histórico de Cobertura NDVI</span>
                <div className="text-xs text-slate-500 dark:text-zinc-400">
                  Nenhuma série histórica de sensoriamento registrada.
                </div>
              </div>
            </div>
          </div>
        );

      case 'nematology': {
        const matchedNemaField = INITIAL_NEMATODE_FIELDS.find(
          nf =>
            nf.fieldName?.toLowerCase().includes(selectedField.name.toLowerCase()) ||
            selectedField.name.toLowerCase().includes(nf.fieldName?.toLowerCase() || '') ||
            (selectedField.id === 'fld-1' && nf.id === 'field-01')
        );

        if (!matchedNemaField) {
          return (
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-8 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/40 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <Microscope className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white">Nenhum Laudo Nematológico Cadastrado</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Não existem dados ou amostras de nematoides registradas para este talhão ({selectedField.name}). Acesse o módulo de Nematologia para cadastrar novas análises.
              </p>
            </div>
          );
        }

        const dominantSpecies = NEMATODE_SPECIES_CATALOG.find(s => s.id === matchedNemaField.dominantSpeciesId) || NEMATODE_SPECIES_CATALOG[0];
        const fr = matchedNemaField.reproductionFactor || 0;

        return (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 dark:border-zinc-800 pb-4 gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Microscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">Laudo de Diagnóstico &amp; Risco Nematológico</h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Análise laboratorial de fitonematoides integrada ao Caderno de Campo.</p>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border w-fit ${
                  matchedNemaField.currentRisk === 'Alta' || matchedNemaField.currentRisk === 'Muito Alta'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : matchedNemaField.currentRisk === 'Moderada'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                Risco de Infestação: {matchedNemaField.currentRisk || 'Não Definido'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-3 rounded-lg text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Espécie Dominante</span>
                <strong className="text-xs text-slate-800 dark:text-white italic block truncate" title={dominantSpecies.scientificName}>
                  {dominantSpecies.scientificName}
                </strong>
                <span className="text-[9px] text-slate-400 block">({dominantSpecies.commonName})</span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-3 rounded-lg text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Solo (200cm³)</span>
                <strong className="text-sm text-slate-800 dark:text-white block">
                  {matchedNemaField.labResults[0]?.populationSoil200cm3 ?? 0} nematoides
                </strong>
                <span className="text-[9px] text-slate-400 block">População Inicial (Pi)</span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-3 rounded-lg text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Raiz (10g)</span>
                <strong className="text-sm text-slate-800 dark:text-white block">
                  {matchedNemaField.labResults[0]?.populationRoot10g ?? 0} nematoides
                </strong>
                <span className="text-[9px] text-slate-400 block">Dano Tecidual Direto</span>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800/50 p-3 rounded-lg text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Fator Reprodução (FR)</span>
                <strong className={`text-sm block ${fr < 1 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {fr} {fr < 1 ? '📉' : '📈'}
                </strong>
                <span className="text-[9px] text-slate-400 block">{fr < 1 ? 'População em declínio' : 'População em aumento'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-800/20 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/50 pb-2">
                  <span className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-500" />
                    Manejo Biológico Recomendado
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-2">
                  <p>
                    <strong>Bionematicida de escolha:</strong> <em>Bacillus subtilis</em> + <em>Trichoderma asperellum</em> no sulco de plantio.
                  </p>
                  <p>
                    <strong>Dosagem indicada:</strong> 2,0 Litros / hectare para inoculação vigorosa e barreira protetora radicular.
                  </p>
                  <p>
                    <strong>Modo de Ação:</strong> Coloniza a rizosfera, competindo por espaço/nutrientes e secretando metabólitos nematicidas que inativam juvenis de 2º estágio (J2).
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-slate-50/50 dark:bg-zinc-800/20 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/50 pb-2">
                  <span className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                    <Dna className="w-4 h-4 text-blue-500" />
                    Planejamento de Rotação (Anti-Nematoides)
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-2">
                  <p>
                    <strong>Planta de Cobertura Indicada:</strong> <em>Crotalaria ochroleuca</em> ou <em>Crotalaria spectabilis</em>.
                  </p>
                  <p>
                    <strong>Efeito de Supressão:</strong> Age como planta armadilha. Os nematoides penetram nas raízes mas não conseguem completar o ciclo reprodutivo.
                  </p>
                  <p>
                    <strong>Benefício Adicional:</strong> Fixação biológica de Nitrogênio (FBN) e aporte massivo de matéria orgânica no perfil do solo.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3 rounded-lg text-xs flex gap-2.5 items-start">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-800 dark:text-amber-300 font-medium">
                <strong>Alerta de Manejo Integrado:</strong> Evite tráfego desnecessário de maquinários pesados deste talhão para áreas livres sem prévia lavagem das rodas com jato sob pressão. Os nematoides são disseminados via partículas de solo aderidas aos pneus.
              </p>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const fieldOpsForCosts = (operations || []).filter(o => o.fieldId === selectedField.id);
  const inputsCost = fieldOpsForCosts.reduce((s, o) => s + (o.costs?.inputs || 0), 0);
  const machineCost = fieldOpsForCosts.reduce((s, o) => s + (o.costs?.machine || 0), 0);
  const totalFieldCost = fieldOpsForCosts.reduce((s, o) => s + (o.costs?.total || 0), 0);
  const costPerHa = selectedField.areaHa > 0 ? totalFieldCost / selectedField.areaHa : 0;
  const maxCostBase = Math.max(inputsCost + machineCost, 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Painel do Gêmeo Digital
          </h3>
          <p className="text-sm text-slate-600 dark:text-zinc-400">Visão integrada e histórico completo do talhão.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Talhão:</label>
          <select
            value={selectedField.id}
            onChange={e => setSelectedTwinFieldId(e.target.value)}
            className="flex-1 md:w-64 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {fields.map(f => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.areaHa} ha)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="h-64 bg-slate-100 dark:bg-zinc-800 relative flex items-center justify-center border-b border-slate-200 dark:border-zinc-800 overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586771107445-d3af116ab85e?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-30 dark:opacity-20 group-hover:opacity-40 dark:group-hover:opacity-30 transition-opacity mix-blend-luminosity"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center">
                <Navigation className="w-10 h-10 text-emerald-400 mb-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-bounce" />
                <span className="bg-emerald-900/80 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 backdrop-blur-sm">
                  Gêmeo Digital Ativo
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
                <div>
                  <h4 className="text-white font-black text-2xl drop-shadow-md">{selectedField?.name || 'Talhão'}</h4>
                  <p className="text-emerald-300 font-bold text-sm drop-shadow-md">
                    {selectedField?.crop || 'Cultura não definida'}
                    {selectedField?.variety ? ` • ${selectedField.variety}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-xs uppercase tracking-wider font-bold drop-shadow-md">Área</p>
                  <p className="text-white font-black text-xl drop-shadow-md">{selectedField?.areaHa || 0} ha</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 dark:divide-zinc-800/50 text-center">
              <div className="p-4">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 tracking-wider mb-1">Cultura / Fenologia</p>
                <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{selectedField?.crop || '--'}</p>
              </div>
              <div className="p-4">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 tracking-wider mb-1">Índice de Vigor (NDVI)</p>
                <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">--</p>
              </div>
              <div className="p-4">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 tracking-wider mb-1">Umidade do Solo</p>
                <p className="font-bold text-slate-600 dark:text-zinc-400 text-sm">--</p>
              </div>
              <div className="p-4">
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-500 tracking-wider mb-1">Produtividade Est.</p>
                <p className="font-bold text-slate-700 dark:text-zinc-300 text-sm">--</p>
              </div>
            </div>
          </div>

          {renderLayerDetails()}

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Histórico Operacional (Safra {selectedField.season})
            </h4>
            <div className="space-y-4 pl-2">
              {operations.filter(o => o.fieldId === selectedField.id).length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Nenhuma operação registrada para este talhão.</p>
              ) : (
                operations
                  .filter(o => o.fieldId === selectedField.id)
                  .map(op => (
                    <div
                      key={op.id}
                      className="flex gap-4 items-start relative before:absolute before:left-5 before:top-10 before:bottom-[-16px] before:w-0.5 before:bg-emerald-200 dark:before:bg-emerald-900/40 last:before:hidden"
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 border-2 border-white dark:border-zinc-900 z-10 text-emerald-600 dark:text-emerald-500 shadow-sm">
                        {op.type === 'soil_prep' && <Tractor className="w-4 h-4" />}
                        {op.type === 'planting' && <Sprout className="w-4 h-4" />}
                        {op.type === 'spraying' && <Bug className="w-4 h-4" />}
                        {op.type === 'fertility' && <FlaskConical className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-zinc-800/30 rounded-xl p-4 border border-slate-100 dark:border-zinc-800 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wide">{op.type.replace('_', ' ')}</span>
                          <span className="text-xs font-mono text-slate-500 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-slate-100 dark:border-zinc-800">
                            {new Date(op.date).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-3">{op.details.machine || op.details.product}</p>
                        <div className="flex gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                              op.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                : op.status === 'planned'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                            }`}
                          >
                            {op.status}
                          </span>
                          {op.costs && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 px-2 py-0.5 rounded font-bold uppercase">
                              R$ {(op.costs.total ?? 0).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Camadas do Gêmeo
            </h4>
            <div className="space-y-2">
              {[
                { key: 'soil' as const, label: 'Análises de Solo', icon: FlaskConical },
                { key: 'fertility' as const, label: 'Adubações & Fertilidade', icon: Leaf },
                { key: 'spraying' as const, label: 'Pulverizações & MIP', icon: Bug },
                { key: 'satellite' as const, label: 'Fotografias & Satélite', icon: Camera },
                { key: 'nematology' as const, label: 'Nematologia & Sanidade', icon: Microscope },
              ].map(layer => {
                const LayerIcon = layer.icon;
                const isActive = activeLayer === layer.key;
                return (
                  <button
                    key={layer.key}
                    onClick={() => setActiveLayer(layer.key)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all group ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-md ${
                          isActive
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40'
                        }`}
                      >
                        <LayerIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{layer.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Custos &amp; Fechamento
            </h4>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-600 dark:text-zinc-400">Insumos Aplicados</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    R$ {inputsCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${inputsCost > 0 ? Math.min(100, Math.round((inputsCost / maxCostBase) * 100)) : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-600 dark:text-zinc-400">Horas Máquina</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    R$ {machineCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${machineCost > 0 ? Math.min(100, Math.round((machineCost / maxCostBase) * 100)) : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Custo Consolidado por Hectare</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                  R$ {costPerHa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-xs font-semibold text-slate-500 ml-1">/ha</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldBookDigitalTwinView;
