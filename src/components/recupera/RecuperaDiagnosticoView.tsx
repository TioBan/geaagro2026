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

const INPUT_CLASS =
  'w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition';

const TEXTAREA_CLASS =
  'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition resize-none';

const SEVERIDADE_STYLES: Record<GrauSeveridadeDegradacao, string> = {
  muito_severa: 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60',
  severa: 'bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/60',
  moderada: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
  leve: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60'
};

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
  justificativaTecnica:
    'Área com degradação química (V% 32, Al tóxico) e física (compactação a 15 cm e erosão em sulcos). Recomendada descompactação mecânica, calagem e gessagem corretiva, seguida de reforma da forrageira com sobressemeadura de adubo verde descompactador.',
  acoesImediatasRecomendadas: [
    'Descompactação mecânica com escarificador a 25-30 cm de profundidade',
    'Calagem corretiva com calcário dolomítico (PRNT 85%) para elevar V% para 60%',
    'Gessagem profunda para neutralizar toxidez de alumínio no subsolo',
    'Consórcio forrageiro com Crotalaria ochroleuca ou feijão-guandu para fixação biológica'
  ],
  anexosFotograficos: []
});

const DIMENSOES = [
  { key: 'fisico', label: '1. Físico', icon: Shovel },
  { key: 'quimico', label: '2. Químico', icon: FlaskConical },
  { key: 'biologico', label: '3. Biológico', icon: Sprout },
  { key: 'pastagem', label: '4. Pastagens', icon: Leaf },
  { key: 'ambiental', label: '5. Ambiental', icon: TreePine }
] as const;

type SecaoKey = (typeof DIMENSOES)[number]['key'];

