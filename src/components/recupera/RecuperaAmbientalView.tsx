import React, { useState } from 'react';
import { AreaDegradadaItem } from '../../types/recupera';
import {
  TreePine,
  Sprout,
  ShieldAlert,
  Compass
} from 'lucide-react';

interface Props {
  areaAtiva: AreaDegradadaItem;
}

const ESPECIES_NATIVAS_CATALOGO = [
  {
    nome: 'Embaúba (Cecropia pachystachya)',
    grupo: 'Pioneira',
    crescimento: 'Muito Rápido',
    bioma: 'Cerrado / Mata Atlântica',
    funcao: 'Sombreamento inicial rápido e atração de avifauna dispersora.'
  },
  {
    nome: 'Aroeira-Pimenteira (Schinus terebinthifolia)',
    grupo: 'Pioneira',
    crescimento: 'Rápido',
    bioma: 'Mata Ciliar / Áreas Úmidas',
    funcao: 'Fixação de barrancos em margens de rios e tolerância a solos encharcados.'
  },
  {
    nome: 'Ingá-do-Brejo (Inga vera)',
    grupo: 'Secundária Inicial',
    crescimento: 'Rápido',
    bioma: 'Mata Ciliar',
    funcao: 'Fixação biológica de Nitrogênio e frutos altamente apreciados pela fauna aquática.'
  },
  {
    nome: 'Ipê-Amarelo (Handroanthus albus)',
    grupo: 'Secundária Tardia',
    crescimento: 'Médio',
    bioma: 'Cerrado / Floresta Estacional',
    funcao: 'Estruturação de dossel e valor ecológico/paisagístico nobre.'
  },
  {
    nome: 'Jequitibá-Rosa (Cariniana legalis)',
    grupo: 'Clímax',
    crescimento: 'Lento a Médio',
    bioma: 'Mata Atlântica',
    funcao: 'Espécie emergente longeva para consolidação definitiva da floresta clímax.'
  }
];

export const RecuperaAmbientalView: React.FC<Props> = ({ areaAtiva }) => {
  const [tipoArea, setTipoArea] = useState<'app_nascente' | 'app_curso_dagua' | 'reserva_legal' | 'saf'>('app_curso_dagua');
  const [larguraRioMetros, setLarguraRioMetros] = useState<number>(8); // <10m -> APP 30m
  const [metodoRecuperacao, setMetodoRecuperacao] = useState<'plantio_total' | 'regeneracao_assistida' | 'enriquecimento'>('plantio_total');

  // Cálculo da faixa de APP exigida pelo Código Florestal (Lei 12.651/2012)
  const calcularFaixaApp = () => {
    if (tipoArea === 'app_nascente') return 50; // raio de 50 metros ao redor da nascente
    if (larguraRioMetros < 10) return 30;
    if (larguraRioMetros <= 50) return 50;
    if (larguraRioMetros <= 200) return 100;
    if (larguraRioMetros <= 600) return 200;
    return 500;
  };

  const faixaExigida = calcularFaixaApp();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          Fase 4 • Recuperação Ambiental & Conformidade Legal (PRAD)
        </span>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TreePine className="w-5 h-5 text-emerald-600" />
          <span>Restauração de APP, Reserva Legal & Nascentes: {areaAtiva.nomeTalhao}</span>
        </h2>
        <p className="text-xs text-slate-500">
          Enquadramento no Código Florestal (Lei 12.651/2012), modelo sucessional de mudas nativas e isolamento
        </p>
      </div>

      {/* Enquadramento Código Florestal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>1. Classificação do Espaço Protegido</span>
          </h3>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Tipo de Área Ambiental</label>
            <select
              value={tipoArea}
              onChange={e => setTipoArea(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            >
              <option value="app_curso_dagua">APP de Curso d'Água (Rios e Córregos)</option>
              <option value="app_nascente">APP de Nascente ou Olho d'Água</option>
              <option value="reserva_legal">Reserva Legal (RL)</option>
              <option value="saf">Sistema Agroflorestal Biodiverso (SAF)</option>
            </select>
          </div>

          {tipoArea === 'app_curso_dagua' && (
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Largura do Curso d'Água (metros)
              </label>
              <input
                type="number"
                value={larguraRioMetros}
                onChange={e => setLarguraRioMetros(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
          )}

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block font-semibold">Exigência Lei 12.651/2012:</span>
            <p className="text-base font-extrabold text-emerald-900 dark:text-emerald-200">
              {tipoArea === 'app_nascente' ? 'Raio de 50 metros' : `Faixa marginal de ${faixaExigida} metros`}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>2. Modelo Sucessional de Revegetação</span>
          </h3>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Método de Restauração</label>
            <select
              value={metodoRecuperacao}
              onChange={e => setMetodoRecuperacao(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
            >
              <option value="plantio_total">Plantio Total em Área Total (Alta Densidade)</option>
              <option value="regeneracao_assistida">Condução da Regeneração Natural (Baixo Custo)</option>
              <option value="enriquecimento">Enriquecimento de Fragmento Degradado</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200">Proporção Ecológica Recomendada:</p>
            <p className="text-slate-600 dark:text-slate-400 text-[11px]">
              • <strong>50% Espécies Pioneiras / Secundárias Iniciais:</strong> Rápido fechamento de copa, controle de braquiária e geração de matéria orgânica.<br />
              • <strong>50% Espécies Não-Pioneiras / Clímax:</strong> Longevidade ecológica e sustentabilidade permanente do estrato florestal.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>3. Proteção & Isolamento Obrigatório</span>
          </h3>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 space-y-1.5">
            <p className="font-bold text-amber-900 dark:text-amber-200">Isolamento contra Gado (Cercamento):</p>
            <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
              O acesso de animais em áreas de APP e nascentes em recuperação causa pisoteio das mudas, compactação do solo marginal e destruição de olhos d'água.
              Cerca com 4 ou 5 fios de arame liso é pré-requisito mandatório em qualquer PRAD.
            </p>
          </div>
        </div>
      </div>

      {/* Espécies Nativas Indicadas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <TreePine className="w-4 h-4 text-emerald-600" />
          <span>Espécies Arbóreas Nativas Chave para PRAD</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {ESPECIES_NATIVAS_CATALOGO.map((esp, i) => (
            <div key={i} className="p-3.5 bg-slate-50/60 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white">{esp.nome}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {esp.grupo}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">{esp.funcao}</p>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Crescimento: {esp.crescimento}</span>
                <span>{esp.bioma}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
