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

export const RecuperaMonitoramentoView: React.FC<Props> = ({
  areaAtiva,
  monitoramentos,
  onSalvarMonitoramentos
}) => {
  const visitasDaArea = monitoramentos.filter(m => m.areaId === areaAtiva.id);
  const [salvo, dispararSalvo] = useTimedFlag(3000);

  // Dimensões do IGRA para cálculo interativo
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
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Fase 5 • Monitoramento Temporal & Indicador IGRA
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <span>IGRA — Índice GeaAgro de Recuperação da Área: {areaAtiva.nomeTalhao}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhamento contínuo em 5 dimensões técnicas (Física, Química, Biológica, Vegetativa e Produtiva)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-extrabold text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Score IGRA: {igra.scoreConsolidado} / 100</span>
          </div>
        </div>
      </div>

      {salvo && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Monitoramento registrado com sucesso no histórico da fazenda!</span>
        </div>
      )}

      {/* Painel Central do IGRA com as 5 Dimensões */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders das 5 Dimensões Técnicas (7 colunas) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
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
              <div key={dim.titulo}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {dim.titulo} (Peso {(dim.peso * 100).toFixed(0)}%)
                  </span>
                  <span className="font-extrabold text-emerald-600">{dim.nota} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={dim.nota}
                  onChange={e => dim.onChange(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600"
                />
                <span className="text-[10px] text-slate-400">{dim.descricao}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnóstico Consolidado do IGRA (5 colunas) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Consolidação do Estágio & Diagnóstico
          </h3>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Estágio Apurado: {igra.classificacaoEstagio.replace('_', ' ')}
            </span>
            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {igra.diagnosticoResumo}
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-900 dark:text-white block mb-1.5">Gaps & Pontos de Atenção Identificados:</span>
            {igra.gapsIdentificados.length === 0 ? (
              <p className="text-emerald-600 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Nenhuma fragilidade crítica identificada no momento!</span>
              </p>
            ) : (
              <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                {igra.gapsIdentificados.map((gap, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Formulário para Registrar Nova Vistoria de Monitoramento */}
      <form onSubmit={handleAdicionarVisita} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Plus className="w-4 h-4 text-emerald-600" />
          <span>Registrar Nova Vistoria de Monitoramento em Campo</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Data da Vistoria</label>
            <input
              type="date"
              value={novaVisitaData}
              onChange={e => setNovaVisitaData(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Responsável Técnico</label>
            <input
              type="text"
              value={novaVisitaResponsavel}
              onChange={e => setNovaVisitaResponsavel(e.target.value)}
              placeholder="Eng. Agrônomo"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Cobertura Vegetal (%)</label>
            <input
              type="number"
              value={novaVisitaCobertura}
              onChange={e => setNovaVisitaCobertura(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Observações da Vistoria</label>
          <textarea
            value={novaVisitaObs}
            onChange={e => setNovaVisitaObs(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 resize-none"
            placeholder="Anotações sobre emergência das plantas, fechamento de sulcos, perfilhamento..."
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow"
          >
            <Save className="w-4 h-4" />
            <span>Salvar no Histórico de Monitoramento</span>
          </button>
        </div>
      </form>

      {/* Histórico Temporal de Vistorias */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Histórico de Vistorias Realizadas ({visitasDaArea.length})</span>
        </h3>

        {visitasDaArea.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            Nenhuma vistoria de monitoramento registrada ainda. Registre acima a primeira vistoria de campo.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visitasDaArea.map(v => (
              <div key={v.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-600">Vistoria em {v.dataVisita}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    IGRA: {v.igraScore} pts
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">Responsável: {v.responsavel}</p>
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                  <div>Cob. Viva: <strong>{v.coberturaVegetalVivaPct}%</strong></div>
                  <div>Infiltração: <strong>{v.infiltracaoEstimada.split(' ')[0]}</strong></div>
                  <div>Suporte: <strong>{v.capacidadeSuporteAtualUaHa} UA/ha</strong></div>
                </div>
                <p className="text-slate-500 text-[11px]">{v.observacoesGerais}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