export const RecuperaDiagnosticoView: React.FC<Props> = ({
  areaAtiva,
  diagnosticoExistente,
  onSalvarDiagnostico
}) => {
  const [salvo, dispararSalvo, limparSalvo] = useTimedFlag(3000);
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoKey>('fisico');

  const [form, setForm] = useState<DiagnosticoTecnicoCompleto>(() =>
    diagnosticoExistente ?? criarDiagnosticoInicial(areaAtiva)
  );

  useEffect(() => {
    setForm(diagnosticoExistente ?? criarDiagnosticoInicial(areaAtiva));
    limparSalvo();
  }, [areaAtiva, diagnosticoExistente, limparSalvo]);

  const calcularScoreAutomatico = () => {
    setForm(prev => {
      let score = 0;
      if (prev.fisico.compactacaoPresente) score += 8;
      if (prev.fisico.infiltracaoAguaMmH < 15) score += 6;
      if (prev.fisico.erosaoSulcos) score += 8;
      if (prev.fisico.vocorocasPresentes) score += 8;

      if (prev.quimico.saturacaoBasesVpct < 40) score += 10;
      if (prev.quimico.saturacaoAluminioMpct > 20) score += 10;
      if (prev.quimico.teorFosforoMgDm3 < 5) score += 5;
      if (prev.quimico.teorMateriaOrganicaGDm3 < 20) score += 5;

      if (prev.biologico.coberturaVegetalVivaPct < 40) score += 15;
      if (prev.pastagem.percentualFalhasCoberturaPct > 40) score += 15;
      if (prev.pastagem.infestacaoPlantasDaninhasPct > 30) score += 10;

      let gravidade: GrauSeveridadeDegradacao = 'leve';
      if (score >= 70) gravidade = 'muito_severa';
      else if (score >= 50) gravidade = 'severa';
      else if (score >= 30) gravidade = 'moderada';

      return { ...prev, pontuacaoDegradacao: score, classificacaoGeral: gravidade };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarDiagnostico(form);
    dispararSalvo();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header do Diagnóstico */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Fase 2 • Diagnóstico Multifatorial
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase border tabular-nums ${
                SEVERIDADE_STYLES[form.classificacaoGeral]
              }`}
            >
              Grau: {form.classificacaoGeral.replace('_', ' ')} ({form.pontuacaoDegradacao}/100)
            </span>
          </div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 truncate">
            <ClipboardCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate tabular-nums">
              {areaAtiva.nomeTalhao} ({areaAtiva.areaHa.toLocaleString('pt-BR')} ha)
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={calcularScoreAutomatico}
            className="h-9 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 font-medium rounded-lg text-xs transition inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Recalcular Gravidade</span>
          </button>

          <button
            type="submit"
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Diagnóstico</span>
          </button>
        </div>
      </div>

      {salvo && (
        <div className="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/70 rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Diagnóstico técnico salvo com sucesso.</span>
        </div>
      )}

      {/* Navegação Segmentada das 5 Dimensões */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-1 p-1.5 bg-slate-50/70 dark:bg-zinc-950/60 border-b border-slate-200/80 dark:border-zinc-800 overflow-x-auto">
          {DIMENSOES.map(aba => {
            const Icon = aba.icon;
            const isAtiva = secaoAtiva === aba.key;
            return (
              <button
                key={aba.key}
                type="button"
                onClick={() => setSecaoAtiva(aba.key)}
                className={`h-8 px-3 rounded-lg text-xs font-medium transition inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  isAtiva
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{aba.label}</span>
              </button>
            );
          })}
        </div>

        {/* Conteúdo Dinâmico por Dimensão */}
        <div className="p-4 sm:p-5 text-xs space-y-4">
          {secaoAtiva === 'fisico' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Shovel className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Estrutura Física & Processos Erosivos</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg space-y-2.5">
                  <label className="flex items-center gap-2 font-medium text-slate-800 dark:text-zinc-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.fisico.compactacaoPresente}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          fisico: { ...prev.fisico, compactacaoPresente: e.target.checked }
                        }))
                      }
                      className="rounded accent-emerald-600"
                    />
                    <span>Compactação do Solo Presente</span>
                  </label>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                      Profundidade da Camada (cm)
                    </label>
                    <input
                      type="number"
                      value={form.fisico.profundidadeCamadaCompactadaCm}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          fisico: { ...prev.fisico, profundidadeCamadaCompactadaCm: parseFloat(e.target.value) || 0 }
                        }))
                      }
                      className={`${INPUT_CLASS} tabular-nums`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                      Resistência à Penetração (MPa)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={form.fisico.resistenciaPenetracaoMpa}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          fisico: { ...prev.fisico, resistenciaPenetracaoMpa: parseFloat(e.target.value) || 0 }
                        }))
                      }
                      className={`${INPUT_CLASS} tabular-nums`}
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg space-y-2.5">
                  <span className="font-medium text-slate-800 dark:text-zinc-200 block">
                    Infiltração & Selamento
                  </span>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                      Taxa de Infiltração Básica (mm/h)
                    </label>
                    <input
                      type="number"
                      value={form.fisico.infiltracaoAguaMmH}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          fisico: { ...prev.fisico, infiltracaoAguaMmH: parseFloat(e.target.value) || 0 }
                        }))
                      }
                      className={`${INPUT_CLASS} tabular-nums`}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={form.fisico.selamentoSuperficial}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          fisico: { ...prev.fisico, selamentoSuperficial: e.target.checked }
                        }))
                      }
                      className="rounded accent-emerald-600"
                    />
                    <span>Selamento / Crostamento Superficial</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.fisico.perdaEstruturaAgregados}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          fisico: { ...prev.fisico, perdaEstruturaAgregados: e.target.checked }
                        }))
                      }
                      className="rounded accent-emerald-600"
                    />
                    <span>Desagregação / Pulverização do Solo</span>
                  </label>
                </div>

                <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg space-y-2.5">
                  <span className="font-medium text-slate-800 dark:text-zinc-200 block">
                    Processos Erosivos Ativos
                  </span>
                  <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.fisico.erosaoLaminar}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          fisico: { ...prev.fisico, erosaoLaminar: e.target.checked }
                        }))
                      }
                      className="rounded accent-emerald-600"
                    />
                    <span>Erosão Laminar Generalizada</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.fisico.erosaoSulcos}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          fisico: { ...prev.fisico, erosaoSulcos: e.target.checked }
                        }))
                      }
                      className="rounded accent-emerald-600"
                    />
                    <span>Sulcos de Erosão (Enxurradas)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.fisico.vocorocasPresentes}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          fisico: { ...prev.fisico, vocorocasPresentes: e.target.checked }
                        }))
                      }
                      className="rounded accent-emerald-600"
                    />
                    <span>Ravinas / Voçorocas Profundas</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Observações de Campo da Física do Solo
                </label>
                <textarea
                  value={form.fisico.observacoes}
                  onChange={e =>
                    setForm(prev => ({ ...prev, fisico: { ...prev.fisico, observacoes: e.target.value } }))
                  }
                  rows={2}
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>
          )}

          {secaoAtiva === 'quimico' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Fertilidade Química & Acidez</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">pH em Água</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.quimico.phAgua}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        quimico: { ...prev.quimico, phAgua: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} font-semibold tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Saturação Bases (V%)
                  </label>
                  <input
                    type="number"
                    value={form.quimico.saturacaoBasesVpct}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        quimico: { ...prev.quimico, saturacaoBasesVpct: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} font-semibold tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Saturação Alumínio (m%)
                  </label>
                  <input
                    type="number"
                    value={form.quimico.saturacaoAluminioMpct}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        quimico: { ...prev.quimico, saturacaoAluminioMpct: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} font-semibold tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Matéria Orgânica (g/dm³)
                  </label>
                  <input
                    type="number"
                    value={form.quimico.teorMateriaOrganicaGDm3}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        quimico: { ...prev.quimico, teorMateriaOrganicaGDm3: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">Fósforo P (mg/dm³)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.quimico.teorFosforoMgDm3}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        quimico: { ...prev.quimico, teorFosforoMgDm3: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Potássio K (cmolc/dm³)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.quimico.teorPotassioCmolcDm3}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        quimico: { ...prev.quimico, teorPotassioCmolcDm3: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Cálcio Ca (cmolc/dm³)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.quimico.teorCalcioCmolcDm3}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        quimico: { ...prev.quimico, teorCalcioCmolcDm3: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Magnésio Mg (cmolc/dm³)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.quimico.teorMagnesioCmolcDm3}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        quimico: { ...prev.quimico, teorMagnesioCmolcDm3: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Observações Químicas & Desequilíbrios Nutricionais
                </label>
                <textarea
                  value={form.quimico.observacoes}
                  onChange={e =>
                    setForm(prev => ({ ...prev, quimico: { ...prev.quimico, observacoes: e.target.value } }))
                  }
                  rows={2}
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>
          )}

          {secaoAtiva === 'biologico' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Biologia do Solo & Macrofauna</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Cobertura Vegetal Viva (%)
                  </label>
                  <input
                    type="number"
                    value={form.biologico.coberturaVegetalVivaPct}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        biologico: { ...prev.biologico, coberturaVegetalVivaPct: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} font-semibold tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Cobertura por Palhada (%)
                  </label>
                  <input
                    type="number"
                    value={form.biologico.coberturaPalhadaMortaPct}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        biologico: { ...prev.biologico, coberturaPalhadaMortaPct: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} font-semibold tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Presença de Minhocas / Macrofauna
                  </label>
                  <select
                    value={form.biologico.presencaMacrofaunaMinhocas}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        biologico: {
                          ...prev.biologico,
                          presencaMacrofaunaMinhocas: e.target.value as DiagnosticoTecnicoCompleto['biologico']['presencaMacrofaunaMinhocas']
                        }
                      }))
                    }
                    className={INPUT_CLASS}
                  >
                    <option value="ausente">Ausente (Solo biologicamente inerte)</option>
                    <option value="baixa">Baixa (&lt; 2 indivíduos / dm³)</option>
                    <option value="moderada">Moderada (3 a 8 indivíduos / dm³)</option>
                    <option value="abundante">Abundante (&gt; 10 indivíduos / dm³)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
                  Observações de Biologia & Atividade Radicular
                </label>
                <textarea
                  value={form.biologico.observacoes}
                  onChange={e =>
                    setForm(prev => ({ ...prev, biologico: { ...prev.biologico, observacoes: e.target.value } }))
                  }
                  rows={2}
                  className={TEXTAREA_CLASS}
                />
              </div>
            </div>
          )}

          {secaoAtiva === 'pastagem' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Pastagem & Capacidade de Suporte Animal</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Espécie Forrageira Atual
                  </label>
                  <input
                    type="text"
                    value={form.pastagem.especieForrageiraAtual}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        pastagem: { ...prev.pastagem, especieForrageiraAtual: e.target.value }
                      }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Falhas de Cobertura (%)
                  </label>
                  <input
                    type="number"
                    value={form.pastagem.percentualFalhasCoberturaPct}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        pastagem: { ...prev.pastagem, percentualFalhasCoberturaPct: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} font-semibold tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Infestação de Daninhas (%)
                  </label>
                  <input
                    type="number"
                    value={form.pastagem.infestacaoPlantasDaninhasPct}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        pastagem: { ...prev.pastagem, infestacaoPlantasDaninhasPct: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} font-semibold tabular-nums`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Capacidade de Suporte Atual (UA/ha)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.pastagem.capacidadeSuporteAtualUaHa}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        pastagem: { ...prev.pastagem, capacidadeSuporteAtualUaHa: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Potencial Recuperado Esperado (UA/ha)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.pastagem.capacidadeSuportePotencialUaHa}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        pastagem: { ...prev.pastagem, capacidadeSuportePotencialUaHa: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums`}
                  />
                </div>
              </div>
            </div>
          )}

          {secaoAtiva === 'ambiental' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <TreePine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Conformidade Ambiental & Código Florestal</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 font-medium text-slate-800 dark:text-zinc-200 cursor-pointer p-3 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg">
                  <input
                    type="checkbox"
                    checked={form.ambiental.intervencaoApp}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        ambiental: { ...prev.ambiental, intervencaoApp: e.target.checked }
                      }))
                    }
                    className="rounded accent-emerald-600"
                  />
                  <span>Área Interfere em APP (Área de Preservação Permanente)</span>
                </label>

                <label className="flex items-center gap-2 font-medium text-slate-800 dark:text-zinc-200 cursor-pointer p-3 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg">
                  <input
                    type="checkbox"
                    checked={form.ambiental.degradacaoReservaLegal}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        ambiental: { ...prev.ambiental, degradacaoReservaLegal: e.target.checked }
                      }))
                    }
                    className="rounded accent-emerald-600"
                  />
                  <span>Área Sobreposta à Reserva Legal (RL)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Distância de Nascentes (m)
                  </label>
                  <input
                    type="number"
                    value={form.ambiental.distanciaNascentesM}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        ambiental: { ...prev.ambiental, distanciaNascentesM: parseFloat(e.target.value) || 0 }
                      }))
                    }
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-medium">
                    Cercamento Necessário (metros)
                  </label>
                  <input
                    type="number"
                    value={form.ambiental.necessidadeIsolamentoCercamentoM}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        ambiental: {
                          ...prev.ambiental,
                          necessidadeIsolamentoCercamentoM: parseFloat(e.target.value) || 0
                        }
                      }))
                    }
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Parecer Conclusivo */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
            <label className="block font-medium text-slate-800 dark:text-zinc-200 mb-1">
              Justificativa Técnica do Avaliador / Perito
            </label>
            <textarea
              value={form.justificativaTecnica}
              onChange={e => setForm(prev => ({ ...prev, justificativaTecnica: e.target.value }))}
              rows={3}
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>
      </div>
    </form>
  );
};
