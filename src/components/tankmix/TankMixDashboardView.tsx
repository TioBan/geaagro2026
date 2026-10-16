import React from 'react';
import {
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  History,
  Droplets,
  Tractor,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  FileText,
  CloudSun,
} from 'lucide-react';
import { TankMixProduct, CompatibilityRating, SprayApplicationRecord } from '../../types/tankMix';

interface Props {
  productsCount: number;
  activeMixturesCount: number;
  favoritesCount: number;
  applicationsHistory: SprayApplicationRecord[];
  activeAlertsCount: number;
  averageIcgScore: number;
  onNavigate: (tabId: string) => void;
  onLoadQuickRecipe: (recipeId: string) => void;
}

export const TankMixDashboardView: React.FC<Props> = ({
  productsCount,
  activeMixturesCount,
  favoritesCount,
  applicationsHistory,
  activeAlertsCount,
  averageIcgScore,
  onNavigate,
  onLoadQuickRecipe,
}) => {
  const getIcgBadge = (score: number) => {
    if (score >= 85) {
      return {
        label: '🟢 Compatibilidade Elevada',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-300',
        desc: 'Misturas seguras com alta estabilidade físico-química.',
      };
    }
    if (score >= 70) {
      return {
        label: '🟡 Compatibilidade Aceitável',
        color: 'bg-amber-50 text-amber-700 border-amber-300',
        desc: 'Requer atenção à ordem de mistura e agitação.',
      };
    }
    if (score >= 50) {
      return {
        label: '🟠 Restrições Severas',
        color: 'bg-orange-50 text-orange-700 border-orange-300',
        desc: 'Risco de perda de controle ou entupimento leve.',
      };
    }
    return {
      label: '🔴 Incompatível / Não Recomendada',
      color: 'bg-rose-50 text-rose-700 border-rose-300',
      desc: 'Formação de precipitados ou fitotoxicidade crítica.',
    };
  };

  const badge = getIcgBadge(averageIcgScore);

  return (
    <div className="space-y-6">
      {/* Top Banner: Disclaimer & Technical Support Statement */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-900 text-white rounded-2xl p-6 shadow-md border border-emerald-700/50 flex flex-col items-start gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30 shrink-0">
            <FlaskConical className="w-8 h-8 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mt-1">TankMix : Compatibilidade de Defensivos</h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-3xl leading-relaxed">
              Planejamento da compatibilidade físico-química e biológica de misturas em tanque, ordem de preparo de calda, diagnóstico de água, tecnologia de aplicação e rastreabilidade total por talhão.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div
          onClick={() => onNavigate('banco_produtos')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">Produtos</span>
            <FlaskConical className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{productsCount}</div>
          <p className="text-[11px] text-gray-500 mt-1">Defensivos no banco</p>
        </div>

        <div
          onClick={() => onNavigate('simulador_tanque')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">No Tanque</span>
            <Zap className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{activeMixturesCount}</div>
          <p className="text-[11px] text-gray-500 mt-1">Insumos em simulação</p>
        </div>

        <div
          onClick={() => onNavigate('simulador_tanque')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">Índice ICG</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{averageIcgScore}%</div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Compatibilidade média</p>
        </div>

        <div
          onClick={() => onNavigate('matriz_compatibilidade')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">Alertas</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{activeAlertsCount}</div>
          <p className="text-[11px] text-gray-500 mt-1">Pontos de atenção</p>
        </div>

        <div
          onClick={() => onNavigate('rastreabilidade')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">Aplicações</span>
            <Tractor className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{(applicationsHistory || []).length}</div>
          <p className="text-[11px] text-gray-500 mt-1">Registros de campo</p>
        </div>

        <div
          onClick={() => onNavigate('receitas_relatorios')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">Favoritas</span>
            <Bookmark className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{favoritesCount}</div>
          <p className="text-[11px] text-gray-500 mt-1">Receitas salvas</p>
        </div>

        <div
          onClick={() => onNavigate('qualidade_agua')}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-cyan-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-medium">Qualidade Água</span>
            <Droplets className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-extrabold text-cyan-700">pH / Ca</div>
          <p className="text-[11px] text-gray-500 mt-1">Condicionamento</p>
        </div>
      </div>

      {/* Main Grid: Quick Lab Action + Pre-configured Standard Mixes + Traceability Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: ICG Status Card & Quick Modules Navigation */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Índice de Compatibilidade GeaAgro (ICG)
              </h2>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex justify-between items-center mb-2 text-sm font-semibold">
                <span className="text-gray-700">Score de Estabilidade Geral</span>
                <span className="text-emerald-700 font-bold">{averageIcgScore} / 100</span>
              </div>
              <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    averageIcgScore >= 85
                      ? 'bg-emerald-500'
                      : averageIcgScore >= 70
                      ? 'bg-amber-500'
                      : averageIcgScore >= 50
                      ? 'bg-orange-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${averageIcgScore}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">{badge.desc}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Acessos Rápidos</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onNavigate('biblioteca_formulacoes')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 text-left text-xs font-medium text-gray-700 transition-colors"
                >
                  <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Formulações (EC/SC/WG)</span>
                </button>
                <button
                  onClick={() => onNavigate('meteorologia_aplicacao')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 text-left text-xs font-medium text-gray-700 transition-colors"
                >
                  <CloudSun className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Delta T & Vento</span>
                </button>
                <button
                  onClick={() => onNavigate('pulverizadores')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 text-left text-xs font-medium text-gray-700 transition-colors"
                >
                  <Tractor className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Pulverizadores & Bicos</span>
                </button>
                <button
                  onClick={() => onNavigate('receitas_relatorios')}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 text-left text-xs font-medium text-gray-700 transition-colors"
                >
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Laudos & Receitas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Technical Tip Card */}
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-amber-900">
            <div className="flex items-center gap-2 font-bold text-sm mb-1 text-amber-800">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Regra de Ouro: Sequência WALES</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-800">
              <strong>W</strong> (Pós/Grânulos WG/WP) &rarr; <strong>A</strong> (Agitação contínua) &rarr;{' '}
              <strong>L</strong> (Líquidos SC/CS) &rarr; <strong>E</strong> (Emulsionáveis EC/EW) &rarr;{' '}
              <strong>S</strong> (Soluções SL e Adjuvantes). Nunca despeje defensivos puros sem água prévia no tanque!
            </p>
          </div>
        </div>

        {/* Center & Right Column: Common Real Field Tank Mix Scenarios */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900 text-base">Receitas & Misturas Típicas em Campo</h2>
                <p className="text-xs text-gray-500">Selecione para carregar imediatamente no Laboratório Virtual e testar</p>
              </div>
              <button
                onClick={() => onNavigate('simulador_tanque')}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
              >
                <span>Criar Calda do Zero</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Recipe 1 */}
              <div className="p-4 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      Dessecação Soja / Milho
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      ICG: 80% (Atenção)
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Glifosato + 2,4-D + Óleo Mineral</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Controle de Buva e plantas de folha larga em dessecação pré-plantio. Risco de precipitação se a água for muito fria ou em baixo volume.
                  </p>
                </div>
                <button
                  onClick={() => onLoadQuickRecipe('recipe_dessecacao_padrao')}
                  className="mt-3 w-full text-xs font-semibold py-2 px-3 bg-white border border-emerald-500 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Carregar no Simulador</span>
                </button>
              </div>

              {/* Recipe 2 */}
              <div className="p-4 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                      Fungicida + Multissítio
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ICG: 92% (Excelente)
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Trifloxistrobina/Protioconazol + Mancozebe WG</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Manejo de Ferrugem-asiática e Mancha-alvo na Soja. Exige dispersão completa do Mancozebe antes do EC.
                  </p>
                </div>
                <button
                  onClick={() => onLoadQuickRecipe('recipe_fungicida_multissitio')}
                  className="mt-3 w-full text-xs font-semibold py-2 px-3 bg-white border border-emerald-500 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Carregar no Simulador</span>
                </button>
              </div>

              {/* Recipe 3 */}
              <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 hover:border-rose-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                      Graminicida + Auxínico
                    </span>
                    <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      ICG: 45% (Antagonismo)
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Clethodim 240 EC + 2,4-D Amina</h3>
                  <p className="text-xs text-rose-800 mt-1">
                    ALERTA: Antagonismo biológico severo! O 2,4-D bloqueia o controle de capim-amargoso pelo graminicida.
                  </p>
                </div>
                <button
                  onClick={() => onLoadQuickRecipe('recipe_antagonismo_graminicida')}
                  className="mt-3 w-full text-xs font-semibold py-2 px-3 bg-white border border-rose-500 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Analisar Incompatibilidade</span>
                </button>
              </div>

              {/* Recipe 4 */}
              <div className="p-4 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                      Inseticida + Neonicotinoide
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      ICG: 95% (Excelente)
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Clorantraniliprole + Tiametoxam/Lambda</h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Controle simultâneo de lagartas e percevejos. Formulações SC com altíssima miscibilidade e estabilidade.
                  </p>
                </div>
                <button
                  onClick={() => onLoadQuickRecipe('recipe_inseticida_duplo')}
                  className="mt-3 w-full text-xs font-semibold py-2 px-3 bg-white border border-emerald-500 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Carregar no Simulador</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Applications Traceability Log */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                Últimas Pulverizações Registradas
              </h2>
              <button
                onClick={() => onNavigate('rastreabilidade')}
                className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
              >
                <span>Ver Rastreabilidade Completa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {(applicationsHistory || []).length === 0 ? (
              <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl">
                <Tractor className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Nenhuma aplicação registrada ainda</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Ao realizar a calda no simulador, clique em "Registrar Pulverização" para criar o histórico.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {applicationsHistory.slice(0, 3).map(app => (
                  <div key={app.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{app.plotName}</span>
                        <span className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                          {app.crop} ({app.growthStage})
                        </span>
                        <span className="text-[11px] text-gray-500">{app.date}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {app.productsUsed.map(p => p.productName).join(' + ')} • Volume: {app.totalSprayVolumeLHa} L/ha
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                        ICG: {app.icgScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botão "Abrir Laboratório Virtual" na parte inferior */}
      <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 border border-emerald-600/40 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 shrink-0">
            <FlaskConical className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Laboratório Virtual &amp; Simulador Interativo</h4>
            <p className="text-xs text-slate-300">
              Simule a sequência WALES de adição de defensivos, verifique incompatibilidade física e química e registre sua calda.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('simulador_tanque')}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold px-6 py-3 rounded-xl shadow-md transition-all transform hover:scale-[1.01] cursor-pointer whitespace-nowrap"
        >
          <Zap className="w-5 h-5 text-gray-950" />
          <span>Abrir Laboratório Virtual</span>
        </button>
      </div>
    </div>
  );
};
