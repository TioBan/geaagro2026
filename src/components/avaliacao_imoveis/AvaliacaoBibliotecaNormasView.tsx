import React, { useState } from 'react';
import { BookOpen, Bookmark, Table, Layers, Scale } from 'lucide-react';

type SecaoKey = 'nbr14653' | 'ross_heidecke' | 'capacidade_uso' | 'aptidao_embrapa';

const SECOES_TABS: { key: SecaoKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'nbr14653', label: 'ABNT NBR 14653-3:2019', icon: Scale },
  { key: 'ross_heidecke', label: 'Tabela Ross-Heidecke', icon: Table },
  { key: 'capacidade_uso', label: 'Capacidade de Uso (USDA)', icon: Layers },
  { key: 'aptidao_embrapa', label: 'Aptidão Agrícola (Embrapa)', icon: Bookmark }
];

const ROSS_HEIDECKE_ROWS = [
  { estado: 'A', classe: 'Novo / Excelente', kh: '0,000', intervencao: 'Nenhum reparo necessário' },
  { estado: 'B', classe: 'Muito Bom', kh: '0,010', intervencao: 'Pequenos retoques de pintura' },
  { estado: 'C', classe: 'Bom / Regular', kh: '0,032', intervencao: 'Manutenção preventiva rotineira' },
  { estado: 'D', classe: 'Reparos Leves', kh: '0,081', intervencao: 'Substituição de pequenos componentes' },
  { estado: 'E', classe: 'Reparos Simples', kh: '0,181', intervencao: 'Revisão elétrica, hidráulica e forros' },
  { estado: 'F', classe: 'Reparos Importantes', kh: '0,321', intervencao: 'Recuperação de alvenaria e telhado' },
  { estado: 'G', classe: 'Reparos Graves', kh: '0,521', intervencao: 'Comprometimento estrutural severo' },
  { estado: 'H', classe: 'Sem Aproveitamento', kh: '1,000', intervencao: 'Recomendada demolição / descarte' }
];

const EMBRAPA_CLASSES = [
  {
    titulo: 'Classe 1 — Boa para Lavouras',
    desc: 'Terras que apresentam condições ótimas para produção sustentada de culturas anuais, sem riscos graves de degradação.'
  },
  {
    titulo: 'Classe 2 — Regular para Lavouras',
    desc: 'Apresenta limitações moderadas que reduzem a produtividade ou elevam os custos de insumos e manejo.'
  },
  {
    titulo: 'Classe 3 — Restrita para Lavouras',
    desc: 'Limitações severas que exigem práticas especiais ou rotação prolongada com pastagens.'
  },
  {
    titulo: 'Classe 4 — Apta para Pastagem Plantada',
    desc: 'Terras não indicadas para lavouras anuais, mas produtivas para forrageiras perenes.'
  },
  {
    titulo: 'Classe 5 — Apta para Silvicultura',
    desc: 'Vocação para essências florestais comerciais ou proteção.'
  },
  {
    titulo: 'Classe 6 — Preservação da Fauna e Flora',
    desc: 'Restrita à proteção ambiental integral.'
  }
];

