import React, { useState } from 'react';
import { AreaDegradadaItem } from '../../types/recupera';
import {
  Leaf,
  Sliders,
  Sprout
} from 'lucide-react';

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

export const RecuperaPastagensView: React.FC<Props> = ({ areaAtiva }) => {
  const [metodoEstrategico, setMetodoEstrategico] = useState<'reforma_total' | 'renovacao_direta' | 'recuperacao_manejo'>('reforma_total');
  const [forrageiraEscolhida, setForrageiraEscolhida] = useState<string>(FORRAGEIRAS_CATALOGO[0].nome);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          Fase 4 • Manejo & Recuperação de Pastagens
        </span>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-600" />
          <span>Estratégia de Recuperação de Pastagens: {areaAtiva.nomeTalhao}</span>
        </h2>
        <p className="text-xs text-slate-500">
          Decisão agronômica entre Reforma Total, Renovação Direta ou Manejo Intensivo, cultivares forrageiras e consórcios
        </p>
      </div>

      {/* Árvore de Decisão: Reforma vs Renovação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
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
        ].map(est => (
          <div
            key={est.key}
            onClick={() => setMetodoEstrategico(est.key as any)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              metodoEstrategico === est.key
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-2 ring-emerald-500/20 shadow-md'
                : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 bg-white dark:bg-slate-900'
            }`}
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {est.titulo}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              {est.desc}
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              Critério: {est.indicadoQuando}
            </div>
          </div>
        ))}
      </div>

      {/* Catálogo Técnico de Forrageiras Recomendadas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>Catálogo Técnico de Espécies & Cultivares Forrageiras</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {FORRAGEIRAS_CATALOGO.map((f, idx) => (
            <div
              key={idx}
              onClick={() => setForrageiraEscolhida(f.nome)}
              className={`p-4 rounded-xl border transition cursor-pointer text-xs space-y-1.5 ${
                forrageiraEscolhida === f.nome
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-300 bg-slate-50/40 dark:bg-slate-800/40'
              }`}
            >
              <h4 className="font-bold text-slate-900 dark:text-white">{f.nome}</h4>
              <p className="text-slate-500 text-[11px] leading-tight">{f.indicacao}</p>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 gap-1 text-[10px]">
                <span>Manejo Entrada: <strong>{f.alturaEntrada}</strong></span>
                <span>Manejo Saída: <strong>{f.alturaSaida}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consórcio com Leguminosas & Manejo Rotacionado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>Consórcio com Leguminosas Forrageiras (Fixação de N)</span>
          </h3>
          <p className="text-slate-500">
            A consorciação de gramíneas com leguminosas fixa de 40 a 120 kg N/ha/ano biologicamente, aumentando o teor proteico do pasto em até 3-5 pontos percentuais.
          </p>

          <div className="space-y-2 pt-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">Estilosantes Campo Grande (Stylosanthes capitata/macrocephala)</span>
              <p className="text-[11px] text-slate-500">Altamente tolerante à acidez e solos arenosos do Cerrado. Semeadura de 2 a 3 kg/ha consorciada.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200">Calopogônio (Calopogonium mucunoides)</span>
              <p className="text-[11px] text-slate-500">Alta capacidade de cobertura e ressemeadura natural. Excelente para recuperação rápida de encostas.</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Regras de Manejo Rotacionado do Pasto</span>
          </h3>
          <p className="text-slate-500">
            O sobrepastejo (altura de resíduo abaixo da recomendada) drena as reservas da coroa e raízes da forrageira, reiniciando o ciclo de degradação.
          </p>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-1.5">
            <p className="font-bold text-emerald-900 dark:text-emerald-200">Recomendação para {forrageiraEscolhida}:</p>
            <p className="text-emerald-800 dark:text-emerald-300">
              • Altura Ideal de Entrada dos Animais: <strong>25 - 35 cm</strong> (interceptação luminosa 95%)<br />
              • Altura Mínima de Saída (Resíduo Protetor): <strong>15 cm</strong> (garante rebrota vigorosa e sombra no solo)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
