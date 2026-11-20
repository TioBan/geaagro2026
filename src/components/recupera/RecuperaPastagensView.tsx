import React, { useState } from 'react';
import { AreaDegradadaItem } from '../../types/recupera';
import { Leaf, Sliders, Sprout } from 'lucide-react';

interface Props {
  areaAtiva: AreaDegradadaItem;
}

const FORRAGEIRAS_CATALOGO = [
  {
    nome: 'Brachiaria brizantha cv. Marandu (Braquiarão)',
    porte: 'Cespitosa',
    fertilidade: 'Média a Alta',
    resistenciaSeca: 'Alta',
    alturaEntrada: '30-35 cm',
    alturaSaida: '15 cm',
    indicacao: 'Pastagens bem drenadas e solos corrigidos; sensível a solos encharcados.'
  },
  {
    nome: 'Brachiaria decumbens cv. Basilisk',
    porte: 'Decumbente / Estolonífera',
    fertilidade: 'Baixa a Média',
    resistenciaSeca: 'Excelente',
    alturaEntrada: '20-25 cm',
    alturaSaida: '10 cm',
    indicacao: 'Solos ácidos, declivosos e de baixa fertilidade; excelente cobertura protetora contra erosão.'
  },
  {
    nome: 'Brachiaria humidicola (Quicuio-da-Amazônia)',
    porte: 'Estolonífera rasteira',
    fertilidade: 'Muito Baixa',
    resistenciaSeca: 'Média',
    alturaEntrada: '20-25 cm',
    alturaSaida: '10 cm',
    indicacao: 'Solos arenosos, mal drenados, baixadas e sujeitos a encharcamento temporário.'
  },
  {
    nome: 'Panicum maximum cv. Mombaça',
    porte: 'Cespitosa ereta alta',
    fertilidade: 'Alta',
    resistenciaSeca: 'Média',
    alturaEntrada: '85-90 cm',
    alturaSaida: '35-40 cm',
    indicacao: 'Alta produção sob manejo rotacionado intensivo e adubação nitrogenada.'
  },
  {
    nome: 'Brachiaria ruziziensis',
    porte: 'Decumbente tenra',
    fertilidade: 'Média',
    resistenciaSeca: 'Baixa',
    alturaEntrada: '25-30 cm',
    alturaSaida: '12 cm',
    indicacao: 'Excelente para consórcio com milho safrinha (ILP) e dessecação fácil para palhada.'
  }
];

const ESTRATEGIAS_PASTO = [
  {
    key: 'reforma_total',
    titulo: '1. Reforma Total (Destruição + Replantio)',
    desc: 'Indicado para degradação severa com solo compactado, erosão e infestação maciça de invasoras (>50%). Exige escarificação, correção química total e semeadura nova.',
    indicadoQuando: 'Degradação severa e solo compactado'
  },
  {
    key: 'renovacao_direta',
    titulo: '2. Renovação Direta (Sem Destruição Plena)',
    desc: 'Indicado para pastagens com degradação intermediária (30-50% de falhas). Aplicação de adubação a lanço, controle químico seletivo de daninhas e sobressemeadura com rolo compactador.',
    indicadoQuando: 'Degradação moderada com base forrageira viva'
  },
  {
    key: 'recuperacao_manejo',
    titulo: '3. Recuperação por Manejo e Adubação',
    desc: 'Indicado quando a forrageira ainda tem estande suficiente (>70%), mas está com porte baixo e desnutrida. Aplicação de calagem superficial, adubação NPK e ajuste de lotação.',
    indicadoQuando: 'Degradação leve com falhas pontuais'
  }
] as const;

