import React, { useState, useEffect } from 'react';
import {
  AreaDegradadaItem,
  DiagnosticoTecnicoCompleto,
  GrauSeveridadeDegradacao
} from '../../types/recupera';
import { useTimedFlag } from './useTimedFlag';
import {
  ClipboardCheck,
  Save,
  CheckCircle2,
  Shovel,
  FlaskConical,
  Sprout,
  Leaf,
  TreePine,
  Activity
} from 'lucide-react';

interface Props {
  areaAtiva: AreaDegradadaItem;
  diagnosticoExistente?: DiagnosticoTecnicoCompleto;
  onSalvarDiagnostico: (diag: DiagnosticoTecnicoCompleto) => void;
}

const criarDiagnosticoInicial = (areaAtiva: AreaDegradadaItem): DiagnosticoTecnicoCompleto => ({
  id: `diag-${areaAtiva.id}`,
  areaId: areaAtiva.id,
  dataDiagnostico: new Date().toISOString().split('T')[0],
  responsavelTecnico: areaAtiva.responsavelTecnico || '',
  creaNumero: areaAtiva.creaNumero || '',
  fisico: {
    compactacaoPresente: true,
    profundidadeCamadaCompactadaCm: 15,
    resistenciaPenetracaoMpa: 2.8,
    adensamentoPresente: true,
    infiltracaoAguaMmH: 12,
    selamentoSuperficial: true,
    perdaEstruturaAgregados: true,
    erosaoLaminar: true,
    erosaoSulcos: true,
    ravinasPresentes: false,
    numeroRavinas: 0,
    vocorocasPresentes: false,
    dimensoesVocorocas: '',
    exposicaoHorizontesSubsuperficiais: false,
    observacoes: 'Camada compactada entre 10 e 20 cm decorrente de tráfego de máquinas e pisoteio contínuo.'
  },
  quimico: {
    acidezElevada: true,
    phAgua: 4.8,
    saturacaoBasesVpct: 32,
    saturacaoAluminioMpct: 28,
    baixaFertilidade: true,
    teorFosforoMgDm3: 3.2,
    teorPotassioCmolcDm3: 0.12,
    teorCalcioCmolcDm3: 1.1,
    teorMagnesioCmolcDm3: 0.4,
    teorMateriaOrganicaGDm3: 16,
    salinidadeCondutividadeEletricaDsM: 0.2,
    sodicidadePstPct: 1.5,
    deficienciaMicronutrientes: ['Zinco (Zn)', 'Boro (B)'],
    observacoes: 'Acidez severa com V% de 32% (muito abaixo do ideal de 60-70%) e alumínio tóxico no perfil.'
  },
  biologico: {
    baixaAtividadeBiologica: true,
    respiracaoBasalMicrobiana: 'Baixa (< 15 mg C-CO2/kg solo/dia)',
    presencaMacrofaunaMinhocas: 'ausente',
    desenvolvimentoRadicular: 'superficial',
    coberturaVegetalVivaPct: 35,
    coberturaPalhadaMortaPct: 15,
    nematoidesFitoparasitasSuspeita: false,
    observacoes: 'Solo com baixa ciclagem biológica de nutrientes e sem presença aparente de anelídeos.'
  },
  pastagem: {
    especieForrageiraAtual: 'Brachiaria decumbens degradada',
    percentualFalhasCoberturaPct: 50,
    percentualSoloExpostoPct: 40,
    densidadePerfilhosM2: 85,
    vigorRebrota: 'fraco',
    alturaMediaPastoCm: 12,
    disponibilidadeMassaSecaKgHa: 800,
    infestacaoPlantasDaninhasPct: 35,
    principaisDaninhas: ['Guanxuma', 'Assa-peixe', 'Capim-capivara'],
    nivelPisoteioDegradacao: 'severo',
    capacidadeSuporteAtualUaHa: 0.4,
    capacidadeSuportePotencialUaHa: 1.8,
    observacoes: 'Pasto degradado com invasão de daninhas arbustivas de folha larga e baixa lotação.'
  },
  ambiental: {
    intervencaoApp: false,
    larguraAppPreservadaM: 30,
    larguraAppExigidaM: 30,
    degradacaoReservaLegal: false,
    supressaoVegetacaoNativaHa: 0,
    distanciaNascentesM: 250,
    estadoNascentes: 'preservada',
    processosAssoreamentoCursosAgua: false,
    presencaEspeciesExoticasInvasoras: false,
    especiesInvasoras: [],
    necessidadeIsolamentoCercamentoM: 0,
    observacoes: 'Área produtiva sem interferência direta em curso d’água; declividade direcionada para canal secundário.'
  },
  classificacaoGeral: 'severa',
  pontuacaoDegradacao: 68,
  justificativaTecnica: 'Área com degradação química (V% 32, Al tóxico) e física (compactação a 15 cm e erosão em sulcos). Recomendada descompactação mecânica, calagem e gessagem corretiva, seguida de reforma da forrageira com sobressemeadura de adubo verde descompactador.',
  acoesImediatasRecomendadas: [
    'Descompactação mecânica com escarificador a 25-30 cm de profundidade',
    'Calagem corretiva com calcário dolomítico (PRNT 85%) para elevar V% para 60%',
    'Gessagem profunda para neutralizar toxidez de alumínio no subsolo',
    'Consórcio forrageiro com Crotalaria ochroleuca ou feijão-guandu para fixação biológica'
  ],
  anexosFotograficos: []
});

