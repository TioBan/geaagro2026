import React, { useState } from 'react';
import { AreaDegradadaItem } from '../../types/recupera';
import { TreePine, Sprout, ShieldAlert, Compass } from 'lucide-react';

interface Props {
  areaAtiva: AreaDegradadaItem;
}

const INPUT_CLASS =
  'w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition';

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
  const [tipoArea, setTipoArea] = useState<'app_nascente' | 'app_curso_dagua' | 'reserva_legal' | 'saf'>(
    'app_curso_dagua'
  );
  const [larguraRioMetros, setLarguraRioMetros] = useState<number>(8);
  const [metodoRecuperacao, setMetodoRecuperacao] = useState<
    'plantio_total' | 'regeneracao_assistida' | 'enriquecimento'
  >('plantio_total');

  const calcularFaixaApp = () => {
    if (tipoArea === 'app_nascente') return 50;
    if (larguraRioMetros < 10) return 30;
    if (larguraRioMetros <= 50) return 50;
    if (larguraRioMetros <= 200) return 100;
    if (larguraRioMetros <= 600) return 200;
    return 500;
  };

  const faixaExigida = calcularFaixaApp();

  const textoExigenciaLegal =
    tipoArea === 'app_nascente'
      ? 'Raio mínimo de 50 metros'
      : tipoArea === 'app_curso_dagua'
      ? `Faixa marginal de ${faixaExigida} metros`
      : tipoArea === 'reserva_legal'
      ? '20% a 80% do imóvel (conforme bioma)'
      : 'Consórcio arbóreo + agrícola sustentável';

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800">
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          Fase 4 • Recuperação Ambiental & Conformidade Legal (PRAD)
        </span>
        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 mt-0.5">
          <TreePine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Restauração de APP, Reserva Legal & Nascentes: {areaAtiva.nomeTalhao}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Enquadramento no Código Florestal (Lei 12.651/2012), modelo sucessional de mudas nativas e isolamento
        </p>
      </div>

      {/* Enquadramento Código Florestal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-3 text-xs">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>1. Espaço Protegido</span>
          </h3>

          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Tipo de Área Ambiental</label>
            <select
              value={tipoArea}
              onChange={e =>
                setTipoArea(e.target.value as 'app_nascente' | 'app_curso_dagua' | 'reserva_legal' | 'saf')
              }
              className={`${INPUT_CLASS} font-medium`}
            >
              <option value="app_curso_dagua">APP de Curso d'Água (Rios e Córregos)</option>
              <option value="app_nascente">APP de Nascente ou Olho d'Água</option>
              <option value="reserva_legal">Reserva Legal (RL)</option>
              <option value="saf">Sistema Agroflorestal Biodiverso (SAF)</option>
            </select>
          </div>

          {tipoArea === 'app_curso_dagua' && (
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">
                Largura do Curso d'Água (metros)
              </label>
              <input
                type="number"
                value={larguraRioMetros}
                onChange={e => setLarguraRioMetros(parseFloat(e.target.value) || 0)}
                className={`${INPUT_CLASS} font-semibold tabular-nums`}
              />
            </div>
          )}

          <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/70 dark:border-emerald-900/60">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-medium">
              Exigência Lei 12.651/2012
            </span>
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200 tabular-nums mt-0.5">
              {textoExigenciaLegal}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-3 text-xs">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>2. Modelo Sucessional</span>
          </h3>

          <div>
            <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">Método de Restauração</label>
            <select
              value={metodoRecuperacao}
              onChange={e =>
                setMetodoRecuperacao(
                  e.target.value as 'plantio_total' | 'regeneracao_assistida' | 'enriquecimento'
                )
              }
              className={`${INPUT_CLASS} font-medium`}
            >
              <option value="plantio_total">Plantio Total em Área Total (Alta Densidade)</option>
              <option value="regeneracao_assistida">Condução da Regeneração Natural (Baixo Custo)</option>
              <option value="enriquecimento">Enriquecimento de Fragmento Degradado</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg space-y-1">
            <p className="font-semibold text-slate-800 dark:text-zinc-200">Proporção Ecológica Recomendada:</p>
            <p className="text-slate-600 dark:text-zinc-400 text-[11px] leading-relaxed">
              • <strong>50% Pioneiras / Secundárias Iniciais:</strong> rápido fechamento de copa, controle de gramíneas invasoras e geração de serapilheira.
              <br />• <strong>50% Não-Pioneiras / Clímax:</strong> longevidade ecológica e sustentabilidade permanente do estrato florestal.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-3 text-xs">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>3. Proteção & Isolamento</span>
          </h3>

          <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200/70 dark:border-amber-900/60 space-y-1.5">
            <p className="font-semibold text-amber-900 dark:text-amber-200">Isolamento contra Gado (Cercamento)</p>
            <p className="text-amber-800 dark:text-amber-300/90 text-[11px] leading-relaxed">
              O acesso de animais em áreas de APP e nascentes em recuperação causa pisoteio das mudas, compactação do solo marginal e destruição de olhos d'água. Cerca com 4 ou 5 fios de arame liso é pré-requisito mandatório em qualquer PRAD.
            </p>
          </div>
        </div>
      </div>

      {/* Espécies Nativas Indicadas */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <TreePine className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Espécies Arbóreas Nativas Chave para PRAD</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {ESPECIES_NATIVAS_CATALOGO.map(esp => (
            <div
              key={esp.nome}
              className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-slate-900 dark:text-zinc-100 leading-snug">{esp.nome}</h4>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 shrink-0">
                  {esp.grupo}
                </span>
              </div>
              <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-snug">{esp.funcao}</p>
              <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500">
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
