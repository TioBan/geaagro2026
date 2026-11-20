import React, { useState } from 'react';
import { AreaDegradadaItem } from '../../types/recupera';
import { calcularCurvasNivelRecupera } from '../../utils/recuperaCalculos';
import { Shovel, CheckCircle2, Waves } from 'lucide-react';

interface Props {
  areaAtiva?: AreaDegradadaItem;
}

const INPUT_CLASS =
  'w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition';

export const RecuperaConservacaoSoloView: React.FC<Props> = ({ areaAtiva }) => {
  const [declividadePct, setDeclividadePct] = useState<string>('');
  const [tipoSolo, setTipoSolo] = useState<
    'muito_permeavel' | 'permeavel' | 'pouco_permeavel' | 'impermeavel' | ''
  >('');
  const [praticaManejo, setPraticaManejo] = useState<
    'plantio_direto' | 'preparo_convencional' | 'pastagem_manejada' | ''
  >('');

  const declividadeNum = parseFloat(declividadePct);
  const parametrosPreenchidos =
    declividadePct !== '' &&
    Number.isFinite(declividadeNum) &&
    declividadeNum > 0 &&
    tipoSolo !== '' &&
    praticaManejo !== '';

  const resultadoTerraco = parametrosPreenchidos
    ? calcularCurvasNivelRecupera({
        declividadePct: declividadeNum,
        tipoSolo: tipoSolo as 'muito_permeavel' | 'permeavel' | 'pouco_permeavel' | 'impermeavel',
        praticaConservacionista: praticaManejo as
          | 'plantio_direto'
          | 'preparo_convencional'
          | 'pastagem_manejada'
      })
    : null;

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800">
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          Fase 4 • Conservação do Solo & Controle de Erosão
        </span>
        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 mt-0.5">
          <Shovel className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>
            Dimensionamento de Terraços & Curvas de Nível{areaAtiva ? `: ${areaAtiva.nomeTalhao}` : ''}
          </span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Cálculo do Espaçamento Vertical (EV) e Espaçamento Horizontal (EH) baseado na fórmula de Bentley / Lombardi Neto
        </p>
      </div>

      {/* Grid: Parâmetros e Dimensionamento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 text-xs">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            Parâmetros do Terreno & Rampa
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">
                Declividade Média do Terreno (%) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={declividadePct}
                onChange={e => setDeclividadePct(e.target.value)}
                placeholder="Ex: 6.5"
                className={`${INPUT_CLASS} font-semibold tabular-nums`}
              />
              {declividadePct !== '' && Number.isFinite(declividadeNum) && declividadeNum > 0 && (
                <span className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1 block">
                  {declividadeNum < 3
                    ? 'Relevo Plano a Suave-Ondulado'
                    : declividadeNum <= 8
                    ? 'Relevo Moderadamente Ondulado'
                    : 'Relevo Forte-Ondulado'}
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">
                Permeabilidade e Textura do Solo *
              </label>
              <select
                value={tipoSolo}
                onChange={e =>
                  setTipoSolo(
                    e.target.value as 'muito_permeavel' | 'permeavel' | 'pouco_permeavel' | 'impermeavel' | ''
                  )
                }
                className={INPUT_CLASS}
              >
                <option value="">Selecione a permeabilidade do solo...</option>
                <option value="muito_permeavel">Muito Permeável (Latossolo Vermelho arenoso / profundo)</option>
                <option value="permeavel">Permeável (Latossolo argiloso bem estruturado)</option>
                <option value="pouco_permeavel">Pouco Permeável (Argissolo com B textural adensado)</option>
                <option value="impermeavel">Impermeável (Plintossolo / solo raso com cascalho)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 font-medium mb-1">
                Manejo e Cobertura Pretendida *
              </label>
              <select
                value={praticaManejo}
                onChange={e =>
                  setPraticaManejo(
                    e.target.value as 'plantio_direto' | 'preparo_convencional' | 'pastagem_manejada' | ''
                  )
                }
                className={INPUT_CLASS}
              >
                <option value="">Selecione o manejo conservacionista...</option>
                <option value="pastagem_manejada">Pastagem Bem Manejada (Resíduo &gt; 15 cm)</option>
                <option value="plantio_direto">Plantio Direto na Palha (Excelente cobertura)</option>
                <option value="preparo_convencional">Preparo Convencional (Gradagem / Solo exposto)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dimensionamento Técnico */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 text-xs">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Dimensionamento de Terraços & Curvas de Nível</span>
            </h3>
            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-md whitespace-nowrap">
              Lombardi Neto / IAC
            </span>
          </div>

          {resultadoTerraco ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 border border-slate-200/80 dark:border-zinc-800 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80 dark:divide-zinc-800 overflow-hidden">
                <div className="p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block">
                    Espaçamento Vertical (EV)
                  </span>
                  <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200 tabular-nums mt-0.5">
                    {resultadoTerraco.espacamentoVerticalMetros} <span className="text-xs font-medium">m</span>
                  </p>
                  <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                    Diferença de nível entre terraços
                  </span>
                </div>

                <div className="p-3.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                    Espaçamento Horizontal (EH)
                  </span>
                  <p className="text-xl font-bold text-slate-900 dark:text-zinc-100 tabular-nums mt-0.5">
                    {resultadoTerraco.espacamentoHorizontalMetros} <span className="text-xs font-medium">m</span>
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">Distância física de rampa</span>
                </div>

                <div className="p-3.5">
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">Tipo Recomendado</span>
                  <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mt-1">
                    {resultadoTerraco.tipoTerracoRecomendado}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-2">
                <p className="font-semibold text-slate-900 dark:text-zinc-100">{resultadoTerraco.memoria.titulo}</p>
                <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 bg-white dark:bg-zinc-900 px-2.5 py-2 rounded-md border border-slate-200/80 dark:border-zinc-800">
                  {resultadoTerraco.memoria.formula}
                </p>
                <div className="space-y-1 text-slate-600 dark:text-zinc-400 tabular-nums">
                  {resultadoTerraco.memoria.passosCalculo.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 pt-1.5 border-t border-slate-200/70 dark:border-zinc-800">
                  Ref: {resultadoTerraco.memoria.referenciaBibliografica}
                </p>
              </div>
            </>
          ) : (
            <div className="p-10 text-center text-xs text-slate-500 dark:text-zinc-400 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-dashed border-slate-200 dark:border-zinc-800">
              Informe a declividade do terreno (%), selecione a permeabilidade do solo e o manejo pretendido para calcular os espaçamentos EV e EH.
            </div>
          )}
        </div>
      </div>

      {/* Práticas Mecânicas e Vegetativas Especiais */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4 text-xs">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <Waves className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Controle de Erosão Severa: Voçorocas, Ravinas e Bacias de Contenção</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-zinc-100">1. Desvio de Enxurrada de Cabeceira</h4>
            <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
              Construção de canal divergente ou terraço de desvio a 15-20 metros da cabeceira da voçoroca para impedir que a água superficial continue caindo no abismo erosivo.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-zinc-100">2. Paliçadas & Biomantas</h4>
            <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
              Instalação de barreiras de estacas de eucalipto com bambu ou tela para reter sedimentos no fundo do sulco e estabilização de taludes verticais por suavização para 1:1.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/70 dark:border-zinc-800 space-y-1.5">
            <h4 className="font-semibold text-slate-900 dark:text-zinc-100">3. Bacias de Contenção (Caixas Secas)</h4>
            <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
              Abertura de pequenas bacias de infiltração nas margens de estradas internas para absorver 100% da enxurrada e abastecer o lençol freático sem assoreamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
