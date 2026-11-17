import React, { useState } from 'react';
import { AreaDegradadaItem } from '../../types/recupera';
import { calcularCurvasNivelRecupera } from '../../utils/recuperaCalculos';
import {
  Shovel,
  CheckCircle2,
  Waves
} from 'lucide-react';

interface Props {
  areaAtiva?: AreaDegradadaItem;
}

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
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          Fase 4 • Conservação do Solo & Controle de Erosão
        </span>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shovel className="w-5 h-5 text-emerald-600" />
          <span>
            Dimensionamento de Terraços & Curvas de Nível{areaAtiva ? `: ${areaAtiva.nomeTalhao}` : ''}
          </span>
        </h2>
        <p className="text-xs text-slate-500">
          Cálculo do Espaçamento Vertical (EV) e Espaçamento Horizontal (EH) baseado na fórmula de Bentley / Lombardi Neto
        </p>
      </div>

      {/* Grid: Parâmetros (Esquerda) e Dimensionamento (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parâmetros de Entrada */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Parâmetros do Terreno & Rampa
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Declividade Média do Terreno (%) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={declividadePct}
                onChange={e => setDeclividadePct(e.target.value)}
                placeholder="Ex: 6.5"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
              />
              {declividadePct !== '' && Number.isFinite(declividadeNum) && declividadeNum > 0 && (
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {declividadeNum < 3
                    ? 'Relevo Plano a Suave-Ondulado'
                    : declividadeNum <= 8
                    ? 'Relevo Moderadamente Ondulado'
                    : 'Relevo Forte-Ondulado'}
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Permeabilidade e Textura do Solo *
              </label>
              <select
                value={tipoSolo}
                onChange={e => setTipoSolo(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
              >
                <option value="">Selecione a permeabilidade do solo...</option>
                <option value="muito_permeavel">Muito Permeável (Latossolo Vermelho arenoso / profundo)</option>
                <option value="permeavel">Permeável (Latossolo argiloso bem estruturado)</option>
                <option value="pouco_permeavel">Pouco Permeável (Argissolo com B textural adensado)</option>
                <option value="impermeavel">Impermeável (Plintossolo / solo raso com cascalho)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Manejo e Cobertura Pretendida *
              </label>
              <select
                value={praticaManejo}
                onChange={e => setPraticaManejo(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
              >
                <option value="">Selecione o manejo conservacionista...</option>
                <option value="pastagem_manejada">Pastagem Bem Manejada (Resíduo &gt; 15 cm)</option>
                <option value="plantio_direto">Plantio Direto na Palha (Excelente cobertura)</option>
                <option value="preparo_convencional">Preparo Convencional (Gradagem / Solo exposto)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dimensionamento Técnico do Terraço */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Dimensionamento de Terraços & Curvas de Nível</span>
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Lombardi Neto / IAC
            </span>
          </div>

          {resultadoTerraco ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block">Espaçamento Vertical (EV)</span>
                  <p className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-200">
                    {resultadoTerraco.espacamentoVerticalMetros} <span className="text-xs">m</span>
                  </p>
                  <span className="text-[10px] text-emerald-600 font-medium">Diferença de nível entre terraços</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">Espaçamento Horizontal (EH)</span>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {resultadoTerraco.espacamentoHorizontalMetros} <span className="text-xs">m</span>
                  </p>
                  <span className="text-[10px] text-slate-500">Distância física de rampa</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">Tipo Recomendado</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {resultadoTerraco.tipoTerracoRecomendado}
                  </p>
                </div>
              </div>

              {/* Memória de Cálculo Auditável */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">{resultadoTerraco.memoria.titulo}</p>
                <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  {resultadoTerraco.memoria.formula}
                </p>
                <div className="space-y-1 text-slate-600 dark:text-slate-400">
                  {resultadoTerraco.memoria.passosCalculo.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                  Ref: {resultadoTerraco.memoria.referenciaBibliografica}
                </p>
              </div>
            </>
          ) : (
            <div className="p-10 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              Informe a declividade do terreno (%), selecione a permeabilidade do solo e o manejo pretendido para calcular os espaçamentos EV e EH.
            </div>
          )}
        </div>
      </div>

      {/* Práticas Mecânicas e Vegetativas Especiais: Ravinas, Voçorocas e Bacias de Contenção */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Waves className="w-4 h-4 text-emerald-600" />
          <span>Controle de Erosão Severa: Voçorocas, Ravinas e Bacias de Contenção</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">1. Desvio de Enxurrada de Cabeceira</h4>
            <p className="text-slate-500 leading-relaxed">
              Construção de canal divergente ou terraço de desvio a 15-20 metros da cabeceira da voçoroca para impedir que a água superficial continue caindo no abismo erosivo.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">2. Paliçadas & Biomantas</h4>
            <p className="text-slate-500 leading-relaxed">
              Instalação de barreiras de estacas de eucalipto com bambu ou tela para reter sedimentos no fundo do sulco e estabilização de taludes verticais por suavização para 1:1.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-slate-900 dark:text-white">3. Bacias de Contenção (Caixas Secas)</h4>
            <p className="text-slate-500 leading-relaxed">
              Abertura de pequenas bacias de infiltração nas margens de estradas internas para absorver 100% da enxurrada e abastecer o lençol freático sem assoreamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
