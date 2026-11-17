import React, { useState } from 'react';
import {
  BookOpen,
  Bookmark,
  Table,
  Layers,
  Scale
} from 'lucide-react';

export const AvaliacaoBibliotecaNormasView: React.FC = () => {
  const [secaoAtiva, setSecaoAtiva] = useState<'nbr14653' | 'ross_heidecke' | 'capacidade_uso' | 'aptidao_embrapa'>('nbr14653');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Biblioteca Técnica, Tabelas Oficiais & Diretrizes Normativas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compêndio de normas ABNT NBR 14653-3, coeficientes Ross-Heidecke, classificação USDA e Embrapa
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
          Versão Consolidada 2025
        </span>
      </div>

      {/* Navegação entre seções da biblioteca */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSecaoAtiva('nbr14653')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            secaoAtiva === 'nbr14653'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <Scale className="w-4 h-4" /> ABNT NBR 14653-3:2019
        </button>

        <button
          type="button"
          onClick={() => setSecaoAtiva('ross_heidecke')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            secaoAtiva === 'ross_heidecke'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <Table className="w-4 h-4" /> Tabela Ross-Heidecke
        </button>

        <button
          type="button"
          onClick={() => setSecaoAtiva('capacidade_uso')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            secaoAtiva === 'capacidade_uso'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" /> Capacidade de Uso (USDA)
        </button>

        <button
          type="button"
          onClick={() => setSecaoAtiva('aptidao_embrapa')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            secaoAtiva === 'aptidao_embrapa'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <Bookmark className="w-4 h-4" /> Aptidão Agrícola (Embrapa)
        </button>
      </div>

      {/* Conteúdo da Seção Ativa */}
      {secaoAtiva === 'nbr14653' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">
            Estrutura da Norma ABNT NBR 14653-3: Avaliação de Imóveis Rurais
          </h3>
          <div className="text-xs text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              A <strong>NBR 14653-3</strong> fixa as diretrizes para caracterização do imóvel rural e seus componentes (terras, construções, instalações, culturas perenes e pastagens), prescrevendo a sistemática de coleta de dados de mercado, tratamento estatístico e enquadramento em graus de fundamentação e precisão.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Graus de Fundamentação (I, II e III)</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Dependem do número de dados de mercado efetivamente pesquisados, da identificação das fontes e da profundidade da caracterização das variáveis e vistorias in loco.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">Graus de Precisão (I, II e III)</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Apurados pela amplitude do intervalo de confiança de 80% em torno da estimativa de tendência central (média ou valor calculado pela regressão).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {secaoAtiva === 'ross_heidecke' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">
            Critério e Tabela de Depreciação Ross-Heidecke
          </h3>
          <div className="text-xs text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              O método de Ross-Heidecke conjuga a idade da edificação (tempo de uso em relação à vida útil econômica) com o estado aparente de conservação, por meio da equação:
            </p>
            <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-center rounded-lg text-xs">
              d = 100 - [ (100 - d_r) × (1 - K_h) ] onde d_r = 0,5 × (x + x²) e x = Idade / Vida Útil
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-2 border">Estado</th>
                    <th className="p-2 border">Classificação Técnica</th>
                    <th className="p-2 border">Coeficiente de Reparo (Kh)</th>
                    <th className="p-2 border">Intervenção Exigida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr><td className="p-2 border font-bold">A</td><td className="p-2 border">Novo / Excelente</td><td className="p-2 border">0,000</td><td className="p-2 border">Nenhum reparo necessário</td></tr>
                  <tr><td className="p-2 border font-bold">B</td><td className="p-2 border">Muito Bom</td><td className="p-2 border">0,010</td><td className="p-2 border">Pequenos retoques de pintura</td></tr>
                  <tr><td className="p-2 border font-bold">C</td><td className="p-2 border">Bom / Regular</td><td className="p-2 border">0,032</td><td className="p-2 border">Manutenção preventiva rotineira</td></tr>
                  <tr><td className="p-2 border font-bold">D</td><td className="p-2 border">Reparos Leves</td><td className="p-2 border">0,081</td><td className="p-2 border">Substituição de pequenos componentes</td></tr>
                  <tr><td className="p-2 border font-bold">E</td><td className="p-2 border">Reparos Simples</td><td className="p-2 border">0,181</td><td className="p-2 border">Revisão elétrica, hidráulica e forros</td></tr>
                  <tr><td className="p-2 border font-bold">F</td><td className="p-2 border">Reparos Importantes</td><td className="p-2 border">0,321</td><td className="p-2 border">Recuperação de alvenaria e telhado</td></tr>
                  <tr><td className="p-2 border font-bold">G</td><td className="p-2 border">Reparos Graves</td><td className="p-2 border">0,521</td><td className="p-2 border">Comprometimento estrutural severo</td></tr>
                  <tr><td className="p-2 border font-bold">H</td><td className="p-2 border">Sem Aproveitamento</td><td className="p-2 border">1,000</td><td className="p-2 border">Recomendada demolição / descarte</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {secaoAtiva === 'capacidade_uso' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">
            Classificação de Capacidade de Uso das Terras (USDA Soil Conservation Service)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <strong className="text-emerald-600 block">Grupo A: Terras Cultiváveis</strong>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                <strong>Classes I a IV:</strong> Terras aptas para lavouras anuais intensivas, com exigência crescente de práticas conservacionistas de solo (curvas de nível, bacias de retenção e plantio direto).
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700">
              <strong className="text-blue-600 block">Grupo B: Terras Adaptadas para Pastagens e Silvicultura</strong>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                <strong>Classes V a VII:</strong> Terras não apropriadas para cultivos agrícolas anuais contínuos, mas com boa aptidão para pastagens plantadas, pecuária extensiva ou reflorestamento comercial.
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700 md:col-span-2">
              <strong className="text-purple-600 block">Grupo C: Terras Impróprias para Exploração Agropecuária</strong>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                <strong>Classe VIII:</strong> Terras com limitações extremamente severas (escarpas rochosas, áreas permanentemente alagadas ou dunas), cuja vocação exclusiva é a conservação da vida silvestre e preservação ambiental.
              </p>
            </div>
          </div>
        </div>
      )}

      {secaoAtiva === 'aptidao_embrapa' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2">
            Sistema de Avaliação da Aptidão Agrícola das Terras (Embrapa Solos)
          </h3>
          <div className="text-xs text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              O sistema Embrapa classifica as terras em 6 classes de aptidão em três níveis de manejo (A - primitivo, B - intermediário com tração animal/mecanização parcial, C - avançado com alta tecnologia de fertilização e mecanização completa):
            </p>
            <ul className="space-y-2">
              <li className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-700">
                <strong>Classe 1 - Boa para Lavouras:</strong> Terras que apresentam condições ótimas para produção sustentada de culturas anuais, sem riscos graves de degradação.
              </li>
              <li className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-700">
                <strong>Classe 2 - Regular para Lavouras:</strong> Apresenta limitações moderadas que reduzem a produtividade ou elevam os custos de insumos/manejo.
              </li>
              <li className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-700">
                <strong>Classe 3 - Restrita para Lavouras:</strong> Limitações severas que exigem práticas especiais ou rotação prolongada com pastagens.
              </li>
              <li className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-700">
                <strong>Classe 4 - Apta para Pastagem Plantada:</strong> Terras não indicadas para lavouras anuais, mas produtivas para forrageiras perenes.
              </li>
              <li className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-700">
                <strong>Classe 5 - Apta para Silvicultura:</strong> Vocação para essências florestais comerciais ou proteção.
              </li>
              <li className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded border border-slate-200 dark:border-slate-700">
                <strong>Classe 6 - Preservação da Fauna e Flora:</strong> Restrita à proteção ambiental integral.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
