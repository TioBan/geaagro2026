import React, { useState, useEffect } from 'react';
import {
  AreaDegradadaItem,
  MonitoramentoVisita
} from '../../types/recupera';
import { calcularIgraConsolidado } from '../../utils/recuperaCalculos';
import { useTimedFlag } from './useTimedFlag';
import {
  Activity,
  Plus,
  Save,
  CheckCircle2,
  Calendar,
  Award,
  AlertTriangle
} from 'lucide-react';

interface Props {
  areaAtiva: AreaDegradadaItem;
  monitoramentos: MonitoramentoVisita[];
  onSalvarMonitoramentos: (visitasAtualizadas: MonitoramentoVisita[]) => void;
}

const INPUT_CLASS =
  'w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500';

const LABEL_CLASS =
  'block text-[11px] font-medium text-slate-600 dark:text-zinc-400 mb-1';

export const RecuperaMonitoramentoView: React.FC<Props> = ({
  areaAtiva,
  monitoramentos,
  onSalvarMonitoramentos
}) => {
  const visitasDaArea = monitoramentos.filter(m => m.areaId === areaAtiva.id);
  const [salvo, dispararSalvo] = useTimedFlag(3000);

  const [notaFisica, setNotaFisica] = useState<number>(65);
  const [notaQuimica, setNotaQuimica] = useState<number>(70);
  const [notaBiologica, setNotaBiologica] = useState<number>(55);
  const [notaVegetativa, setNotaVegetativa] = useState<number>(75);
  const [notaProdutiva, setNotaProdutiva] = useState<number>(60);

  const igra = calcularIgraConsolidado({
    fisica: notaFisica,
    quimica: notaQuimica,
    biologica: notaBiologica,
    vegetativa: notaVegetativa,
    produtiva: notaProdutiva
  });

  const [novaVisitaData, setNovaVisitaData] = useState(new Date().toISOString().split('T')[0]);
  const [novaVisitaResponsavel, setNovaVisitaResponsavel] = useState(areaAtiva.responsavelTecnico || '');
  const [novaVisitaCobertura, setNovaVisitaCobertura] = useState(65);
  const [novaVisitaObs, setNovaVisitaObs] = useState('');

  useEffect(() => {
    setNovaVisitaResponsavel(areaAtiva.responsavelTecnico || '');
  }, [areaAtiva.id, areaAtiva.responsavelTecnico]);

  const handleAdicionarVisita = (e: React.FormEvent) => {
    e.preventDefault();
    const nova: MonitoramentoVisita = {
      id: `monit-${Date.now()}`,
      areaId: areaAtiva.id,
      dataVisita: novaVisitaData,
      responsavel: novaVisitaResponsavel || 'Eng. Agrônomo',
      coordenadasGps: areaAtiva.coordenadasCentroid,
      coberturaVegetalVivaPct: novaVisitaCobertura,
      coberturaPalhadaPct: 20,
      soloExpostoPct: Math.max(0, 100 - novaVisitaCobertura - 20),
      densidadePlantasM2: 120,
      alturaMediaVegetacaoCm: 25,
      biomassaSecaEstimadaTHa: 4.5,
      presencaPlantasDaninhasPct: 10,
      sinaisErosaoAtiva: false,
      estabilidadeBordasRavinas: 'Estabilizadas com cobertura vegetal',
      infiltracaoEstimada: 'Boa (> 25 mm/h)',
      capacidadeSuporteAtualUaHa: 1.2,
      observacoesGerais: novaVisitaObs || 'Vistoria de campo registrando evolução positiva da cobertura de solo.',
      fotografiasAntesDepois: [],
      igraScore: igra.scoreConsolidado
    };

    onSalvarMonitoramentos([...monitoramentos, nova]);
    dispararSalvo();
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Fase 5 • Monitoramento Temporal & Indicador IGRA
          </span>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 mt-0.5">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">IGRA — Índice GeaAgro de Recuperação: {areaAtiva.nomeTalhao}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Acompanhamento contínuo em 5 dimensões técnicas (Física, Química, Biológica, Vegetativa e Produtiva)
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 font-semibold text-xs flex items-center gap-1.5 self-start md:self-auto shrink-0 tabular-nums">
          <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Score IGRA: {igra.scoreConsolidado} / 100</span>
        </div>
      </div>

      {salvo && (
        <div className="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Monitoramento registrado com sucesso no histórico da propriedade.</span>
        </div>
      )}

      {/* Painel Central do IGRA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800 space-y-3.5">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 border-b border-slate-200/70 dark:border-zinc-800 pb-2.5">
            Avaliação Paramétrica das 5 Dimensões de Recuperação
          </h3>

          <div className="space-y-3.5">
            {[
              {
                titulo: '1. Dimensão Física',
                peso: igra.pesoFisica,
                nota: notaFisica,
                onChange: setNotaFisica,
                descricao: 'Infiltração de água, ausência de compactação e estabilização de sulcos/voçorocas.'
              },
              {
                titulo: '2. Dimensão Química',
                peso: igra.pesoQuimica,
                nota: notaQuimica,
                onChange: setNotaQuimica,
                descricao: 'Correção de acidez (V%), ausência de Al³⁺ tóxico, suprimento de P e K.'
              },
              {
                titulo: '3. Dimensão Biológica',
                peso: igra.pesoBiologica,
                nota: notaBiologica,
                onChange: setNotaBiologica,
                descricao: 'Ciclagem de matéria orgânica, presença de macrofauna (minhocas) e vida microbiana.'
              },
              {
                titulo: '4. Dimensão Vegetativa',
                peso: igra.pesoVegetativa,
                nota: notaVegetativa,
                onChange: setNotaVegetativa,
                descricao: 'Cobertura de solo (ausência de solo exposto), vigor forrageiro e ausência de daninhas.'
              },
              {
                titulo: '5. Dimensão Produtiva',
                peso: igra.pesoProdutiva,
                nota: notaProdutiva,
                onChange: setNotaProdutiva,
                descricao: 'Produção de forragem / biomassa, suporte de pastejo (UA/ha) e estabilidade econômica.'
              }
            ].map(dim => (
              <div key={dim.titulo} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-800 dark:text-zinc-200">
                    {dim.titulo}{' '}
                    <span className="text-slate-400 dark:text-zinc-500 font-normal tabular-nums">
                      (Peso {(dim.peso * 100).toFixed(0)}%)
                    </span>
                  </span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {dim.nota} pts
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={dim.nota}
                  onChange={e => dim.onChange(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">{dim.descricao}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnóstico Consolidado */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800 space-y-3.5 text-xs">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 border-b border-slate-200/70 dark:border-zinc-800 pb-2.5">
            Consolidação do Estágio & Diagnóstico
          </h3>

          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
              Estágio Apurado: {igra.classificacaoEstagio.replace(/_/g, ' ')}
            </span>
            <p className="text-slate-800 dark:text-zinc-200 leading-relaxed">
              {igra.diagnosticoResumo}
            </p>
          </div>

          <div>
            <span className="font-semibold text-slate-900 dark:text-zinc-100 block mb-2">
              Gaps & Pontos de Atenção Identificados:
            </span>
            {igra.gapsIdentificados.length === 0 ? (
              <p className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Nenhuma fragilidade crítica identificada no momento.</span>
              </p>
            ) : (
              <ul className="space-y-1.5 text-slate-600 dark:text-zinc-400">
                {igra.gapsIdentificados.map((gap, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Formulário para Registrar Nova Vistoria */}
      <form
        onSubmit={handleAdicionarVisita}
        className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-slate-200/80 dark:border-zinc-800 space-y-3.5"
      >
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 border-b border-slate-200/70 dark:border-zinc-800 pb-2.5">
          <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Registrar Nova Vistoria de Monitoramento em Campo</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={LABEL_CLASS}>Data da Vistoria</label>
            <input
              type="date"
              value={novaVisitaData}
              onChange={e => setNovaVisitaData(e.target.value)}
              className={`${INPUT_CLASS} tabular-nums`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Responsável Técnico</label>
            <input
              type="text"
              value={novaVisitaResponsavel}
              onChange={e => setNovaVisitaResponsavel(e.target.value)}
              placeholder="Eng. Agrônomo"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Cobertura Vegetal (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={novaVisitaCobertura}
              onChange={e => setNovaVisitaCobertura(parseFloat(e.target.value) || 0)}
              className={`${INPUT_CLASS} font-semibold tabular-nums`}
            />
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>Observações da Vistoria</label>
          <textarea
            value={novaVisitaObs}
            onChange={e => setNovaVisitaObs(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
            placeholder="Anotações sobre emergência das plantas, fechamento de sulcos, perfilhamento..."
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 transition whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar no Histórico de Monitoramento</span>
          </button>
        </div>
      </form>

      {/* Histórico Temporal de Vistorias */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 tabular-nums">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Histórico de Vistorias Realizadas ({visitasDaArea.length})</span>
        </h3>

        {visitasDaArea.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-xs">
            Nenhuma vistoria de monitoramento registrada ainda. Registre acima a primeira vistoria de campo.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visitasDaArea.map(v => (
              <div
                key={v.id}
                className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200/80 dark:border-zinc-800 text-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    Vistoria em {v.dataVisita}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 tabular-nums">
                    IGRA: {v.igraScore} pts
                  </span>
                </div>
                <p className="text-slate-600 dark:text-zinc-400">Responsável: {v.responsavel}</p>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                  <div>
                    Cob. Viva: <strong className="text-slate-800 dark:text-zinc-200">{v.coberturaVegetalVivaPct}%</strong>
                  </div>
                  <div>
                    Infiltração: <strong className="text-slate-800 dark:text-zinc-200">{v.infiltracaoEstimada.split(' ')[0]}</strong>
                  </div>
                  <div>
                    Suporte: <strong className="text-slate-800 dark:text-zinc-200">{v.capacidadeSuporteAtualUaHa} UA/ha</strong>
                  </div>
                </div>
                <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                  {v.observacoesGerais}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