export const AvaliacaoBibliotecaNormasView: React.FC = () => {
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoKey>('nbr14653');

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Biblioteca Técnica, Tabelas Oficiais & Diretrizes Normativas
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Compêndio de normas ABNT NBR 14653-3, coeficientes Ross-Heidecke, classificação USDA e Embrapa
          </p>
        </div>

        <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 w-fit shrink-0">
          Referência Consolidada
        </span>
      </div>

      {/* Navegação entre seções */}
      <div className="flex flex-wrap items-center gap-1.5">
        {SECOES_TABS.map((sec) => {
          const Icon = sec.icon;
          const isActive = secaoAtiva === sec.key;
          return (
            <button
              key={sec.key}
              type="button"
              onClick={() => setSecaoAtiva(sec.key)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200/80 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {sec.label}
            </button>
          );
        })}
      </div>

      {/* Conteúdo da Seção Ativa */}
      {secaoAtiva === 'nbr14653' && (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            Estrutura da Norma ABNT NBR 14653-3: Avaliação de Imóveis Rurais
          </h3>
          <div className="text-xs text-slate-600 dark:text-zinc-300 space-y-3 leading-relaxed">
            <p>
              A <strong className="text-slate-900 dark:text-zinc-100">NBR 14653-3</strong> fixa as diretrizes para caracterização do imóvel rural e seus componentes (terras, construções, instalações, culturas perenes e pastagens), prescrevendo a sistemática de coleta de dados de mercado, tratamento estatístico e enquadramento em graus de fundamentação e precisão.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 space-y-1.5">
                <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">
                  Graus de Fundamentação (I, II e III)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Dependem do número de dados de mercado efetivamente pesquisados, da identificação das fontes e da profundidade da caracterização das variáveis e vistorias in loco.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50/70 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800 space-y-1.5">
                <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">
                  Graus de Precisão (I, II e III)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Apurados pela amplitude do intervalo de confiança de 80% em torno da estimativa de tendência central (média ou valor calculado pela regressão).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {secaoAtiva === 'ross_heidecke' && (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            Critério e Tabela de Depreciação Ross-Heidecke
          </h3>
          <div className="text-xs text-slate-600 dark:text-zinc-300 space-y-3 leading-relaxed">
            <p>
              O método de Ross-Heidecke conjuga a idade da edificação (tempo de uso em relação à vida útil econômica) com o estado aparente de conservação, por meio da equação:
            </p>
            <div className="p-3 bg-slate-50 dark:bg-zinc-950 text-emerald-700 dark:text-emerald-400 font-mono text-center rounded-lg text-xs border border-slate-200/80 dark:border-zinc-800">
              d = 100 - [ (100 - d_r) × (1 - K_h) ] &nbsp;|&nbsp; d_r = 0,5 × (x + x²) &nbsp;|&nbsp; x = Idade / Vida Útil
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-zinc-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-zinc-950 text-slate-600 dark:text-zinc-300 border-b border-slate-200/80 dark:border-zinc-800">
                  <tr>
                    <th className="p-2.5 font-semibold">Estado</th>
                    <th className="p-2.5 font-semibold">Classificação Técnica</th>
                    <th className="p-2.5 font-semibold">Coeficiente (Kh)</th>
                    <th className="p-2.5 font-semibold">Intervenção Exigida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {ROSS_HEIDECKE_ROWS.map((row) => (
                    <tr key={row.estado} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="p-2.5 font-semibold text-emerald-700 dark:text-emerald-400">
                        {row.estado}
                      </td>
                      <td className="p-2.5 text-slate-800 dark:text-zinc-200">{row.classe}</td>
                      <td className="p-2.5 font-mono tabular-nums text-slate-700 dark:text-zinc-300">
                        {row.kh}
                      </td>
                      <td className="p-2.5 text-slate-500 dark:text-zinc-400">{row.intervencao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {secaoAtiva === 'capacidade_uso' && (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            Classificação de Capacidade de Uso das Terras (USDA)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/80 dark:border-zinc-800">
              <strong className="text-emerald-700 dark:text-emerald-400 block">
                Grupo A: Terras Cultiváveis
              </strong>
              <p className="text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                <strong className="text-slate-800 dark:text-zinc-200">Classes I a IV:</strong> Terras aptas para lavouras anuais intensivas, com exigência crescente de práticas conservacionistas (curvas de nível, bacias de retenção e plantio direto).
              </p>
            </div>
            <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/80 dark:border-zinc-800">
              <strong className="text-sky-700 dark:text-sky-400 block">
                Grupo B: Pastagens e Silvicultura
              </strong>
              <p className="text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                <strong className="text-slate-800 dark:text-zinc-200">Classes V a VII:</strong> Terras não apropriadas para cultivos anuais contínuos, mas com boa aptidão para pastagens plantadas, pecuária extensiva ou reflorestamento comercial.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50/70 dark:bg-zinc-950/60 rounded-lg border border-slate-200/80 dark:border-zinc-800 md:col-span-2">
              <strong className="text-violet-700 dark:text-violet-400 block">
                Grupo C: Conservação e Preservação
              </strong>
              <p className="text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                <strong className="text-slate-800 dark:text-zinc-200">Classe VIII:</strong> Terras com limitações extremamente severas (escarpas rochosas, áreas permanentemente alagadas ou dunas), vocacionadas à conservação da vida silvestre e preservação ambiental.
              </p>
            </div>
          </div>
        </div>
      )}

      {secaoAtiva === 'aptidao_embrapa' && (
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-slate-200/80 dark:border-zinc-800 space-y-4">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 pb-2.5">
            Sistema de Avaliação da Aptidão Agrícola das Terras (Embrapa Solos)
          </h3>
          <div className="text-xs text-slate-600 dark:text-zinc-300 space-y-3 leading-relaxed">
            <p>
              O sistema Embrapa classifica as terras em 6 classes de aptidão em três níveis de manejo (A — primitivo, B — intermediário com mecanização parcial, C — avançado com alta tecnologia de fertilização e mecanização completa):
            </p>
            <ul className="divide-y divide-slate-100 dark:divide-zinc-800 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50">
              {EMBRAPA_CLASSES.map((item) => (
                <li key={item.titulo} className="p-3">
                  <strong className="text-slate-900 dark:text-zinc-100">{item.titulo}:</strong>{' '}
                  <span className="text-slate-600 dark:text-zinc-400">{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