export const RecuperaDiagnosticoView: React.FC<Props> = ({
  areaAtiva,
  diagnosticoExistente,
  onSalvarDiagnostico
}) => {
  const [salvo, dispararSalvo, limparSalvo] = useTimedFlag(3000);
  const [secaoAtiva, setSecaoAtiva] = useState<'fisico' | 'quimico' | 'biologico' | 'pastagem' | 'ambiental'>('fisico');

  const [form, setForm] = useState<DiagnosticoTecnicoCompleto>(() =>
    diagnosticoExistente ?? criarDiagnosticoInicial(areaAtiva)
  );

  useEffect(() => {
    setForm(diagnosticoExistente ?? criarDiagnosticoInicial(areaAtiva));
    limparSalvo();
  }, [areaAtiva, diagnosticoExistente, limparSalvo]);

  // Cálculo Dinâmico de Pontuação de Degradação (0 a 100)
  const calcularScoreAutomatico = () => {
    let score = 0;
    // Físico (max 30)
    if (form.fisico.compactacaoPresente) score += 8;
    if (form.fisico.infiltracaoAguaMmH < 15) score += 6;
    if (form.fisico.erosaoSulcos) score += 8;
    if (form.fisico.vocorocasPresentes) score += 8;

    // Químico (max 30)
    if (form.quimico.saturacaoBasesVpct < 40) score += 10;
    if (form.quimico.saturacaoAluminioMpct > 20) score += 10;
    if (form.quimico.teorFosforoMgDm3 < 5) score += 5;
    if (form.quimico.teorMateriaOrganicaGDm3 < 20) score += 5;

    // Biológico & Vegetativo (max 40)
    if (form.biologico.coberturaVegetalVivaPct < 40) score += 15;
    if (form.pastagem.percentualFalhasCoberturaPct > 40) score += 15;
    if (form.pastagem.infestacaoPlantasDaninhasPct > 30) score += 10;

    let gravidade: GrauSeveridadeDegradacao = 'leve';
    if (score >= 70) gravidade = 'muito_severa';
    else if (score >= 50) gravidade = 'severa';
    else if (score >= 30) gravidade = 'moderada';

    setForm(prev => ({
      ...prev,
      pontuacaoDegradacao: score,
      classificacaoGeral: gravidade
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarDiagnostico(form);
    dispararSalvo();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header do Diagnóstico */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Fase 2 • Diagnóstico Multifatorial
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
              form.classificacaoGeral === 'muito_severa'
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                : form.classificacaoGeral === 'severa'
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                : form.classificacaoGeral === 'moderada'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              Grau: {form.classificacaoGeral.replace('_', ' ')} ({form.pontuacaoDegradacao}/100)
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" />
            <span>Diagnóstico Técnico: {areaAtiva.nomeTalhao} ({areaAtiva.areaHa} ha)</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={calcularScoreAutomatico}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
            title="Recalcular pontuação de degradação"
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Recalcular Gravidade</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Diagnóstico</span>
          </button>
        </div>
      </div>

      {salvo && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Diagnóstico técnico salvo com sucesso no banco de dados local!</span>
        </div>
      )}

      {/* Navegação entre as 5 Dimensões de Diagnóstico */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { key: 'fisico', label: '1. Diagnóstico Físico', icon: Shovel },
          { key: 'quimico', label: '2. Diagnóstico Químico', icon: FlaskConical },
          { key: 'biologico', label: '3. Diagnóstico Biológico', icon: Sprout },
          { key: 'pastagem', label: '4. Pastagens & Forragem', icon: Leaf },
          { key: 'ambiental', label: '5. Ambiental & APP/RL', icon: TreePine }
        ].map(aba => {
          const Icon = aba.icon;
          const isAtiva = secaoAtiva === aba.key;
          return (
            <button
              key={aba.key}
              type="button"
              onClick={() => setSecaoAtiva(aba.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                isAtiva
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{aba.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo Dinâmico por Dimensão */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs text-xs space-y-4">
        {secaoAtiva === 'fisico' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shovel className="w-4 h-4 text-emerald-600" />
              <span>Diagnóstico de Estrutura Física & Processos Erosivos</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
                <label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.fisico.compactacaoPresente}
                    onChange={e => setForm({ ...form, fisico: { ...form.fisico, compactacaoPresente: e.target.checked } })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Compactação do Solo Presente</span>
                </label>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Profundidade da Camada (cm)</label>
                  <input
                    type="number"
                    value={form.fisico.profundidadeCamadaCompactadaCm}
                    onChange={e => setForm({ ...form, fisico: { ...form.fisico, profundidadeCamadaCompactadaCm: parseFloat(e.target.value) || 0 } })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Resistência à Penetração (MPa)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.fisico.resistenciaPenetracaoMpa}
                    onChange={e => setForm({ ...form, fisico: { ...form.fisico, resistenciaPenetracaoMpa: parseFloat(e.target.value) || 0 } })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Infiltração & Selamento</span>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Taxa de Infiltração Básica (mm/h)</label>
                  <input
                    type="number"
                    value={form.fisico.infiltracaoAguaMmH}
                    onChange={e => setForm({ ...form, fisico: { ...form.fisico, infiltracaoAguaMmH: parseFloat(e.target.value) || 0 } })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <label className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.fisico.selamentoSuperficial}
                    onChange={e => setForm({ ...form, fisico: { ...form.fisico, selamentoSuperficial: e.target.checked } })}
                    className="rounded text-emerald-600"
                  />
                  <span>Selamento / Crostamento Superficial</span>
                </label>
                <label className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.fisico.perdaEstruturaAgregados}
                    onChange={e => setForm({ ...form, fisico: { ...form.fisico, perdaEstruturaAgregados: e.target.checked } })}
                    className="rounded text-emerald-600"
                  />
                  <span>Desagregação / Pulverização do Solo</span>
                </label>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Processos Erosivos Ativos</span>
                <label className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.fisico.erosaoLaminar}
                    onChange={e => setForm({ ...form, fisico: { ...form.fisico, erosaoLaminar: e.target.checked } })}
                    className="rounded text-emerald-600"
                  />
                  <span>Erosão Laminar Generalizada</span>
                </label>
                <label className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.fisico.erosaoSulcos}
                    onChange={e => setForm({ ...form, fisico: { ...form.fisico, erosaoSulcos: e.target.checked } })}
                    className="rounded text-emerald-600"
                  />
                  <span>Sulcos de Erosão (Enxurradas)</span>
                </label>
                <label className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.fisico.vocorocasPresentes}
                    onChange={e => setForm({ ...form, fisico: { ...form.fisico, vocorocasPresentes: e.target.checked } })}
                    className="rounded text-emerald-600"
                  />
                  <span>Ravinas / Voçorocas Profundas</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Observações de Campo da Física do Solo
              </label>
              <textarea
                value={form.fisico.observacoes}
                onChange={e => setForm({ ...form, fisico: { ...form.fisico, observacoes: e.target.value } })}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {secaoAtiva === 'quimico' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-600" />
              <span>Diagnóstico de Fertilidade Química & Acidez</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">pH em Água</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.quimico.phAgua}
                  onChange={e => setForm({ ...form, quimico: { ...form.quimico, phAgua: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Saturação Bases (V%)</label>
                <input
                  type="number"
                  value={form.quimico.saturacaoBasesVpct}
                  onChange={e => setForm({ ...form, quimico: { ...form.quimico, saturacaoBasesVpct: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Saturação Alumínio (m%)</label>
                <input
                  type="number"
                  value={form.quimico.saturacaoAluminioMpct}
                  onChange={e => setForm({ ...form, quimico: { ...form.quimico, saturacaoAluminioMpct: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Matéria Orgânica (g/dm³)</label>
                <input
                  type="number"
                  value={form.quimico.teorMateriaOrganicaGDm3}
                  onChange={e => setForm({ ...form, quimico: { ...form.quimico, teorMateriaOrganicaGDm3: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Fósforo P (mg/dm³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.quimico.teorFosforoMgDm3}
                  onChange={e => setForm({ ...form, quimico: { ...form.quimico, teorFosforoMgDm3: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Potássio K (cmolc/dm³)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.quimico.teorPotassioCmolcDm3}
                  onChange={e => setForm({ ...form, quimico: { ...form.quimico, teorPotassioCmolcDm3: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Cálcio Ca (cmolc/dm³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.quimico.teorCalcioCmolcDm3}
                  onChange={e => setForm({ ...form, quimico: { ...form.quimico, teorCalcioCmolcDm3: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Magnésio Mg (cmolc/dm³)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.quimico.teorMagnesioCmolcDm3}
                  onChange={e => setForm({ ...form, quimico: { ...form.quimico, teorMagnesioCmolcDm3: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Observações Químicas & Desequilíbrios Nutricionais
              </label>
              <textarea
                value={form.quimico.observacoes}
                onChange={e => setForm({ ...form, quimico: { ...form.quimico, observacoes: e.target.value } })}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {secaoAtiva === 'biologico' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Diagnóstico Biológico do Solo & Macrofauna</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Cobertura Vegetal Viva (%)</label>
                <input
                  type="number"
                  value={form.biologico.coberturaVegetalVivaPct}
                  onChange={e => setForm({ ...form, biologico: { ...form.biologico, coberturaVegetalVivaPct: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Cobertura por Palhada (%)</label>
                <input
                  type="number"
                  value={form.biologico.coberturaPalhadaMortaPct}
                  onChange={e => setForm({ ...form, biologico: { ...form.biologico, coberturaPalhadaMortaPct: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Presença de Minhocas / Macrofauna</label>
                <select
                  value={form.biologico.presencaMacrofaunaMinhocas}
                  onChange={e => setForm({ ...form, biologico: { ...form.biologico, presencaMacrofaunaMinhocas: e.target.value as any } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="ausente">Ausente (Solo biológicamente inerte)</option>
                  <option value="baixa">Baixa (&lt; 2 indivíduos / dm³)</option>
                  <option value="moderada">Moderada (3 a 8 indivíduos / dm³)</option>
                  <option value="abundante">Abundante (&gt; 10 indivíduos / dm³)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Observações de Biologia & Atividade Radicular
              </label>
              <textarea
                value={form.biologico.observacoes}
                onChange={e => setForm({ ...form, biologico: { ...form.biologico, observacoes: e.target.value } })}
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {secaoAtiva === 'pastagem' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span>Diagnóstico Específico da Pastagem & Suporte Animal</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Espécie Forrageira Atual</label>
                <input
                  type="text"
                  value={form.pastagem.especieForrageiraAtual}
                  onChange={e => setForm({ ...form, pastagem: { ...form.pastagem, especieForrageiraAtual: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Falhas de Cobertura (%)</label>
                <input
                  type="number"
                  value={form.pastagem.percentualFalhasCoberturaPct}
                  onChange={e => setForm({ ...form, pastagem: { ...form.pastagem, percentualFalhasCoberturaPct: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Infestação de Daninhas (%)</label>
                <input
                  type="number"
                  value={form.pastagem.infestacaoPlantasDaninhasPct}
                  onChange={e => setForm({ ...form, pastagem: { ...form.pastagem, infestacaoPlantasDaninhasPct: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Capacidade de Suporte Atual (UA/ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.pastagem.capacidadeSuporteAtualUaHa}
                  onChange={e => setForm({ ...form, pastagem: { ...form.pastagem, capacidadeSuporteAtualUaHa: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Potencial Recuperado Esperado (UA/ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.pastagem.capacidadeSuportePotencialUaHa}
                  onChange={e => setForm({ ...form, pastagem: { ...form.pastagem, capacidadeSuportePotencialUaHa: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-emerald-600"
                />
              </div>
            </div>
          </div>
        )}

        {secaoAtiva === 'ambiental' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TreePine className="w-4 h-4 text-emerald-600" />
              <span>Diagnóstico Ambiental & Conformidade Código Florestal</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <input
                  type="checkbox"
                  checked={form.ambiental.intervencaoApp}
                  onChange={e => setForm({ ...form, ambiental: { ...form.ambiental, intervencaoApp: e.target.checked } })}
                  className="rounded text-emerald-600"
                />
                <span>Área Interfere em APP (Área de Preservação Permanente)</span>
              </label>

              <label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 cursor-pointer p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <input
                  type="checkbox"
                  checked={form.ambiental.degradacaoReservaLegal}
                  onChange={e => setForm({ ...form, ambiental: { ...form.ambiental, degradacaoReservaLegal: e.target.checked } })}
                  className="rounded text-emerald-600"
                />
                <span>Área Sobreposta à Reserva Legal (RL)</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Distância de Nascentes (m)</label>
                <input
                  type="number"
                  value={form.ambiental.distanciaNascentesM}
                  onChange={e => setForm({ ...form, ambiental: { ...form.ambiental, distanciaNascentesM: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">Cercamento Necessário (metros)</label>
                <input
                  type="number"
                  value={form.ambiental.necessidadeIsolamentoCercamentoM}
                  onChange={e => setForm({ ...form, ambiental: { ...form.ambiental, necessidadeIsolamentoCercamentoM: parseFloat(e.target.value) || 0 } })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* Parecer Conclusivo e Ações Imediatas */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div>
            <label className="block font-bold text-slate-900 dark:text-white mb-1">
              Justificativa Técnica do Avaliador / Perito
            </label>
            <textarea
              value={form.justificativaTecnica}
              onChange={e => setForm({ ...form, justificativaTecnica: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