export const RecuperaPastagensView: React.FC<Props> = ({ areaAtiva }) => {
  const [metodoEstrategico, setMetodoEstrategico] =
    useState<(typeof ESTRATEGIAS_PASTO)[number]['key']>('reforma_total');
  const [forrageiraEscolhida, setForrageiraEscolhida] = useState<string>(FORRAGEIRAS_CATALOGO[0].nome);

  const forrageiraAtiva =
    FORRAGEIRAS_CATALOGO.find(f => f.nome === forrageiraEscolhida) || FORRAGEIRAS_CATALOGO[0];

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800">
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          Fase 4 • Manejo & Recuperação de Pastagens
        </span>
        <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 mt-0.5">
          <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Estratégia de Recuperação de Pastagens: {areaAtiva.nomeTalhao}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Decisão agronômica entre Reforma Total, Renovação Direta ou Manejo Intensivo, cultivares forrageiras e consórcios
        </p>
      </div>

      {/* Árvore de Decisão: Reforma vs Renovação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ESTRATEGIAS_PASTO.map(est => {
          const isSelecionada = metodoEstrategico === est.key;
          return (
            <button
              key={est.key}
              type="button"
              onClick={() => setMetodoEstrategico(est.key)}
              className={`p-4 rounded-xl border transition text-left flex flex-col justify-between ${
                isSelecionada
                  ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
              }`}
            >
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mb-1.5">{est.titulo}</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 mb-3 leading-relaxed">{est.desc}</p>
              </div>
              <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                Critério: {est.indicadoQuando}
              </div>
            </button>
          );
        })}
      </div>

      {/* Catálogo Técnico de Forrageiras Recomendadas */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <Sprout className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Catálogo Técnico de Espécies & Cultivares Forrageiras</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {FORRAGEIRAS_CATALOGO.map(f => {
            const isAtiva = forrageiraEscolhida === f.nome;
            return (
              <button
                key={f.nome}
                type="button"
                onClick={() => setForrageiraEscolhida(f.nome)}
                className={`p-3.5 rounded-lg border transition text-left text-xs space-y-1.5 ${
                  isAtiva
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-slate-50/40 dark:bg-zinc-950/40'
                }`}
              >
                <h4 className="font-semibold text-slate-900 dark:text-zinc-100">{f.nome}</h4>
                <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-snug">{f.indicacao}</p>
                <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-800 grid grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-zinc-400 tabular-nums">
                  <span>
                    Entrada: <strong className="text-slate-900 dark:text-zinc-100">{f.alturaEntrada}</strong>
                  </span>
                  <span>
                    Saída: <strong className="text-slate-900 dark:text-zinc-100">{f.alturaSaida}</strong>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Consórcio com Leguminosas & Manejo Rotacionado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-3 text-xs">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Consórcio com Leguminosas Forrageiras (Fixação de N)</span>
          </h3>
          <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
            A consorciação de gramíneas com leguminosas fixa de 40 a 120 kg N/ha/ano biologicamente, aumentando o teor proteico do pasto em até 3 a 5 pontos percentuais.
          </p>

          <div className="space-y-2 pt-1">
            <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg space-y-0.5">
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                Estilosantes Campo Grande (Stylosanthes capitata/macrocephala)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Altamente tolerante à acidez e solos arenosos do Cerrado. Semeadura de 2 a 3 kg/ha consorciada.
              </p>
            </div>
            <div className="p-3 bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800 rounded-lg space-y-0.5">
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                Calopogônio (Calopogonium mucunoides)
              </span>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Alta capacidade de cobertura e ressemeadura natural. Excelente para recuperação rápida de encostas.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-zinc-800 space-y-3 text-xs">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Regras de Manejo Rotacionado do Pasto</span>
          </h3>
          <p className="text-slate-500 dark:text-zinc-400 leading-relaxed">
            O sobrepastejo (altura de resíduo abaixo da recomendada) drena as reservas da coroa e raízes da forrageira, reiniciando o ciclo de degradação.
          </p>

          <div className="p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/70 dark:border-emerald-900/60 space-y-1.5">
            <p className="font-semibold text-emerald-900 dark:text-emerald-200">
              Recomendação para {forrageiraAtiva.nome}:
            </p>
            <ul className="space-y-1 text-emerald-800 dark:text-emerald-300 tabular-nums">
              <li>
                • Altura ideal de entrada dos animais: <strong>{forrageiraAtiva.alturaEntrada}</strong> (interceptação luminosa ~95%)
              </li>
              <li>
                • Altura mínima de saída (resíduo protetor): <strong>{forrageiraAtiva.alturaSaida}</strong> (garante rebrota vigorosa e proteção do solo)
              </li>
              <li>
                • Exigência de fertilidade: <strong>{forrageiraAtiva.fertilidade}</strong> • Tolerância à seca: <strong>{forrageiraAtiva.resistenciaSeca}</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
